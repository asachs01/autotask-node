"use strict";
/**
 * In-Memory Storage Backend
 *
 * Fast in-memory queue storage for development and testing.
 * Provides full QueueStorageBackend implementation without external dependencies.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryBackend = void 0;
/**
 * In-memory queue storage backend
 */
class MemoryBackend {
    constructor(logger) {
        this.requests = new Map();
        this.batches = new Map();
        this.priorityQueues = new Map();
        this.statusIndexes = new Map();
        this.zoneIndexes = new Map();
        this.fingerprintMap = new Map();
        this.initialized = false;
        this.logger = logger;
        this.initializeIndexes();
    }
    async initialize() {
        if (this.initialized) {
            return;
        }
        this.initializeIndexes();
        this.initialized = true;
        this.logger.info('MemoryBackend initialized successfully');
    }
    async enqueue(request) {
        try {
            // Store request
            this.requests.set(request.id, { ...request });
            // Add to priority queue
            const queueKey = this.getQueueKey(request.zone);
            if (!this.priorityQueues.has(queueKey)) {
                this.priorityQueues.set(queueKey, new Map());
            }
            const priorityQueue = this.priorityQueues.get(queueKey);
            if (!priorityQueue.has(request.priority)) {
                priorityQueue.set(request.priority, new Set());
            }
            priorityQueue.get(request.priority).add(request.id);
            // Update status index
            this.addToStatusIndex(request.status, request.id);
            // Update zone index
            this.addToZoneIndex(request.zone, request.id);
            // Set fingerprint mapping
            if (request.fingerprint) {
                this.fingerprintMap.set(request.fingerprint, request.id);
            }
            this.logger.debug('Request enqueued to memory', {
                id: request.id,
                priority: request.priority,
                zone: request.zone,
            });
        }
        catch (error) {
            this.logger.error('Failed to enqueue request to memory', {
                error,
                requestId: request.id,
            });
            throw error;
        }
    }
    async dequeue(zone) {
        try {
            const queueKey = this.getQueueKey(zone);
            const priorityQueue = this.priorityQueues.get(queueKey);
            if (!priorityQueue) {
                return null;
            }
            // Find highest priority queue with pending requests
            for (let priority = 10; priority >= 1; priority--) {
                const requestIds = priorityQueue.get(priority);
                if (!requestIds || requestIds.size === 0) {
                    continue;
                }
                // Find first pending request that is ready
                for (const requestId of Array.from(requestIds)) {
                    const request = this.requests.get(requestId);
                    if (!request || request.status !== 'pending') {
                        continue;
                    }
                    // Check if scheduled time has passed
                    if (request.scheduledAt && request.scheduledAt > new Date()) {
                        continue;
                    }
                    // Remove from priority queue and update status
                    requestIds.delete(requestId);
                    this.removeFromStatusIndex('pending', requestId);
                    this.addToStatusIndex('processing', requestId);
                    request.status = 'processing';
                    this.requests.set(requestId, request);
                    this.logger.debug('Request dequeued from memory', {
                        id: request.id,
                        priority: request.priority,
                        zone: request.zone,
                    });
                    return { ...request };
                }
            }
            return null;
        }
        catch (error) {
            this.logger.error('Failed to dequeue request from memory', error);
            throw error;
        }
    }
    async peek(zone) {
        try {
            const queueKey = this.getQueueKey(zone);
            const priorityQueue = this.priorityQueues.get(queueKey);
            if (!priorityQueue) {
                return null;
            }
            // Find highest priority queue with pending requests
            for (let priority = 10; priority >= 1; priority--) {
                const requestIds = priorityQueue.get(priority);
                if (!requestIds || requestIds.size === 0) {
                    continue;
                }
                // Find first pending request that is ready
                for (const requestId of Array.from(requestIds)) {
                    const request = this.requests.get(requestId);
                    if (!request || request.status !== 'pending') {
                        continue;
                    }
                    // Check if scheduled time has passed
                    if (request.scheduledAt && request.scheduledAt > new Date()) {
                        continue;
                    }
                    return { ...request };
                }
            }
            return null;
        }
        catch (error) {
            this.logger.error('Failed to peek request from memory', error);
            throw error;
        }
    }
    async updateRequest(id, updates) {
        try {
            const request = this.requests.get(id);
            if (!request) {
                throw new Error(`Request ${id} not found`);
            }
            const oldStatus = request.status;
            // Apply updates
            Object.assign(request, updates);
            // Update status index if status changed
            if (updates.status !== undefined && oldStatus !== updates.status) {
                this.removeFromStatusIndex(oldStatus, id);
                this.addToStatusIndex(updates.status, id);
            }
            this.requests.set(id, request);
            this.logger.debug('Request updated in memory', {
                id,
                updates: Object.keys(updates),
            });
        }
        catch (error) {
            this.logger.error('Failed to update request in memory', {
                error,
                requestId: id,
            });
            throw error;
        }
    }
    async remove(id) {
        try {
            const request = this.requests.get(id);
            if (!request) {
                return false;
            }
            // Remove from all indexes
            this.requests.delete(id);
            // Remove from priority queue
            const queueKey = this.getQueueKey(request.zone);
            const priorityQueue = this.priorityQueues.get(queueKey);
            if (priorityQueue) {
                const requestIds = priorityQueue.get(request.priority);
                if (requestIds) {
                    requestIds.delete(id);
                }
            }
            // Remove from status index
            this.removeFromStatusIndex(request.status, id);
            // Remove from zone index
            this.removeFromZoneIndex(request.zone, id);
            // Remove fingerprint mapping
            if (request.fingerprint) {
                this.fingerprintMap.delete(request.fingerprint);
            }
            this.logger.debug('Request removed from memory', { id });
            return true;
        }
        catch (error) {
            this.logger.error('Failed to remove request from memory', {
                error,
                requestId: id,
            });
            throw error;
        }
    }
    async getRequest(id) {
        try {
            const request = this.requests.get(id);
            return request ? { ...request } : null;
        }
        catch (error) {
            this.logger.error('Failed to get request from memory', {
                error,
                requestId: id,
            });
            throw error;
        }
    }
    async getRequests(filter) {
        try {
            let candidateIds = [];
            // Get candidate IDs based on filters
            if (filter.status) {
                const statusArray = Array.isArray(filter.status)
                    ? filter.status
                    : [filter.status];
                const statusSets = statusArray.map(status => this.statusIndexes.get(status) || new Set());
                const combined = new Set();
                statusSets.forEach(set => Array.from(set).forEach(id => combined.add(id)));
                candidateIds = Array.from(combined);
            }
            else if (filter.zone) {
                const zoneSet = this.zoneIndexes.get(filter.zone);
                candidateIds = zoneSet ? Array.from(zoneSet) : [];
            }
            else {
                candidateIds = Array.from(this.requests.keys());
            }
            if (candidateIds.length === 0) {
                return [];
            }
            // Get request data for all candidates
            let results = candidateIds
                .map(id => this.requests.get(id))
                .filter((req) => req !== null);
            // Apply additional filters
            if (filter.endpoint) {
                results = results.filter(req => req.endpoint === filter.endpoint);
            }
            if (filter.priority) {
                if (filter.priority.min !== undefined) {
                    results = results.filter(req => req.priority >= filter.priority.min);
                }
                if (filter.priority.max !== undefined) {
                    results = results.filter(req => req.priority <= filter.priority.max);
                }
            }
            if (filter.createdAfter) {
                results = results.filter(req => req.createdAt >= filter.createdAfter);
            }
            if (filter.createdBefore) {
                results = results.filter(req => req.createdAt <= filter.createdBefore);
            }
            if (filter.scheduledAfter) {
                results = results.filter(req => req.scheduledAt && req.scheduledAt >= filter.scheduledAfter);
            }
            if (filter.scheduledBefore) {
                results = results.filter(req => req.scheduledAt && req.scheduledAt <= filter.scheduledBefore);
            }
            // Sort results
            if (filter.sort) {
                results.sort((a, b) => {
                    const field = filter.sort.field;
                    const direction = filter.sort.direction === 'asc' ? 1 : -1;
                    let aVal, bVal;
                    switch (field) {
                        case 'createdAt':
                            aVal = a.createdAt.getTime();
                            bVal = b.createdAt.getTime();
                            break;
                        case 'scheduledAt':
                            aVal = a.scheduledAt?.getTime() || 0;
                            bVal = b.scheduledAt?.getTime() || 0;
                            break;
                        case 'priority':
                            aVal = a.priority;
                            bVal = b.priority;
                            break;
                        case 'retryCount':
                            aVal = a.retryCount;
                            bVal = b.retryCount;
                            break;
                        default:
                            return 0;
                    }
                    return aVal < bVal ? -direction : aVal > bVal ? direction : 0;
                });
            }
            // Apply pagination
            const startIndex = filter.offset || 0;
            const endIndex = filter.limit ? startIndex + filter.limit : undefined;
            return results.slice(startIndex, endIndex).map(req => ({ ...req }));
        }
        catch (error) {
            this.logger.error('Failed to get requests from memory', error);
            throw error;
        }
    }
    async size(zone) {
        try {
            if (zone) {
                const zoneSet = this.zoneIndexes.get(zone);
                return zoneSet ? zoneSet.size : 0;
            }
            // Count all pending and processing requests
            const pendingCount = this.statusIndexes.get('pending')?.size || 0;
            const processingCount = this.statusIndexes.get('processing')?.size || 0;
            return pendingCount + processingCount;
        }
        catch (error) {
            this.logger.error('Failed to get queue size from memory', error);
            throw error;
        }
    }
    async clear(zone) {
        try {
            if (zone) {
                const requestIds = this.zoneIndexes.get(zone);
                if (!requestIds || requestIds.size === 0) {
                    return 0;
                }
                let removed = 0;
                for (const id of Array.from(requestIds)) {
                    const success = await this.remove(id);
                    if (success) {
                        removed++;
                    }
                }
                return removed;
            }
            // Clear all requests
            const count = this.requests.size;
            this.requests.clear();
            this.batches.clear();
            this.priorityQueues.clear();
            this.fingerprintMap.clear();
            this.initializeIndexes();
            return count;
        }
        catch (error) {
            this.logger.error('Failed to clear queue in memory', error);
            throw error;
        }
    }
    async storeBatch(batch) {
        try {
            this.batches.set(batch.id, { ...batch });
            this.logger.debug('Batch stored in memory', { batchId: batch.id });
        }
        catch (error) {
            this.logger.error('Failed to store batch in memory', {
                error,
                batchId: batch.id,
            });
            throw error;
        }
    }
    async getReadyBatches() {
        try {
            const now = Date.now();
            const readyBatches = [];
            for (const batch of Array.from(this.batches.values())) {
                if (batch.status === 'ready' ||
                    (batch.status === 'collecting' &&
                        now - batch.createdAt.getTime() > batch.timeout)) {
                    readyBatches.push({ ...batch });
                }
            }
            return readyBatches;
        }
        catch (error) {
            this.logger.error('Failed to get ready batches from memory', error);
            throw error;
        }
    }
    async updateBatch(id, updates) {
        try {
            const batch = this.batches.get(id);
            if (!batch) {
                throw new Error(`Batch ${id} not found`);
            }
            Object.assign(batch, updates);
            this.batches.set(id, batch);
        }
        catch (error) {
            this.logger.error('Failed to update batch in memory', {
                error,
                batchId: id,
            });
            throw error;
        }
    }
    async getMetrics() {
        try {
            // Get status counts
            const statusDistribution = new Map();
            for (const [status, ids] of Array.from(this.statusIndexes.entries())) {
                statusDistribution.set(status, ids.size);
            }
            // Get priority distribution
            const priorityDistribution = new Map();
            for (const priorityQueue of Array.from(this.priorityQueues.values())) {
                for (const [priority, ids] of Array.from(priorityQueue.entries())) {
                    const current = priorityDistribution.get(priority) || 0;
                    priorityDistribution.set(priority, current + ids.size);
                }
            }
            const totalRequests = this.requests.size;
            const successfulRequests = statusDistribution.get('completed') || 0;
            const failedRequests = statusDistribution.get('failed') || 0;
            const queuedRequests = statusDistribution.get('pending') || 0;
            const processingRequests = statusDistribution.get('processing') || 0;
            const metrics = {
                totalRequests,
                successfulRequests,
                failedRequests,
                queuedRequests,
                processingRequests,
                averageProcessingTime: 0,
                averageQueueTime: 0,
                queueUtilization: 0,
                throughput: 0,
                errorRate: 0,
                batchStats: {
                    totalBatches: this.batches.size,
                    averageBatchSize: 0,
                    averageBatchTime: 0,
                },
                priorityDistribution,
                statusDistribution,
                lastUpdated: new Date(),
            };
            // Calculate error rate
            const totalFinished = successfulRequests + failedRequests;
            metrics.errorRate =
                totalFinished > 0 ? failedRequests / totalFinished : 0;
            return metrics;
        }
        catch (error) {
            this.logger.error('Failed to get metrics from memory', error);
            throw error;
        }
    }
    async maintenance() {
        try {
            // Clean up expired requests
            const now = Date.now();
            const expired = [];
            for (const [id, request] of Array.from(this.requests.entries())) {
                if (request.scheduledAt &&
                    request.scheduledAt.getTime() + request.timeout < now) {
                    expired.push(id);
                }
            }
            for (const id of expired) {
                await this.remove(id);
            }
            // Clean up empty priority queues
            for (const [queueKey, priorityQueue] of Array.from(this.priorityQueues.entries())) {
                for (const [priority, ids] of Array.from(priorityQueue.entries())) {
                    if (ids.size === 0) {
                        priorityQueue.delete(priority);
                    }
                }
                if (priorityQueue.size === 0) {
                    this.priorityQueues.delete(queueKey);
                }
            }
            this.logger.debug('Memory backend maintenance completed', {
                expiredRequests: expired.length,
            });
        }
        catch (error) {
            this.logger.error('Memory maintenance failed', error);
        }
    }
    async close() {
        this.logger.debug('MemoryBackend closed');
    }
    initializeIndexes() {
        this.statusIndexes = new Map([
            ['pending', new Set()],
            ['processing', new Set()],
            ['completed', new Set()],
            ['failed', new Set()],
            ['retrying', new Set()],
            ['expired', new Set()],
            ['cancelled', new Set()],
            ['deferred', new Set()],
        ]);
    }
    getQueueKey(zone) {
        return zone || 'default';
    }
    addToStatusIndex(status, id) {
        if (!this.statusIndexes.has(status)) {
            this.statusIndexes.set(status, new Set());
        }
        this.statusIndexes.get(status).add(id);
    }
    removeFromStatusIndex(status, id) {
        const statusSet = this.statusIndexes.get(status);
        if (statusSet) {
            statusSet.delete(id);
        }
    }
    addToZoneIndex(zone, id) {
        if (!this.zoneIndexes.has(zone)) {
            this.zoneIndexes.set(zone, new Set());
        }
        this.zoneIndexes.get(zone).add(id);
    }
    removeFromZoneIndex(zone, id) {
        const zoneSet = this.zoneIndexes.get(zone);
        if (zoneSet) {
            zoneSet.delete(id);
        }
    }
}
exports.MemoryBackend = MemoryBackend;
//# sourceMappingURL=MemoryBackend.js.map