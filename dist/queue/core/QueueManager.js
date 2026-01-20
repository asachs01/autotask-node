"use strict";
/**
 * Advanced Queue Manager
 *
 * Enterprise-grade queue management system with comprehensive features:
 * - Multi-backend persistence (Redis, SQLite, Memory)
 * - Priority-based request scheduling
 * - Intelligent batching and deduplication
 * - Circuit breaker patterns and retry strategies
 * - Real-time monitoring and health checks
 * - Graceful degradation and load shedding
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueManager = void 0;
const events_1 = require("events");
const winston_1 = __importDefault(require("winston"));
const crypto_1 = __importDefault(require("crypto"));
const MemoryBackend_1 = require("../backends/MemoryBackend");
const SQLiteBackend_1 = require("../backends/SQLiteBackend");
const RedisBackend_1 = require("../backends/RedisBackend");
const PriorityScheduler_1 = require("../strategies/PriorityScheduler");
const CircuitBreakerManager_1 = require("../strategies/CircuitBreakerManager");
const BatchManager_1 = require("../strategies/BatchManager");
const QueueMonitor_1 = require("../monitoring/QueueMonitor");
/**
 * Advanced queue manager with enterprise features
 */
class QueueManager extends events_1.EventEmitter {
    constructor(options) {
        super();
        // Processing state
        this.isProcessing = false;
        this.isShuttingDown = false;
        // Request tracking
        this.activeRequests = new Map();
        this.requestDeduplication = new Map(); // fingerprint -> requestId
        this.scheduledRequests = new Map();
        this.config = this.buildConfiguration(options.config);
        this.logger = options.logger || winston_1.default.createLogger({
            level: 'info',
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
            transports: [new winston_1.default.transports.Console()]
        });
        this.processors = options.processors || new Map();
        this.initializeMetrics();
        this.logger.info('Initializing QueueManager', {
            backend: this.config.persistence.backend,
            maxSize: this.config.maxSize,
            batchingEnabled: this.config.batchingEnabled
        });
    }
    /**
     * Initialize the queue manager
     */
    async initialize() {
        try {
            // Initialize storage backend
            this.backend = await this.createBackend();
            await this.backend.initialize();
            // Initialize scheduler
            this.scheduler = new PriorityScheduler_1.PriorityScheduler(this.config.strategies);
            // Initialize circuit breaker
            this.circuitBreaker = new CircuitBreakerManager_1.CircuitBreakerManager(this.config.strategies.circuitBreaker, this.logger);
            // Initialize batch manager
            this.batchManager = new BatchManager_1.BatchManager(this.config.maxBatchSize, this.config.batchTimeout, this.logger);
            // Initialize monitoring
            if (this.config.name !== 'test') {
                this.monitor = new QueueMonitor_1.QueueMonitor(this, this.logger);
                await this.monitor.initialize();
            }
            // Start processing
            this.startProcessing();
            this.startMaintenance();
            this.startMetricsCollection();
            this.emit('initialized');
            this.logger.info('QueueManager initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize QueueManager', error);
            throw error;
        }
    }
    /**
     * Enqueue a request with advanced features
     */
    async enqueue(endpoint, method, zone, options = {}) {
        // Validate queue capacity
        const currentSize = await this.backend.size();
        if (currentSize >= this.config.maxSize) {
            await this.handleQueueFull();
        }
        // Generate request fingerprint for deduplication
        const fingerprint = this.generateFingerprint(endpoint, method, zone, options.data);
        // Check for duplicate requests
        if (this.config.deduplicationEnabled && this.requestDeduplication.has(fingerprint)) {
            const existingId = this.requestDeduplication.get(fingerprint);
            this.logger.debug('Duplicate request detected', { fingerprint, existingId });
            // Return promise for existing request
            const existing = this.activeRequests.get(existingId);
            if (existing) {
                return existing.promise;
            }
        }
        // Create request
        const request = {
            id: this.generateRequestId(),
            endpoint,
            method,
            zone,
            priority: options.priority || 5,
            data: options.data,
            headers: options.headers,
            createdAt: new Date(),
            scheduledAt: options.scheduledAt,
            timeout: options.timeout || this.config.defaultTimeout,
            maxRetries: options.maxRetries || this.config.defaultRetries,
            retryCount: 0,
            retryable: options.retryable !== false,
            batchable: options.batchable || false,
            metadata: options.metadata || {},
            status: 'pending',
            executionHistory: [],
            fingerprint
        };
        return new Promise((resolve, reject) => {
            // Store promise for tracking
            this.activeRequests.set(request.id, {
                startTime: new Date(),
                promise: new Promise((res, rej) => {
                    request.resolve = res;
                    request.reject = rej;
                })
            });
            // Set up timeout
            const timeoutHandle = setTimeout(() => {
                this.handleRequestTimeout(request.id);
                reject(new Error(`Request ${request.id} timed out in queue`));
            }, request.timeout);
            // Store timeout handle
            this.scheduledRequests.set(request.id, timeoutHandle);
            // Handle deduplication
            if (this.config.deduplicationEnabled) {
                this.requestDeduplication.set(fingerprint, request.id);
                setTimeout(() => {
                    this.requestDeduplication.delete(fingerprint);
                }, this.config.deduplicationWindow);
            }
            // Store request in backend
            this.backend.enqueue(request).then(() => {
                this.emit('request.enqueued', { request });
                this.logger.debug('Request enqueued', {
                    id: request.id,
                    endpoint,
                    method,
                    zone,
                    priority: request.priority
                });
                // Handle batching
                if (this.config.batchingEnabled && request.batchable) {
                    this.batchManager.addRequest(request);
                }
                resolve(this.activeRequests.get(request.id).promise);
            }).catch(error => {
                this.cleanupRequest(request.id);
                reject(error);
            });
        });
    }
    /**
     * Process requests from the queue
     */
    async processNext() {
        if (this.isShuttingDown) {
            return false;
        }
        try {
            // Get next request from scheduler
            const request = await this.backend.dequeue();
            if (!request) {
                return false;
            }
            // Check circuit breaker
            if (!this.circuitBreaker.canExecute(request.zone)) {
                // Circuit is open, reschedule request
                await this.rescheduleRequest(request, 5000); // 5 second delay
                return false;
            }
            // Update request status
            request.status = 'processing';
            await this.backend.updateRequest(request.id, { status: 'processing' });
            this.emit('request.processing', { request });
            // Process request
            const success = await this.executeRequest(request);
            if (success) {
                await this.handleRequestSuccess(request);
            }
            else {
                await this.handleRequestFailure(request);
            }
            return true;
        }
        catch (error) {
            this.logger.error('Error processing queue request', error);
            return false;
        }
    }
    /**
     * Get queue metrics
     */
    async getMetrics() {
        await this.updateMetrics();
        return { ...this.metrics };
    }
    /**
     * Get queue health status
     */
    async getHealth() {
        const metrics = await this.getMetrics();
        const backendHealth = await this.checkBackendHealth();
        const processingHealth = this.checkProcessingHealth();
        const health = {
            status: this.determineOverallHealth(backendHealth, processingHealth, metrics),
            components: {
                storage: backendHealth,
                processor: processingHealth,
                monitoring: this.monitor ? 'healthy' : 'offline'
            },
            performance: {
                responseTime: {
                    p50: 0, // Would be calculated from execution history
                    p90: 0,
                    p95: 0,
                    p99: 0
                },
                queueDepth: [metrics.queuedRequests],
                processingRate: metrics.throughput
            },
            resources: {
                memoryUsage: process.memoryUsage().heapUsed,
                storageUsage: 0, // Would be retrieved from backend
                cpuUtilization: 0 // Would need CPU monitoring
            },
            alerts: [],
            lastCheck: new Date()
        };
        return health;
    }
    /**
     * Get requests by filter
     */
    async getRequests(filter = {}) {
        return this.backend.getRequests(filter);
    }
    /**
     * Cancel a request
     */
    async cancelRequest(requestId) {
        const request = await this.backend.getRequest(requestId);
        if (!request || request.status === 'completed' || request.status === 'failed') {
            return false;
        }
        // Update status to cancelled
        request.status = 'cancelled';
        await this.backend.updateRequest(requestId, { status: 'cancelled' });
        // Clean up resources
        this.cleanupRequest(requestId);
        this.emit('request.cancelled', { request });
        return true;
    }
    /**
     * Clear the queue
     */
    async clear(zone) {
        const cleared = await this.backend.clear(zone);
        // Clean up active requests
        if (!zone) {
            this.activeRequests.clear();
            this.requestDeduplication.clear();
            this.scheduledRequests.forEach(timeout => clearTimeout(timeout));
            this.scheduledRequests.clear();
        }
        this.emit('queue.cleared', { zone, count: cleared });
        return cleared;
    }
    /**
     * Pause queue processing
     */
    pauseProcessing() {
        this.isProcessing = false;
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = undefined;
        }
        this.emit('processing.paused');
    }
    /**
     * Resume queue processing
     */
    resumeProcessing() {
        if (!this.isProcessing) {
            this.startProcessing();
            this.emit('processing.resumed');
        }
    }
    /**
     * Shutdown the queue manager
     */
    async shutdown() {
        this.logger.info('Shutting down QueueManager');
        this.isShuttingDown = true;
        // Stop processing
        this.pauseProcessing();
        // Stop maintenance and metrics
        if (this.maintenanceInterval) {
            clearInterval(this.maintenanceInterval);
        }
        if (this.metricsUpdateInterval) {
            clearInterval(this.metricsUpdateInterval);
        }
        // Wait for active requests to complete (with timeout)
        const activeCount = this.activeRequests.size;
        if (activeCount > 0) {
            this.logger.info(`Waiting for ${activeCount} active requests to complete`);
            const waitPromise = new Promise(resolve => {
                const checkInterval = setInterval(() => {
                    if (this.activeRequests.size === 0) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            });
            // Wait max 30 seconds for requests to complete
            await Promise.race([
                waitPromise,
                new Promise(resolve => setTimeout(resolve, 30000))
            ]);
        }
        // Shutdown monitor
        if (this.monitor) {
            await this.monitor.shutdown();
        }
        // Close backend
        await this.backend.close();
        // Clear remaining resources
        this.activeRequests.clear();
        this.requestDeduplication.clear();
        this.scheduledRequests.forEach(timeout => clearTimeout(timeout));
        this.scheduledRequests.clear();
        this.emit('shutdown');
        this.removeAllListeners();
        this.logger.info('QueueManager shutdown complete');
    }
    /**
     * Execute a request
     */
    async executeRequest(request) {
        const startTime = new Date();
        try {
            // Get appropriate processor
            const processor = this.getProcessor(request);
            if (!processor) {
                throw new Error(`No processor available for ${request.endpoint}`);
            }
            // Execute request
            const result = await processor.processRequest(request);
            // Record execution
            const duration = Date.now() - startTime.getTime();
            request.executionHistory.push({
                timestamp: startTime,
                duration,
                result: 'success',
                responseSize: JSON.stringify(result).length
            });
            // Resolve promise
            const activeRequest = this.activeRequests.get(request.id);
            if (activeRequest && request.resolve) {
                request.resolve(result);
            }
            return true;
        }
        catch (error) {
            // Record execution failure
            const duration = Date.now() - startTime.getTime();
            request.executionHistory.push({
                timestamp: startTime,
                duration,
                result: 'failure',
                error: error instanceof Error ? error.message : String(error)
            });
            request.lastError = error instanceof Error ? error.message : String(error);
            return false;
        }
    }
    /**
     * Handle successful request completion
     */
    async handleRequestSuccess(request) {
        request.status = 'completed';
        await this.backend.updateRequest(request.id, {
            status: 'completed',
            executionHistory: request.executionHistory
        });
        this.circuitBreaker.recordSuccess(request.zone);
        this.cleanupRequest(request.id);
        this.emit('request.completed', { request });
        this.metrics.successfulRequests++;
    }
    /**
     * Handle failed request
     */
    async handleRequestFailure(request) {
        this.circuitBreaker.recordFailure(request.zone);
        // Check if we should retry
        if (request.retryable && request.retryCount < request.maxRetries) {
            await this.scheduleRetry(request);
        }
        else {
            // Permanent failure
            request.status = 'failed';
            await this.backend.updateRequest(request.id, {
                status: 'failed',
                lastError: request.lastError,
                executionHistory: request.executionHistory
            });
            // Reject promise
            const activeRequest = this.activeRequests.get(request.id);
            if (activeRequest && request.reject) {
                request.reject(new Error(request.lastError || 'Request failed'));
            }
            this.cleanupRequest(request.id);
            this.emit('request.failed', { request });
            this.metrics.failedRequests++;
        }
    }
    /**
     * Schedule request retry with exponential backoff
     */
    async scheduleRetry(request) {
        request.retryCount++;
        request.status = 'retrying';
        const { baseDelay, maxDelay, multiplier, jitter, jitterRange } = this.config.strategies.retryStrategy;
        // Calculate delay with exponential backoff
        let delay = Math.min(baseDelay * Math.pow(multiplier, request.retryCount - 1), maxDelay);
        // Add jitter if enabled
        if (jitter && jitterRange) {
            const jitterAmount = delay * jitterRange * (Math.random() - 0.5) * 2;
            delay = Math.max(0, delay + jitterAmount);
        }
        // Schedule retry
        const scheduledAt = new Date(Date.now() + delay);
        request.scheduledAt = scheduledAt;
        await this.backend.updateRequest(request.id, {
            status: 'retrying',
            retryCount: request.retryCount,
            scheduledAt
        });
        // Schedule actual retry
        const timeout = setTimeout(async () => {
            request.status = 'pending';
            await this.backend.updateRequest(request.id, { status: 'pending' });
            this.scheduledRequests.delete(request.id);
        }, delay);
        this.scheduledRequests.set(request.id, timeout);
        this.emit('request.retrying', { request, delay });
    }
    /**
     * Generate unique request ID
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
    /**
     * Generate request fingerprint for deduplication
     */
    generateFingerprint(endpoint, method, zone, data) {
        const content = `${method}:${zone}:${endpoint}:${JSON.stringify(data || {})}`;
        return crypto_1.default.createHash('sha256').update(content).digest('hex');
    }
    /**
     * Register a processor for handling requests
     */
    registerProcessor(key, processor) {
        this.processors.set(key, processor);
        this.logger.info('Processor registered', { key });
    }
    /**
     * Unregister a processor
     */
    unregisterProcessor(key) {
        const removed = this.processors.delete(key);
        if (removed) {
            this.logger.info('Processor unregistered', { key });
        }
        return removed;
    }
    /**
     * Get appropriate processor for request
     */
    getProcessor(request) {
        // Try to find specific processor for endpoint
        const endpointProcessor = this.processors.get(request.endpoint);
        if (endpointProcessor && endpointProcessor.canProcess(request)) {
            return endpointProcessor;
        }
        // Try to find processor for method
        const methodProcessor = this.processors.get(request.method);
        if (methodProcessor && methodProcessor.canProcess(request)) {
            return methodProcessor;
        }
        // Use default processor
        return this.processors.get('default') || null;
    }
    /**
     * Build complete configuration with defaults
     */
    buildConfiguration(partialConfig) {
        return {
            name: 'autotask-queue',
            maxSize: 10000,
            processingMode: 'parallel',
            maxConcurrency: 10,
            priorityEnabled: true,
            batchingEnabled: true,
            maxBatchSize: 10,
            batchTimeout: 1000,
            deduplicationEnabled: true,
            deduplicationWindow: 60000,
            defaultTimeout: 300000,
            defaultRetries: 3,
            persistence: {
                backend: 'memory',
                options: {
                    checkpoints: true,
                    checkpointInterval: 30000,
                    compression: false,
                    retentionPeriod: 86400000
                }
            },
            strategies: {
                priorityStrategy: 'priority',
                retryStrategy: {
                    baseDelay: 1000,
                    maxDelay: 30000,
                    multiplier: 2,
                    jitter: true,
                    jitterRange: 0.1
                },
                circuitBreaker: {
                    enabled: true,
                    failureThreshold: 5,
                    successThreshold: 3,
                    timeout: 60000
                },
                loadBalancing: 'zone-based'
            },
            ...partialConfig
        };
    }
    /**
     * Create storage backend based on configuration
     */
    async createBackend() {
        const { backend } = this.config.persistence;
        switch (backend) {
            case 'redis':
                return new RedisBackend_1.RedisBackend(this.config.persistence.connection?.redis, this.logger);
            case 'sqlite':
                return new SQLiteBackend_1.SQLiteBackend(this.config.persistence.connection?.dbPath || './queue.db', this.config.persistence.options, this.logger);
            case 'memory':
            default:
                return new MemoryBackend_1.MemoryBackend(this.logger);
        }
    }
    /**
     * Initialize metrics
     */
    initializeMetrics() {
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            queuedRequests: 0,
            processingRequests: 0,
            averageProcessingTime: 0,
            averageQueueTime: 0,
            queueUtilization: 0,
            throughput: 0,
            errorRate: 0,
            batchStats: {
                totalBatches: 0,
                averageBatchSize: 0,
                averageBatchTime: 0
            },
            priorityDistribution: new Map(),
            statusDistribution: new Map(),
            lastUpdated: new Date()
        };
    }
    /**
     * Update metrics
     */
    async updateMetrics() {
        try {
            const backendMetrics = await this.backend.getMetrics();
            // Update from backend
            Object.assign(this.metrics, backendMetrics);
            // Calculate derived metrics
            this.metrics.totalRequests = this.metrics.successfulRequests + this.metrics.failedRequests;
            this.metrics.errorRate = this.metrics.totalRequests > 0 ?
                this.metrics.failedRequests / this.metrics.totalRequests : 0;
            this.metrics.queueUtilization = this.metrics.queuedRequests / this.config.maxSize;
            this.metrics.lastUpdated = new Date();
        }
        catch (error) {
            this.logger.error('Failed to update metrics', error);
        }
    }
    /**
     * Start processing loop
     */
    startProcessing() {
        if (this.isProcessing) {
            return;
        }
        this.isProcessing = true;
        this.processingInterval = setInterval(async () => {
            if (!this.isProcessing) {
                return;
            }
            try {
                await this.processNext();
            }
            catch (error) {
                this.logger.error('Error in processing loop', error);
            }
        }, 100);
    }
    /**
     * Start maintenance tasks
     */
    startMaintenance() {
        this.maintenanceInterval = setInterval(async () => {
            try {
                await this.backend.maintenance();
            }
            catch (error) {
                this.logger.error('Error in maintenance', error);
            }
        }, this.config.persistence.options.checkpointInterval || 30000);
    }
    /**
     * Start metrics collection
     */
    startMetricsCollection() {
        this.metricsUpdateInterval = setInterval(async () => {
            await this.updateMetrics();
            this.emit('metrics.updated', this.metrics);
        }, 10000); // Update every 10 seconds
    }
    /**
     * Handle queue full condition
     */
    async handleQueueFull() {
        this.emit('queue.full');
        // Try to clean up expired requests
        const currentTime = new Date();
        const requests = await this.backend.getRequests({
            status: ['pending', 'retrying'],
            limit: 1000
        });
        let cleaned = 0;
        for (const request of requests) {
            if (currentTime.getTime() - request.createdAt.getTime() > request.timeout) {
                await this.backend.remove(request.id);
                this.cleanupRequest(request.id);
                cleaned++;
            }
        }
        if (cleaned === 0) {
            throw new Error('Queue is full and no expired requests to clean');
        }
        this.logger.info(`Cleaned ${cleaned} expired requests from queue`);
    }
    /**
     * Handle request timeout
     */
    async handleRequestTimeout(requestId) {
        const request = await this.backend.getRequest(requestId);
        if (request && request.status === 'pending') {
            request.status = 'expired';
            await this.backend.updateRequest(requestId, { status: 'expired' });
            this.cleanupRequest(requestId);
            this.emit('request.expired', { request });
        }
    }
    /**
     * Reschedule a request for later execution
     */
    async rescheduleRequest(request, delay) {
        const scheduledAt = new Date(Date.now() + delay);
        request.scheduledAt = scheduledAt;
        request.status = 'pending';
        await this.backend.updateRequest(request.id, {
            status: 'pending',
            scheduledAt
        });
        // Re-enqueue after delay
        setTimeout(async () => {
            await this.backend.enqueue(request);
        }, delay);
    }
    /**
     * Clean up request resources
     */
    cleanupRequest(requestId) {
        this.activeRequests.delete(requestId);
        const timeout = this.scheduledRequests.get(requestId);
        if (timeout) {
            clearTimeout(timeout);
            this.scheduledRequests.delete(requestId);
        }
    }
    /**
     * Check backend health
     */
    async checkBackendHealth() {
        try {
            await this.backend.size();
            return 'healthy';
        }
        catch (error) {
            this.logger.error('Backend health check failed', error);
            return 'offline';
        }
    }
    /**
     * Check processing health
     */
    checkProcessingHealth() {
        if (!this.isProcessing) {
            return 'offline';
        }
        const activeCount = this.activeRequests.size;
        const maxConcurrency = this.config.maxConcurrency;
        if (activeCount >= maxConcurrency * 0.9) {
            return 'degraded';
        }
        return 'healthy';
    }
    /**
     * Determine overall health status
     */
    determineOverallHealth(backendHealth, processingHealth, metrics) {
        if (backendHealth === 'offline' || processingHealth === 'offline') {
            return 'offline';
        }
        if (backendHealth === 'degraded' || processingHealth === 'degraded') {
            return 'degraded';
        }
        if (metrics.errorRate > 0.1 || metrics.queueUtilization > 0.9) {
            return 'critical';
        }
        if (metrics.errorRate > 0.05 || metrics.queueUtilization > 0.7) {
            return 'degraded';
        }
        return 'healthy';
    }
}
exports.QueueManager = QueueManager;
//# sourceMappingURL=QueueManager.js.map