"use strict";
/**
 * Main Batch Manager Implementation
 *
 * Coordinates all batch processing components:
 * - Request collection and organization
 * - Batch optimization and strategy application
 * - Queue management and processing
 * - Result handling and metrics collection
 * - Error handling and recovery
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchManager = void 0;
const events_1 = require("events");
const BatchQueue_1 = require("./BatchQueue");
const BatchOptimizer_1 = require("./BatchOptimizer");
const BatchResult_1 = require("./BatchResult");
const BatchMetrics_1 = require("./BatchMetrics");
const BatchStrategy_1 = require("./BatchStrategy");
const CircuitBreaker_1 = require("../errors/CircuitBreaker");
const RetryStrategy_1 = require("../errors/RetryStrategy");
const ErrorLogger_1 = require("../errors/ErrorLogger");
/**
 * BatchManager coordinates all batch processing operations
 */
class BatchManager extends events_1.EventEmitter {
    constructor(config, processor, logger) {
        super();
        // Strategy management
        this.strategies = new Map();
        // Active batch tracking
        this.activeBatches = new Map();
        this.batchCounter = 0;
        // Processing state
        this.isProcessing = false;
        this.isShuttingDown = false;
        // Processors by endpoint/zone
        this.processors = new Map();
        this.logger = logger;
        this.errorLogger = new ErrorLogger_1.ErrorLogger({
            level: ErrorLogger_1.LogLevel.INFO,
            includeStackTrace: true,
            destinations: [ErrorLogger_1.LogDestination.CONSOLE]
        });
        // Initialize configuration with defaults
        this.config = {
            maxBatchSize: Math.min(config.maxBatchSize ?? 200, 500), // Autotask limit: 500
            minBatchSize: config.minBatchSize ?? 5,
            maxWaitTime: config.maxWaitTime ?? 5000,
            defaultStrategy: config.defaultStrategy ?? 'hybrid',
            enableDeduplication: config.enableDeduplication ?? true,
            enableCoalescing: config.enableCoalescing ?? true,
            enableAdaptiveSizing: config.enableAdaptiveSizing ?? true,
            retryConfig: {
                maxRetries: config.retryConfig?.maxRetries ?? 3,
                baseDelay: config.retryConfig?.baseDelay ?? 1000,
                backoffMultiplier: config.retryConfig?.backoffMultiplier ?? 2,
                maxDelay: config.retryConfig?.maxDelay ?? 30000,
                ...config.retryConfig
            },
            circuitBreakerConfig: {
                enabled: config.circuitBreakerConfig?.enabled ?? true,
                failureThreshold: config.circuitBreakerConfig?.failureThreshold ?? 5,
                timeout: config.circuitBreakerConfig?.timeout ?? 30000,
                ...config.circuitBreakerConfig
            }
        };
        // Initialize components
        this.batchQueue = new BatchQueue_1.BatchQueue({
            maxConcurrentBatches: 5,
            processingStrategy: 'priority',
            persistent: false,
            limits: {
                maxQueueSize: 500,
                warningThreshold: 400,
                memoryLimit: 50 * 1024 * 1024 // 50MB
            }
        }, this.logger);
        this.optimizer = new BatchOptimizer_1.BatchOptimizer({
            enableCoalescing: this.config.enableCoalescing,
            enableDeduplication: this.config.enableDeduplication,
            enablePriorityOptimization: true,
            enableZoneOptimization: true,
            enableAdaptiveSizing: this.config.enableAdaptiveSizing,
            thresholds: {
                coalescingThreshold: 3,
                similarityThreshold: 0.8,
                performanceThreshold: 0.9
            }
        }, this.logger);
        this.metricsCollector = new BatchMetrics_1.BatchMetricsCollector(300000, 1000, this.logger);
        this.resultAnalyzer = new BatchResult_1.BatchResultAnalyzer(this.logger);
        // Initialize error handling
        this.retryStrategy = new RetryStrategy_1.RetryStrategy({
            maxRetries: this.config.retryConfig.maxRetries,
            initialDelay: this.config.retryConfig.baseDelay,
            maxDelay: this.config.retryConfig.maxDelay,
            backoffMultiplier: this.config.retryConfig.backoffMultiplier
        });
        this.circuitBreaker = new CircuitBreaker_1.CircuitBreaker('batch-processing', {
            failureThreshold: this.config.circuitBreakerConfig.failureThreshold,
            openTimeout: this.config.circuitBreakerConfig.timeout,
            onStateChange: (state, error) => {
                this.logger.warn('Circuit breaker state changed', { state, error: error?.message });
                this.emitEvent('circuit.state.changed', { state, error: error?.message });
            }
        });
        // Initialize strategies
        this.initializeStrategies();
        this.currentStrategy = this.strategies.get(this.config.defaultStrategy);
        // Register default processor
        this.registerProcessor('default', processor);
        // Set up event handlers
        this.setupEventHandlers();
        // Start processing
        this.startProcessing();
        this.logger.info('BatchManager initialized', {
            maxBatchSize: this.config.maxBatchSize,
            minBatchSize: this.config.minBatchSize,
            defaultStrategy: this.config.defaultStrategy,
            enableDeduplication: this.config.enableDeduplication,
            enableCoalescing: this.config.enableCoalescing
        });
    }
    /**
     * Add a request to be batched
     */
    async addRequest(request) {
        if (this.isShuttingDown) {
            throw new Error('BatchManager is shutting down');
        }
        try {
            // Find or create appropriate batch
            const batchKey = this.generateBatchKey(request);
            let activeBatch = this.findCompatibleBatch(batchKey, request);
            if (!activeBatch) {
                activeBatch = await this.createNewBatch(batchKey, request);
            }
            // Add request to batch
            activeBatch.requests.push(request);
            activeBatch.batch.requests.push(request);
            // Update batch priority if needed
            if (request.priority > activeBatch.batch.priority) {
                activeBatch.batch.priority = request.priority;
            }
            this.logger.debug('Request added to batch', {
                requestId: request.id,
                batchId: activeBatch.batch.id,
                batchSize: activeBatch.requests.length,
                priority: request.priority
            });
            // Check if batch should be processed now
            if (activeBatch.strategy.shouldProcess(activeBatch.batch)) {
                await this.processBatch(activeBatch.batch.id);
            }
            // Record wait time metric
            this.metricsCollector.recordWaitTime(Date.now() - request.createdAt.getTime());
        }
        catch (error) {
            this.errorLogger.error('Failed to add request to batch', error, {
                correlationId: this.errorLogger.generateCorrelationId(),
                operation: 'BatchManager.addRequest',
                metadata: {
                    requestId: request.id,
                    endpoint: request.endpoint,
                    zone: request.zone
                }
            });
            // Process request individually if batching fails
            await this.processIndividualRequest(request);
        }
    }
    /**
     * Force process a specific batch
     */
    async processBatch(batchId) {
        const activeBatch = this.activeBatches.get(batchId);
        if (!activeBatch) {
            throw new Error(`Batch not found: ${batchId}`);
        }
        const startTime = Date.now();
        try {
            this.logger.info('Processing batch', {
                batchId,
                size: activeBatch.requests.length,
                strategy: activeBatch.strategy.name,
                priority: activeBatch.batch.priority
            });
            // Remove from active batches and clear timeout
            this.activeBatches.delete(batchId);
            clearTimeout(activeBatch.timeout);
            // Optimize batch before processing
            const optimizedBatch = await this.optimizer.optimize(activeBatch.batch);
            // Add to queue for processing
            await this.batchQueue.enqueue(optimizedBatch);
            // Process through queue system
            const result = await this.processQueuedBatch(optimizedBatch);
            // Record metrics
            this.metricsCollector.recordBatchCompletion(result);
            // Record endpoint performance
            this.metricsCollector.recordEndpointPerformance(optimizedBatch.endpoint, optimizedBatch.requests.length, result.metadata.processingTime, result.success);
            // Analyze result
            const analysis = this.resultAnalyzer.analyzeBatchResult(result);
            this.logger.info('Batch processing completed', {
                batchId,
                success: result.success,
                successRate: result.metadata.successRate,
                processingTime: result.metadata.processingTime,
                recommendations: analysis.recommendations.length
            });
            // Handle failed requests for retry
            if (result.metadata.successRate < 1.0) {
                await this.handleFailedRequests(result);
            }
            // Emit completion event
            this.emitEvent('batch.completed', {
                batchId,
                success: result.success,
                size: result.results.length,
                processingTime: result.metadata.processingTime,
                successRate: result.metadata.successRate
            });
            return result;
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            this.errorLogger.error('Failed to process batch', error, {
                correlationId: this.errorLogger.generateCorrelationId(),
                operation: 'BatchManager.processBatch',
                metadata: {
                    batchId,
                    batchSize: activeBatch.requests.length,
                    processingTime
                }
            });
            // Create failure result
            const failureResult = new BatchResult_1.BatchResultBuilder(batchId, activeBatch.strategy.name)
                .addResults(activeBatch.requests.map(req => ({
                requestId: req.id,
                success: false,
                error: error,
                processingTime: processingTime / activeBatch.requests.length
            })))
                .build();
            // Record failure metrics
            this.metricsCollector.recordBatchCompletion(failureResult);
            // Emit failure event
            this.emitEvent('batch.failed', {
                batchId,
                error: error.message,
                size: activeBatch.requests.length,
                processingTime
            });
            throw error;
        }
    }
    /**
     * Register a processor for specific endpoints or zones
     */
    registerProcessor(key, processor) {
        this.processors.set(key, processor);
        this.logger.info('Processor registered', { key });
    }
    /**
     * Change batching strategy
     */
    setStrategy(strategyName) {
        const strategy = this.strategies.get(strategyName);
        if (!strategy) {
            throw new Error(`Unknown strategy: ${strategyName}`);
        }
        this.currentStrategy = strategy;
        this.logger.info('Strategy changed', { strategy: strategyName });
        this.emitEvent('strategy.changed', { strategy: strategyName });
    }
    /**
     * Get current metrics
     */
    getMetrics() {
        return {
            batchMetrics: this.metricsCollector.getMetrics(),
            queueStats: this.batchQueue.getStats(),
            optimizerStats: this.optimizer.getStats(),
            circuitBreakerMetrics: this.circuitBreaker.getMetrics(),
            activeBatches: this.activeBatches.size,
            currentStrategy: this.currentStrategy.name
        };
    }
    /**
     * Get system health status
     */
    getHealth() {
        const queueHealth = this.batchQueue.getHealth();
        const circuitBreakerMetrics = this.circuitBreaker.getMetrics();
        const metrics = this.metricsCollector.getMetrics();
        let status = 'healthy';
        const issues = [];
        // Check queue health
        if (queueHealth.status === 'critical') {
            status = 'critical';
            issues.push(`Queue: ${queueHealth.message}`);
        }
        else if (queueHealth.status === 'degraded') {
            status = 'degraded';
            issues.push(`Queue: ${queueHealth.message}`);
        }
        // Check circuit breaker
        if (!circuitBreakerMetrics.state || circuitBreakerMetrics.state === 'open') {
            status = 'critical';
            issues.push('Circuit breaker is open');
        }
        else if (circuitBreakerMetrics.state === 'half-open' && status !== 'critical') {
            status = 'degraded';
            issues.push('Circuit breaker is in recovery');
        }
        // Check error rates
        if (metrics.errorRate > 0.2) {
            status = 'critical';
            issues.push('High error rate detected');
        }
        else if (metrics.errorRate > 0.1 && status !== 'critical') {
            status = 'degraded';
            issues.push('Elevated error rate');
        }
        // Check throughput
        if (metrics.throughput < 1 && status !== 'critical') {
            status = 'degraded';
            issues.push('Low throughput');
        }
        return {
            status,
            timestamp: new Date(),
            issues: issues.length > 0 ? issues : undefined,
            details: {
                queue: queueHealth,
                circuitBreaker: circuitBreakerMetrics,
                metrics: {
                    successRate: metrics.successRate,
                    errorRate: metrics.errorRate,
                    throughput: metrics.throughput,
                    activeBatches: this.activeBatches.size
                }
            }
        };
    }
    /**
     * Shutdown the batch manager gracefully
     */
    async shutdown() {
        this.isShuttingDown = true;
        this.isProcessing = false;
        this.logger.info('Starting BatchManager shutdown', {
            activeBatches: this.activeBatches.size
        });
        try {
            // Process all active batches
            const shutdownPromises = Array.from(this.activeBatches.keys()).map(batchId => this.processBatch(batchId).catch(error => this.logger.error('Error processing batch during shutdown', {
                batchId,
                error: error instanceof Error ? error.message : error
            })));
            // Wait for all batches with timeout
            await Promise.race([
                Promise.all(shutdownPromises),
                new Promise(resolve => setTimeout(resolve, 30000)) // 30 second timeout
            ]);
            // Clear any remaining timeouts
            for (const activeBatch of this.activeBatches.values()) {
                clearTimeout(activeBatch.timeout);
            }
            this.activeBatches.clear();
            // Shutdown components
            await this.batchQueue.shutdown();
            // Clean up
            this.removeAllListeners();
            this.logger.info('BatchManager shutdown completed');
        }
        catch (error) {
            this.logger.error('Error during BatchManager shutdown', {
                error: error instanceof Error ? error.message : error
            });
            throw error;
        }
    }
    // Private helper methods
    initializeStrategies() {
        const strategyConfig = {
            maxBatchSize: this.config.maxBatchSize,
            minBatchSize: this.config.minBatchSize,
            maxWaitTime: this.config.maxWaitTime
        };
        this.strategies.set('size-based', BatchStrategy_1.BatchStrategyFactory.create('size-based', strategyConfig));
        this.strategies.set('time-based', BatchStrategy_1.BatchStrategyFactory.create('time-based', strategyConfig));
        this.strategies.set('hybrid', BatchStrategy_1.BatchStrategyFactory.create('hybrid', strategyConfig));
        this.strategies.set('priority-aware', BatchStrategy_1.BatchStrategyFactory.create('priority-aware', strategyConfig));
        this.strategies.set('adaptive', BatchStrategy_1.BatchStrategyFactory.create('adaptive', strategyConfig));
    }
    setupEventHandlers() {
        // Queue events
        this.batchQueue.on('queue.warning', (data) => {
            this.logger.warn('Batch queue warning', data);
            this.emitEvent('queue.warning', data);
        });
        this.batchQueue.on('queue.full', (data) => {
            this.logger.error('Batch queue full', data);
            this.emitEvent('queue.full', data);
        });
        // Metrics events
        this.metricsCollector.on('alert', (alert) => {
            this.logger.warn('Batch metrics alert', alert);
            this.emitEvent('metrics.alert', alert);
        });
        // Circuit breaker events
        this.circuitBreaker.on('stateChange', ({ from, to, error }) => {
            this.logger.warn('Circuit breaker state change', { from, to, error: error?.message });
            this.emitEvent('circuit.state.changed', { from, to, error: error?.message });
        });
    }
    generateBatchKey(request) {
        // Create key that groups compatible requests
        const baseKey = `${request.zone}:${request.endpoint}:${request.method}`;
        // Add priority band for priority-aware batching
        const priorityBand = Math.ceil(request.priority / 3); // Groups: 1-3, 4-6, 7-9, 10
        return `${baseKey}:p${priorityBand}`;
    }
    findCompatibleBatch(batchKey, request) {
        // Find existing batch that can accept this request
        for (const [batchId, activeBatch] of this.activeBatches) {
            if (batchId.startsWith(batchKey.split(':').slice(0, -1).join(':'))) {
                // Check if batch has capacity
                if (activeBatch.requests.length < this.config.maxBatchSize) {
                    // Check if request is compatible with batch
                    if (this.isRequestCompatible(request, activeBatch)) {
                        return activeBatch;
                    }
                }
            }
        }
        return undefined;
    }
    async createNewBatch(batchKey, initialRequest) {
        const batchId = `${batchKey}_${++this.batchCounter}_${Date.now()}`;
        // Select appropriate strategy
        const strategy = this.selectStrategyForRequest(initialRequest);
        // Create batch
        const batch = {
            id: batchId,
            priority: initialRequest.priority,
            requests: [],
            createdAt: new Date(),
            endpoint: initialRequest.endpoint,
            zone: initialRequest.zone,
            maxSize: strategy.getOptimalBatchSize({
                systemLoad: 0.5, // Default, can be enhanced with real system monitoring
                queueDepth: this.batchQueue.getStats().pendingBatches,
                activeBatches: this.activeBatches.size,
                recentPerformance: {
                    averageResponseTime: this.metricsCollector.getMetrics().averageProcessingTime,
                    successRate: this.metricsCollector.getMetrics().successRate,
                    errorRate: this.metricsCollector.getMetrics().errorRate
                },
                timestamp: new Date(),
                zone: initialRequest.zone,
                endpoint: initialRequest.endpoint
            }),
            timeout: strategy.getBatchTimeout({
                systemLoad: 0.5,
                queueDepth: this.batchQueue.getStats().pendingBatches,
                activeBatches: this.activeBatches.size,
                recentPerformance: {
                    averageResponseTime: this.metricsCollector.getMetrics().averageProcessingTime,
                    successRate: this.metricsCollector.getMetrics().successRate,
                    errorRate: this.metricsCollector.getMetrics().errorRate
                },
                timestamp: new Date(),
                zone: initialRequest.zone,
                endpoint: initialRequest.endpoint
            }),
            status: 'collecting',
            metadata: {
                batchKey,
                strategy: strategy.name,
                createdBy: 'BatchManager'
            }
        };
        // Set up timeout for automatic processing
        const timeout = setTimeout(() => {
            this.processBatch(batchId).catch(error => this.logger.error('Error auto-processing batch', {
                batchId,
                error: error instanceof Error ? error.message : error
            }));
        }, batch.timeout);
        const activeBatch = {
            batch,
            strategy,
            timeout,
            createdAt: new Date(),
            requests: []
        };
        this.activeBatches.set(batchId, activeBatch);
        this.logger.debug('New batch created', {
            batchId,
            strategy: strategy.name,
            maxSize: batch.maxSize,
            timeout: batch.timeout
        });
        this.emitEvent('batch.created', {
            batchId,
            strategy: strategy.name,
            maxSize: batch.maxSize
        });
        return activeBatch;
    }
    isRequestCompatible(request, activeBatch) {
        const batch = activeBatch.batch;
        // Basic compatibility checks
        if (request.zone !== batch.zone)
            return false;
        if (request.endpoint !== batch.endpoint)
            return false;
        if (request.method !== (batch.requests[0]?.method))
            return false;
        // Priority compatibility (within 2 levels)
        if (Math.abs(request.priority - batch.priority) > 2)
            return false;
        // Check batch hints
        const hints = request.batchHints;
        if (hints?.maxDelay) {
            const batchAge = Date.now() - activeBatch.createdAt.getTime();
            if (batchAge > hints.maxDelay)
                return false;
        }
        return true;
    }
    selectStrategyForRequest(request) {
        // Use request-specific strategy hints if available
        const hints = request.batchHints;
        if (hints?.preferredBatchSize) {
            if (hints.preferredBatchSize <= 10) {
                return this.strategies.get('time-based');
            }
            else if (hints.preferredBatchSize >= 50) {
                return this.strategies.get('size-based');
            }
        }
        // Use priority-aware strategy for high priority requests
        if (request.priority >= 8) {
            return this.strategies.get('priority-aware');
        }
        // Default to current strategy
        return this.currentStrategy;
    }
    async processQueuedBatch(batch) {
        const processor = this.findProcessor(batch);
        return this.circuitBreaker.executeOrThrow(async () => {
            return this.retryStrategy.executeOrThrow(async () => {
                return processor.processBatch(batch);
            }, {
                maxRetries: this.config.retryConfig.maxRetries,
                initialDelay: this.config.retryConfig.baseDelay,
                maxDelay: this.config.retryConfig.maxDelay,
                backoffMultiplier: this.config.retryConfig.backoffMultiplier,
                onRetry: (error, attempt, delay) => {
                    this.logger.warn('Retrying batch processing', {
                        batchId: batch.id,
                        attempt,
                        delay,
                        error: error.message
                    });
                }
            });
        });
    }
    findProcessor(batch) {
        // Try zone-specific processor
        const zoneProcessor = this.processors.get(batch.zone);
        if (zoneProcessor && zoneProcessor.canProcess(batch)) {
            return zoneProcessor;
        }
        // Try endpoint-specific processor
        const endpointProcessor = this.processors.get(batch.endpoint);
        if (endpointProcessor && endpointProcessor.canProcess(batch)) {
            return endpointProcessor;
        }
        // Use default processor
        const defaultProcessor = this.processors.get('default');
        if (!defaultProcessor) {
            throw new Error('No processor available for batch');
        }
        return defaultProcessor;
    }
    async handleFailedRequests(result) {
        const failedRequestInfo = this.resultAnalyzer.extractFailedRequests(result);
        for (const failedInfo of failedRequestInfo) {
            if (failedInfo.retryable) {
                this.logger.info('Scheduling request retry', {
                    requestId: failedInfo.requestId,
                    retryDelay: failedInfo.retryDelay
                });
                // Schedule retry (implementation would depend on request management system)
                // This is a placeholder for retry logic
                setTimeout(() => {
                    this.emitEvent('request.retry.scheduled', {
                        requestId: failedInfo.requestId,
                        delay: failedInfo.retryDelay
                    });
                }, failedInfo.retryDelay);
            }
            else {
                this.logger.warn('Request failed permanently', {
                    requestId: failedInfo.requestId,
                    error: failedInfo.error.message
                });
                this.emitEvent('request.failed.permanent', {
                    requestId: failedInfo.requestId,
                    error: failedInfo.error.message
                });
            }
        }
    }
    async processIndividualRequest(request) {
        this.logger.warn('Processing request individually due to batching failure', {
            requestId: request.id
        });
        // Create single-request batch for processing
        const singleBatch = {
            id: `single_${request.id}_${Date.now()}`,
            priority: request.priority,
            requests: [request],
            createdAt: new Date(),
            endpoint: request.endpoint,
            zone: request.zone,
            maxSize: 1,
            timeout: 5000,
            status: 'ready',
            metadata: {
                single_request: true,
                fallback: true
            }
        };
        try {
            const processor = this.findProcessor(singleBatch);
            const result = await processor.processBatch(singleBatch);
            // Record metrics for individual processing
            this.metricsCollector.recordBatchCompletion(result);
        }
        catch (error) {
            this.errorLogger.error('Failed to process individual request', error, {
                correlationId: this.errorLogger.generateCorrelationId(),
                operation: 'BatchManager.processIndividualRequest',
                metadata: {
                    requestId: request.id
                }
            });
            throw error;
        }
    }
    startProcessing() {
        this.isProcessing = true;
        // Process queued batches continuously
        const processLoop = async () => {
            while (this.isProcessing && !this.isShuttingDown) {
                try {
                    const batch = await this.batchQueue.dequeue();
                    if (batch) {
                        // Process in background
                        this.processQueuedBatch(batch)
                            .then(result => {
                            this.batchQueue.complete(batch.id, result.success);
                        })
                            .catch(error => {
                            this.batchQueue.complete(batch.id, false);
                            this.logger.error('Background batch processing failed', {
                                batchId: batch.id,
                                error: error instanceof Error ? error.message : error
                            });
                        });
                    }
                    else {
                        // No batches available, wait briefly
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                }
                catch (error) {
                    this.logger.error('Error in batch processing loop', {
                        error: error instanceof Error ? error.message : error
                    });
                    // Brief pause before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        };
        // Start processing loop
        processLoop().catch(error => {
            this.logger.error('Batch processing loop terminated', {
                error: error instanceof Error ? error.message : error
            });
        });
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
exports.BatchManager = BatchManager;
//# sourceMappingURL=BatchManager.js.map