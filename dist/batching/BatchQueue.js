"use strict";
/**
 * Batch Queue Implementation
 *
 * Manages queuing and organization of batch requests with:
 * - Priority-based ordering
 * - Zone and endpoint grouping
 * - Memory and persistence management
 * - Queue monitoring and health checks
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchQueue = void 0;
const events_1 = require("events");
/**
 * BatchQueue manages the queuing and processing order of batch requests
 */
class BatchQueue extends events_1.EventEmitter {
    constructor(config, logger) {
        super();
        // Queue storage
        this.pendingQueue = new Map();
        this.processingQueue = new Map();
        this.completedQueue = new Map();
        // Priority queues for efficient ordering
        this.priorityQueues = new Map();
        // Zone and endpoint organization
        this.zoneQueues = new Map();
        this.endpointQueues = new Map();
        // Statistics and monitoring
        this.stats = {
            totalBatches: 0,
            pendingBatches: 0,
            processingBatches: 0,
            completedBatches: 0,
            failedBatches: 0,
            averageWaitTime: 0,
            averageProcessingTime: 0,
            memoryUsage: 0,
            queueUtilization: 0
        };
        this.processingTimes = new Map();
        this.isShuttingDown = false;
        this.config = {
            maxConcurrentBatches: config.maxConcurrentBatches ?? 10,
            processingStrategy: config.processingStrategy ?? 'priority',
            persistent: config.persistent ?? false,
            limits: {
                maxQueueSize: config.limits?.maxQueueSize ?? 1000,
                warningThreshold: config.limits?.warningThreshold ?? 800,
                memoryLimit: config.limits?.memoryLimit ?? 100 * 1024 * 1024, // 100MB
                ...config.limits
            },
            ...config
        };
        this.logger = logger;
        // Start monitoring
        this.startMonitoring();
    }
    /**
     * Enqueue a batch for processing
     */
    async enqueue(batch) {
        if (this.isShuttingDown) {
            throw new Error('Queue is shutting down');
        }
        // Check queue limits
        if (this.pendingQueue.size >= this.config.limits.maxQueueSize) {
            this.emit('queue.full', { queueSize: this.pendingQueue.size });
            throw new Error(`Queue full: ${this.pendingQueue.size}/${this.config.limits.maxQueueSize}`);
        }
        // Check memory limits
        const currentMemory = this.estimateMemoryUsage();
        if (currentMemory >= this.config.limits.memoryLimit) {
            this.emit('memory.limit', { memoryUsage: currentMemory });
            throw new Error(`Memory limit exceeded: ${currentMemory}/${this.config.limits.memoryLimit} bytes`);
        }
        // Create queue entry
        const entry = {
            batch,
            timestamp: new Date(),
            priority: batch.priority,
            retryCount: 0
        };
        // Add to pending queue
        this.pendingQueue.set(batch.id, entry);
        this.stats.totalBatches++;
        this.stats.pendingBatches++;
        // Update organization indexes
        this.addToPriorityQueue(batch.id, batch.priority);
        this.addToZoneQueue(batch.id, batch.zone);
        this.addToEndpointQueue(batch.id, batch.endpoint);
        this.logger.debug('Batch enqueued', {
            batchId: batch.id,
            priority: batch.priority,
            zone: batch.zone,
            endpoint: batch.endpoint,
            queueSize: this.pendingQueue.size
        });
        // Emit events
        this.emitEvent('batch.enqueued', {
            batchId: batch.id,
            queueSize: this.pendingQueue.size,
            priority: batch.priority
        });
        // Check warning threshold
        if (this.pendingQueue.size >= this.config.limits.warningThreshold) {
            this.emit('queue.warning', { queueSize: this.pendingQueue.size });
        }
    }
    /**
     * Dequeue the next batch for processing
     */
    async dequeue() {
        if (this.pendingQueue.size === 0) {
            return null;
        }
        // Check if we can process more batches
        if (this.processingQueue.size >= this.config.maxConcurrentBatches) {
            return null;
        }
        // Select next batch based on strategy
        const nextBatchId = this.selectNextBatch();
        if (!nextBatchId) {
            return null;
        }
        // Move from pending to processing
        const entry = this.pendingQueue.get(nextBatchId);
        if (!entry) {
            return null;
        }
        this.pendingQueue.delete(nextBatchId);
        this.processingQueue.set(nextBatchId, { ...entry, lastAttempt: new Date() });
        // Update stats
        this.stats.pendingBatches--;
        this.stats.processingBatches++;
        // Remove from organization indexes
        this.removeFromPriorityQueue(nextBatchId, entry.priority);
        this.removeFromZoneQueue(nextBatchId, entry.batch.zone);
        this.removeFromEndpointQueue(nextBatchId, entry.batch.endpoint);
        // Track processing start time
        this.processingTimes.set(nextBatchId, Date.now());
        this.logger.debug('Batch dequeued for processing', {
            batchId: nextBatchId,
            priority: entry.priority,
            waitTime: Date.now() - entry.timestamp.getTime()
        });
        this.emitEvent('batch.dequeued', {
            batchId: nextBatchId,
            waitTime: Date.now() - entry.timestamp.getTime()
        });
        return entry.batch;
    }
    /**
     * Mark batch as completed
     */
    async complete(batchId, success) {
        const entry = this.processingQueue.get(batchId);
        if (!entry) {
            this.logger.warn('Attempted to complete unknown batch', { batchId });
            return;
        }
        // Move to completed queue
        this.processingQueue.delete(batchId);
        this.completedQueue.set(batchId, entry);
        // Update stats
        this.stats.processingBatches--;
        if (success) {
            this.stats.completedBatches++;
        }
        else {
            this.stats.failedBatches++;
        }
        // Track processing time
        const startTime = this.processingTimes.get(batchId);
        if (startTime) {
            const processingTime = Date.now() - startTime;
            this.updateProcessingTimeStats(processingTime);
            this.processingTimes.delete(batchId);
        }
        this.logger.debug('Batch completed', {
            batchId,
            success,
            processingTime: startTime ? Date.now() - startTime : undefined
        });
        this.emitEvent(success ? 'batch.completed' : 'batch.failed', {
            batchId,
            success
        });
        // Cleanup old completed entries
        this.cleanupCompletedEntries();
    }
    /**
     * Retry a failed batch
     */
    async retry(batchId, maxRetries = 3) {
        // Check if batch is in completed (failed) queue
        const entry = this.completedQueue.get(batchId);
        if (!entry) {
            return false;
        }
        // Check retry count
        if (entry.retryCount >= maxRetries) {
            this.logger.warn('Batch exceeded retry limit', {
                batchId,
                retryCount: entry.retryCount,
                maxRetries
            });
            return false;
        }
        // Move back to pending queue
        this.completedQueue.delete(batchId);
        const retryEntry = {
            ...entry,
            retryCount: entry.retryCount + 1,
            timestamp: new Date(), // Update timestamp for retry
            lastAttempt: new Date()
        };
        this.pendingQueue.set(batchId, retryEntry);
        // Update organization indexes
        this.addToPriorityQueue(batchId, entry.priority);
        this.addToZoneQueue(batchId, entry.batch.zone);
        this.addToEndpointQueue(batchId, entry.batch.endpoint);
        // Update stats
        this.stats.pendingBatches++;
        this.stats.failedBatches--; // Remove from failed count as we're retrying
        this.logger.info('Batch queued for retry', {
            batchId,
            retryCount: retryEntry.retryCount,
            maxRetries
        });
        this.emitEvent('batch.retry', {
            batchId,
            retryCount: retryEntry.retryCount
        });
        return true;
    }
    /**
     * Get queue statistics
     */
    getStats() {
        this.updateStats();
        return { ...this.stats };
    }
    /**
     * Get batches by zone
     */
    getBatchesByZone(zone) {
        const batchIds = this.zoneQueues.get(zone);
        if (!batchIds) {
            return [];
        }
        return Array.from(batchIds)
            .map(id => this.pendingQueue.get(id)?.batch)
            .filter((batch) => batch !== undefined);
    }
    /**
     * Get batches by endpoint
     */
    getBatchesByEndpoint(endpoint) {
        const batchIds = this.endpointQueues.get(endpoint);
        if (!batchIds) {
            return [];
        }
        return Array.from(batchIds)
            .map(id => this.pendingQueue.get(id)?.batch)
            .filter((batch) => batch !== undefined);
    }
    /**
     * Remove a batch from the queue
     */
    async remove(batchId) {
        // Try to find and remove from pending queue
        const pendingEntry = this.pendingQueue.get(batchId);
        if (pendingEntry) {
            this.pendingQueue.delete(batchId);
            this.stats.pendingBatches--;
            // Remove from indexes
            this.removeFromPriorityQueue(batchId, pendingEntry.priority);
            this.removeFromZoneQueue(batchId, pendingEntry.batch.zone);
            this.removeFromEndpointQueue(batchId, pendingEntry.batch.endpoint);
            this.emitEvent('batch.removed', { batchId });
            return true;
        }
        // Cannot remove from processing queue (in progress)
        if (this.processingQueue.has(batchId)) {
            this.logger.warn('Cannot remove batch currently being processed', { batchId });
            return false;
        }
        // Remove from completed queue
        if (this.completedQueue.delete(batchId)) {
            this.emitEvent('batch.removed', { batchId });
            return true;
        }
        return false;
    }
    /**
     * Clear all pending batches
     */
    async clear() {
        const count = this.pendingQueue.size;
        // Clear all queues and indexes
        this.pendingQueue.clear();
        this.priorityQueues.clear();
        this.zoneQueues.clear();
        this.endpointQueues.clear();
        // Update stats
        this.stats.pendingBatches = 0;
        this.logger.info('Queue cleared', { batchesCleared: count });
        this.emitEvent('queue.cleared', { batchesCleared: count });
        return count;
    }
    /**
     * Get queue health status
     */
    getHealth() {
        const stats = this.getStats();
        let status = 'healthy';
        let message = '';
        // Check queue utilization
        if (stats.queueUtilization > 0.9) {
            status = 'critical';
            message = 'Queue nearly full';
        }
        else if (stats.queueUtilization > 0.8) {
            status = 'degraded';
            message = 'High queue utilization';
        }
        // Check memory usage
        if (stats.memoryUsage > this.config.limits.memoryLimit * 0.9) {
            status = 'critical';
            message = 'Memory limit nearly exceeded';
        }
        // Check processing capacity
        if (this.processingQueue.size >= this.config.maxConcurrentBatches) {
            if (status !== 'critical') {
                status = 'degraded';
                message = 'At maximum processing capacity';
            }
        }
        return {
            status,
            message,
            details: {
                ...stats,
                maxConcurrentBatches: this.config.maxConcurrentBatches,
                memoryLimit: this.config.limits.memoryLimit,
                isShuttingDown: this.isShuttingDown
            }
        };
    }
    /**
     * Shutdown the queue gracefully
     */
    async shutdown() {
        this.isShuttingDown = true;
        this.logger.info('Starting queue shutdown', {
            pendingBatches: this.pendingQueue.size,
            processingBatches: this.processingQueue.size
        });
        // Wait for processing batches to complete (with timeout)
        const shutdownTimeout = 30000; // 30 seconds
        const startTime = Date.now();
        while (this.processingQueue.size > 0 && Date.now() - startTime < shutdownTimeout) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (this.processingQueue.size > 0) {
            this.logger.warn('Force shutting down with batches still processing', {
                processingBatches: this.processingQueue.size
            });
        }
        // Clear all queues
        await this.clear();
        this.processingQueue.clear();
        this.completedQueue.clear();
        this.processingTimes.clear();
        this.removeAllListeners();
        this.logger.info('Queue shutdown complete');
    }
    /**
     * Select next batch based on processing strategy
     */
    selectNextBatch() {
        switch (this.config.processingStrategy) {
            case 'priority':
                return this.selectByPriority();
            case 'fifo':
                return this.selectByFifo();
            case 'round-robin':
                return this.selectByRoundRobin();
            case 'least-load':
                return this.selectByLeastLoad();
            default:
                return this.selectByPriority();
        }
    }
    selectByPriority() {
        // Find highest priority with available batches
        const priorities = Array.from(this.priorityQueues.keys()).sort((a, b) => b - a);
        for (const priority of priorities) {
            const batchIds = this.priorityQueues.get(priority);
            if (batchIds && batchIds.size > 0) {
                // Return the oldest batch of this priority
                const sortedIds = Array.from(batchIds).sort((a, b) => {
                    const entryA = this.pendingQueue.get(a);
                    const entryB = this.pendingQueue.get(b);
                    if (!entryA || !entryB)
                        return 0;
                    return entryA.timestamp.getTime() - entryB.timestamp.getTime();
                });
                return sortedIds[0];
            }
        }
        return null;
    }
    selectByFifo() {
        if (this.pendingQueue.size === 0)
            return null;
        const entries = Array.from(this.pendingQueue.entries());
        entries.sort(([, a], [, b]) => a.timestamp.getTime() - b.timestamp.getTime());
        return entries[0]?.[0] ?? null;
    }
    selectByRoundRobin() {
        // Simple round-robin by zone (can be extended)
        const zones = Array.from(this.zoneQueues.keys());
        if (zones.length === 0)
            return null;
        // Get zone with batches (starting from random position for fairness)
        const startIndex = Math.floor(Math.random() * zones.length);
        for (let i = 0; i < zones.length; i++) {
            const zoneIndex = (startIndex + i) % zones.length;
            const zone = zones[zoneIndex];
            const batchIds = this.zoneQueues.get(zone);
            if (batchIds && batchIds.size > 0) {
                return Array.from(batchIds)[0];
            }
        }
        return null;
    }
    selectByLeastLoad() {
        // Select from zone/endpoint with least current load
        const zoneLoads = new Map();
        // Calculate current load per zone
        for (const [batchId, entry] of this.processingQueue) {
            const currentLoad = zoneLoads.get(entry.batch.zone) ?? 0;
            zoneLoads.set(entry.batch.zone, currentLoad + 1);
        }
        // Find zone with minimum load that has pending batches
        let minLoad = Infinity;
        let selectedZone = null;
        for (const [zone, batchIds] of this.zoneQueues) {
            if (batchIds.size > 0) {
                const load = zoneLoads.get(zone) ?? 0;
                if (load < minLoad) {
                    minLoad = load;
                    selectedZone = zone;
                }
            }
        }
        if (selectedZone) {
            const batchIds = this.zoneQueues.get(selectedZone);
            return batchIds ? Array.from(batchIds)[0] : null;
        }
        return null;
    }
    // Organization index management methods
    addToPriorityQueue(batchId, priority) {
        if (!this.priorityQueues.has(priority)) {
            this.priorityQueues.set(priority, new Set());
        }
        this.priorityQueues.get(priority).add(batchId);
    }
    removeFromPriorityQueue(batchId, priority) {
        const queue = this.priorityQueues.get(priority);
        if (queue) {
            queue.delete(batchId);
            if (queue.size === 0) {
                this.priorityQueues.delete(priority);
            }
        }
    }
    addToZoneQueue(batchId, zone) {
        if (!this.zoneQueues.has(zone)) {
            this.zoneQueues.set(zone, new Set());
        }
        this.zoneQueues.get(zone).add(batchId);
    }
    removeFromZoneQueue(batchId, zone) {
        const queue = this.zoneQueues.get(zone);
        if (queue) {
            queue.delete(batchId);
            if (queue.size === 0) {
                this.zoneQueues.delete(zone);
            }
        }
    }
    addToEndpointQueue(batchId, endpoint) {
        if (!this.endpointQueues.has(endpoint)) {
            this.endpointQueues.set(endpoint, new Set());
        }
        this.endpointQueues.get(endpoint).add(batchId);
    }
    removeFromEndpointQueue(batchId, endpoint) {
        const queue = this.endpointQueues.get(endpoint);
        if (queue) {
            queue.delete(batchId);
            if (queue.size === 0) {
                this.endpointQueues.delete(endpoint);
            }
        }
    }
    // Statistics and monitoring methods
    updateStats() {
        const now = Date.now();
        // Calculate queue utilization
        this.stats.queueUtilization = this.pendingQueue.size / this.config.limits.maxQueueSize;
        // Calculate average wait time
        let totalWaitTime = 0;
        let waitingBatches = 0;
        for (const entry of this.pendingQueue.values()) {
            totalWaitTime += now - entry.timestamp.getTime();
            waitingBatches++;
        }
        this.stats.averageWaitTime = waitingBatches > 0 ? totalWaitTime / waitingBatches : 0;
        // Estimate memory usage
        this.stats.memoryUsage = this.estimateMemoryUsage();
    }
    updateProcessingTimeStats(processingTime) {
        // Simple moving average of processing times
        const alpha = 0.1; // Smoothing factor
        if (this.stats.averageProcessingTime === 0) {
            this.stats.averageProcessingTime = processingTime;
        }
        else {
            this.stats.averageProcessingTime =
                alpha * processingTime + (1 - alpha) * this.stats.averageProcessingTime;
        }
    }
    estimateMemoryUsage() {
        // Rough estimation of memory usage
        const avgBatchSize = 1000; // Approximate bytes per batch
        return (this.pendingQueue.size + this.processingQueue.size + this.completedQueue.size) * avgBatchSize;
    }
    cleanupCompletedEntries() {
        // Keep only recent completed entries (last 1000)
        if (this.completedQueue.size > 1000) {
            const entries = Array.from(this.completedQueue.entries());
            entries.sort(([, a], [, b]) => b.timestamp.getTime() - a.timestamp.getTime());
            // Keep only the 1000 most recent
            const toKeep = entries.slice(0, 1000);
            this.completedQueue.clear();
            for (const [id, entry] of toKeep) {
                this.completedQueue.set(id, entry);
            }
        }
    }
    startMonitoring() {
        // Update stats every 30 seconds
        setInterval(() => {
            this.updateStats();
            // Emit stats for monitoring
            this.emitEvent('stats.updated', this.stats);
        }, 30000);
    }
    emitEvent(type, data) {
        const event = {
            type,
            timestamp: new Date(),
            data
        };
        this.emit(type, event);
        this.emit('event', event);
    }
}
exports.BatchQueue = BatchQueue;
//# sourceMappingURL=BatchQueue.js.map