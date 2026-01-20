"use strict";
/**
 * Cache Strategy Implementation System
 *
 * Implements different caching strategies for various scenarios including
 * write-through, lazy loading, refresh-ahead, and write-behind patterns.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheStrategyExecutor = void 0;
const events_1 = require("events");
const perf_hooks_1 = require("perf_hooks");
const types_1 = require("./types");
const ErrorLogger_1 = require("../errors/ErrorLogger");
/**
 * Cache strategy executor
 */
class CacheStrategyExecutor extends events_1.EventEmitter {
    constructor(store, keyGenerator, ttlManager, metrics, logger = ErrorLogger_1.defaultErrorLogger) {
        super();
        // Refresh-ahead state
        this.refreshInProgress = new Set();
        this.refreshAheadConfig = {
            refreshThreshold: 0.8,
            maxConcurrentRefresh: 5,
            refreshTimeout: 30000,
            allowStaleWhileRefresh: true
        };
        // Write-behind state
        this.pendingWrites = new Map();
        this.writeBehindConfig = {
            writeDelay: 5000,
            maxPendingWrites: 1000,
            batchSize: 50,
            retryAttempts: 3,
            coalesceWrites: true
        };
        this.store = store;
        this.keyGenerator = keyGenerator;
        this.ttlManager = ttlManager;
        this.metrics = metrics;
        this.logger = logger;
        this.startWriteBehindProcessor();
    }
    /**
     * Execute a cache strategy
     */
    async execute(context, strategy) {
        const startTime = perf_hooks_1.performance.now();
        const logContext = {
            operation: 'cache_strategy_execute',
            correlationId: this.generateCorrelationId()
        };
        try {
            let result;
            switch (strategy) {
                case types_1.CacheStrategy.WRITE_THROUGH:
                    result = await this.executeWriteThrough(context);
                    break;
                case types_1.CacheStrategy.LAZY_LOADING:
                    result = await this.executeLazyLoading(context);
                    break;
                case types_1.CacheStrategy.REFRESH_AHEAD:
                    result = await this.executeRefreshAhead(context);
                    break;
                case types_1.CacheStrategy.WRITE_BEHIND:
                    result = await this.executeWriteBehind(context);
                    break;
                case types_1.CacheStrategy.NONE:
                    result = await this.executeNoCache(context);
                    break;
                default:
                    throw new Error(`Unsupported cache strategy: ${strategy}`);
            }
            result.executionTime = perf_hooks_1.performance.now() - startTime;
            result.strategy = strategy;
            // Record metrics
            if (result.fromCache) {
                this.metrics.recordHit(context.keyContext.entityType, this.keyGenerator.generateKey(context.keyContext), result.executionTime);
            }
            else {
                this.metrics.recordMiss(context.keyContext.entityType, this.keyGenerator.generateKey(context.keyContext), result.executionTime);
            }
            return result;
        }
        catch (error) {
            this.logger.error('Cache strategy execution error', (0, types_1.toError)(error), {
                ...logContext,
                metadata: { strategy, entityType: context.keyContext.entityType }
            });
            const executionTime = perf_hooks_1.performance.now() - startTime;
            this.metrics.recordError(context.keyContext.entityType, 'strategy_execute', error);
            return {
                value: await context.fetcher(), // Fallback to direct fetch
                fromCache: false,
                strategy,
                executionTime,
                refreshed: false,
                error: error
            };
        }
    }
    /**
     * Update refresh-ahead configuration
     */
    updateRefreshAheadConfig(config) {
        this.refreshAheadConfig = { ...this.refreshAheadConfig, ...config };
    }
    /**
     * Update write-behind configuration
     */
    updateWriteBehindConfig(config) {
        this.writeBehindConfig = { ...this.writeBehindConfig, ...config };
    }
    /**
     * Get pending write count
     */
    getPendingWriteCount() {
        return this.pendingWrites.size;
    }
    /**
     * Force flush pending writes
     */
    async flushPendingWrites() {
        return await this.processPendingWrites();
    }
    /**
     * Shutdown strategy executor
     */
    async shutdown() {
        if (this.writeBehindTimer) {
            clearInterval(this.writeBehindTimer);
            this.writeBehindTimer = undefined;
        }
        // Flush any pending writes
        await this.flushPendingWrites();
        // Clear state
        this.refreshInProgress.clear();
        this.pendingWrites.clear();
    }
    /**
     * Execute write-through strategy
     */
    async executeWriteThrough(context) {
        const key = this.keyGenerator.generateKey(context.keyContext);
        // Always fetch fresh data and cache it
        const value = await context.fetcher();
        const ttlResult = this.ttlManager.calculateTTL({
            ...context.keyContext,
            timestamp: context.timestamp,
            responseData: value
        });
        const finalTtl = context.customTtl || ttlResult.ttl;
        await this.store.set(key, value, finalTtl, context.tags);
        this.metrics.recordSet(context.keyContext.entityType, key, this.estimateSize(value), finalTtl);
        return {
            value,
            fromCache: false,
            strategy: types_1.CacheStrategy.WRITE_THROUGH,
            executionTime: 0,
            refreshed: true
        };
    }
    /**
     * Execute lazy loading strategy (cache-aside)
     */
    async executeLazyLoading(context) {
        const key = this.keyGenerator.generateKey(context.keyContext);
        // Try to get from cache first
        if (!context.forceRefresh) {
            const cacheResult = await this.store.get(key);
            if (cacheResult.hit && cacheResult.value !== undefined) {
                return {
                    value: cacheResult.value,
                    fromCache: true,
                    strategy: types_1.CacheStrategy.LAZY_LOADING,
                    executionTime: 0,
                    refreshed: false
                };
            }
        }
        // Cache miss - fetch data and cache it
        const value = await context.fetcher();
        const ttlResult = this.ttlManager.calculateTTL({
            ...context.keyContext,
            timestamp: context.timestamp,
            responseData: value
        });
        const finalTtl = context.customTtl || ttlResult.ttl;
        await this.store.set(key, value, finalTtl, context.tags);
        this.metrics.recordSet(context.keyContext.entityType, key, this.estimateSize(value), finalTtl);
        return {
            value,
            fromCache: false,
            strategy: types_1.CacheStrategy.LAZY_LOADING,
            executionTime: 0,
            refreshed: true
        };
    }
    /**
     * Execute refresh-ahead strategy
     */
    async executeRefreshAhead(context) {
        const key = this.keyGenerator.generateKey(context.keyContext);
        // Check if force refresh is requested
        if (context.forceRefresh) {
            return await this.refreshAndReturn(context, key);
        }
        // Try to get from cache
        const cacheResult = await this.store.get(key);
        if (!cacheResult.hit || cacheResult.value === undefined) {
            // Cache miss - fetch and cache
            return await this.refreshAndReturn(context, key);
        }
        // Cache hit - check if refresh is needed
        const entry = cacheResult.metadata;
        if (entry) {
            const age = Date.now() - entry.createdAt;
            const refreshThresholdAge = entry.ttl * this.refreshAheadConfig.refreshThreshold;
            if (age >= refreshThresholdAge &&
                !this.refreshInProgress.has(key) &&
                this.refreshInProgress.size < this.refreshAheadConfig.maxConcurrentRefresh) {
                // Trigger background refresh
                this.triggerBackgroundRefresh(context, key);
            }
        }
        return {
            value: cacheResult.value,
            fromCache: true,
            strategy: types_1.CacheStrategy.REFRESH_AHEAD,
            executionTime: 0,
            refreshed: false
        };
    }
    /**
     * Execute write-behind strategy
     */
    async executeWriteBehind(context) {
        const key = this.keyGenerator.generateKey(context.keyContext);
        // Try to get from cache first
        if (!context.forceRefresh) {
            const cacheResult = await this.store.get(key);
            if (cacheResult.hit && cacheResult.value !== undefined) {
                return {
                    value: cacheResult.value,
                    fromCache: true,
                    strategy: types_1.CacheStrategy.WRITE_BEHIND,
                    executionTime: 0,
                    refreshed: false
                };
            }
        }
        // Cache miss - fetch data and schedule write-behind
        const value = await context.fetcher();
        if (this.pendingWrites.size < this.writeBehindConfig.maxPendingWrites) {
            // Schedule write-behind
            if (this.writeBehindConfig.coalesceWrites) {
                // Replace existing write for same key
                this.pendingWrites.set(key, {
                    context,
                    value,
                    timestamp: Date.now()
                });
            }
            else if (!this.pendingWrites.has(key)) {
                // Only add if not already pending
                this.pendingWrites.set(key, {
                    context,
                    value,
                    timestamp: Date.now()
                });
            }
        }
        else {
            // Too many pending writes, cache immediately
            const ttlResult = this.ttlManager.calculateTTL({
                ...context.keyContext,
                timestamp: context.timestamp,
                responseData: value
            });
            const finalTtl = context.customTtl || ttlResult.ttl;
            await this.store.set(key, value, finalTtl, context.tags);
            this.metrics.recordSet(context.keyContext.entityType, key, this.estimateSize(value), finalTtl);
        }
        return {
            value,
            fromCache: false,
            strategy: types_1.CacheStrategy.WRITE_BEHIND,
            executionTime: 0,
            refreshed: true
        };
    }
    /**
     * Execute no-cache strategy
     */
    async executeNoCache(context) {
        const value = await context.fetcher();
        return {
            value,
            fromCache: false,
            strategy: types_1.CacheStrategy.NONE,
            executionTime: 0,
            refreshed: true
        };
    }
    /**
     * Refresh data and return result
     */
    async refreshAndReturn(context, key) {
        const value = await context.fetcher();
        const ttlResult = this.ttlManager.calculateTTL({
            ...context.keyContext,
            timestamp: context.timestamp,
            responseData: value
        });
        const finalTtl = context.customTtl || ttlResult.ttl;
        await this.store.set(key, value, finalTtl, context.tags);
        this.metrics.recordSet(context.keyContext.entityType, key, this.estimateSize(value), finalTtl);
        return {
            value,
            fromCache: false,
            strategy: types_1.CacheStrategy.REFRESH_AHEAD,
            executionTime: 0,
            refreshed: true
        };
    }
    /**
     * Trigger background refresh for refresh-ahead strategy
     */
    triggerBackgroundRefresh(context, key) {
        this.refreshInProgress.add(key);
        // Run refresh in background
        Promise.race([
            context.fetcher(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Refresh timeout')), this.refreshAheadConfig.refreshTimeout))
        ]).then(async (value) => {
            // Update cache with fresh data
            const ttlResult = this.ttlManager.calculateTTL({
                ...context.keyContext,
                timestamp: Date.now(),
                responseData: value
            });
            const finalTtl = context.customTtl || ttlResult.ttl;
            await this.store.set(key, value, finalTtl, context.tags);
            this.metrics.recordSet(context.keyContext.entityType, key, this.estimateSize(value), finalTtl);
            this.emit('refresh_completed', { key, value, success: true });
        }).catch((error) => {
            this.logger.error('Background refresh failed', (0, types_1.toError)(error), {
                operation: 'background_refresh',
                correlationId: this.generateCorrelationId(),
                metadata: { key, entityType: context.keyContext.entityType }
            });
            this.emit('refresh_completed', { key, error: (0, types_1.toError)(error), success: false });
        }).finally(() => {
            this.refreshInProgress.delete(key);
        });
    }
    /**
     * Start write-behind processor
     */
    startWriteBehindProcessor() {
        this.writeBehindTimer = setInterval(async () => {
            await this.processPendingWrites();
        }, this.writeBehindConfig.writeDelay);
    }
    /**
     * Process pending writes for write-behind strategy
     */
    async processPendingWrites() {
        if (this.pendingWrites.size === 0) {
            return 0;
        }
        const writes = Array.from(this.pendingWrites.entries()).slice(0, this.writeBehindConfig.batchSize);
        let processedCount = 0;
        for (const [key, writeData] of writes) {
            try {
                const { context, value } = writeData;
                const ttlResult = this.ttlManager.calculateTTL({
                    ...context.keyContext,
                    timestamp: Date.now(),
                    responseData: value
                });
                const finalTtl = context.customTtl || ttlResult.ttl;
                const success = await this.store.set(key, value, finalTtl, context.tags);
                if (success) {
                    this.pendingWrites.delete(key);
                    processedCount++;
                    this.metrics.recordSet(context.keyContext.entityType, key, this.estimateSize(value), finalTtl);
                }
            }
            catch (error) {
                this.logger.error('Write-behind processing error', error, {
                    operation: 'write_behind_process',
                    correlationId: this.generateCorrelationId(),
                    metadata: { key }
                });
                // Remove failed writes after retry attempts (implement retry logic if needed)
                this.pendingWrites.delete(key);
            }
        }
        return processedCount;
    }
    /**
     * Estimate size of a value
     */
    estimateSize(value) {
        try {
            return Buffer.byteLength(JSON.stringify(value), 'utf8');
        }
        catch {
            return 1000; // Fallback estimate
        }
    }
    /**
     * Generate correlation ID
     */
    generateCorrelationId() {
        return `strategy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.CacheStrategyExecutor = CacheStrategyExecutor;
//# sourceMappingURL=CacheStrategy.js.map