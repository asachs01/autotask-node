"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntelligentCache = void 0;
const events_1 = require("events");
/**
 * Intelligent caching system with advanced features
 *
 * Provides smart caching with TTL management, intelligent eviction,
 * cache warming, and pattern-based invalidation for optimal performance.
 */
class IntelligentCache extends events_1.EventEmitter {
    constructor(logger, config = {}, adapter) {
        super();
        this.logger = logger;
        this.storage = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            hitRate: 0,
            entries: 0,
            size: 0,
            maxSize: 0,
            utilization: 0,
            evictions: 0,
            averageAge: 0,
            operationsPerSecond: 0
        };
        this.invalidationRules = [];
        this.warmupStrategies = [];
        this.accessTimes = [];
        this.isWarming = false;
        this.config = {
            defaultTtl: 300000, // 5 minutes
            maxSize: 1000,
            enableStats: true,
            evictionStrategy: 'lru',
            enableCompression: false,
            storage: 'memory',
            enableWarming: false,
            warmingInterval: 60000,
            ...config
        };
        this.adapter = adapter;
        this.stats.maxSize = this.config.maxSize;
        if (this.config.enableWarming) {
            this.startCacheWarming();
        }
    }
    /**
     * Get value from cache
     */
    async get(key) {
        const cacheKey = this.resolveKey(key);
        const startTime = performance.now();
        try {
            let entry = null;
            if (this.adapter) {
                const value = await this.adapter.get(cacheKey);
                if (value !== null) {
                    entry = {
                        key: cacheKey,
                        value,
                        createdAt: Date.now(),
                        expiresAt: Date.now() + this.config.defaultTtl,
                        lastAccessedAt: Date.now(),
                        accessCount: 1,
                        size: this.estimateSize(value)
                    };
                }
            }
            else {
                entry = this.storage.get(cacheKey) || null;
            }
            if (!entry) {
                this.recordMiss(cacheKey, performance.now() - startTime);
                return null;
            }
            // Check expiration
            if (entry.expiresAt < Date.now()) {
                await this.delete(cacheKey);
                this.recordMiss(cacheKey, performance.now() - startTime);
                return null;
            }
            // Update access tracking
            entry.lastAccessedAt = Date.now();
            entry.accessCount++;
            if (!this.adapter) {
                this.storage.set(cacheKey, entry);
            }
            this.recordHit(cacheKey, performance.now() - startTime);
            this.emit('hit', cacheKey, entry.value);
            return entry.value;
        }
        catch (error) {
            this.logger.error('Cache get error', { key: cacheKey, error });
            this.recordMiss(cacheKey, performance.now() - startTime);
            return null;
        }
    }
    /**
     * Set value in cache
     */
    async set(key, value, ttl) {
        const cacheKey = this.resolveKey(key);
        const effectiveTtl = ttl || this.config.defaultTtl;
        const now = Date.now();
        try {
            const entry = {
                key: cacheKey,
                value,
                createdAt: now,
                expiresAt: now + effectiveTtl,
                lastAccessedAt: now,
                accessCount: 0,
                size: this.estimateSize(value)
            };
            if (this.adapter) {
                await this.adapter.set(cacheKey, value, effectiveTtl);
            }
            else {
                // Check if we need to evict entries
                await this.ensureCapacity(entry.size);
                this.storage.set(cacheKey, entry);
            }
            this.updateStats();
            this.emit('set', cacheKey, value, effectiveTtl);
        }
        catch (error) {
            this.logger.error('Cache set error', { key: cacheKey, error });
            throw error;
        }
    }
    /**
     * Delete value from cache
     */
    async delete(key) {
        const cacheKey = this.resolveKey(key);
        try {
            let deleted = false;
            if (this.adapter) {
                deleted = await this.adapter.delete(cacheKey);
            }
            else {
                deleted = this.storage.delete(cacheKey);
            }
            if (deleted) {
                this.updateStats();
                this.emit('delete', cacheKey);
            }
            return deleted;
        }
        catch (error) {
            this.logger.error('Cache delete error', { key: cacheKey, error });
            return false;
        }
    }
    /**
     * Check if key exists in cache
     */
    async exists(key) {
        const cacheKey = this.resolveKey(key);
        try {
            if (this.adapter) {
                return await this.adapter.exists(cacheKey);
            }
            const entry = this.storage.get(cacheKey);
            return entry !== undefined && entry.expiresAt > Date.now();
        }
        catch (error) {
            this.logger.error('Cache exists error', { key: cacheKey, error });
            return false;
        }
    }
    /**
     * Clear all cache entries
     */
    async clear() {
        try {
            if (this.adapter) {
                await this.adapter.clear();
            }
            else {
                this.storage.clear();
            }
            this.resetStats();
            this.emit('clear');
        }
        catch (error) {
            this.logger.error('Cache clear error', error);
            throw error;
        }
    }
    /**
     * Get cache statistics
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * Get cache metrics with detailed analysis
     */
    getMetrics() {
        const overall = this.getStats();
        return {
            overall,
            entities: {}, // Would be populated by EntityCacheManager
            queries: {}, // Would be populated by QueryResultCache
            referenceData: { ...overall }, // Simplified for this implementation
            trends: {
                hitRate: this.calculateHitRateTrend(),
                size: this.calculateSizeTrend(),
                evictions: this.calculateEvictionsTrend()
            },
            topKeys: this.getTopAccessedKeys(),
            efficiencyScore: this.calculateEfficiencyScore()
        };
    }
    /**
     * Add cache invalidation rule
     */
    addInvalidationRule(rule) {
        this.invalidationRules.push(rule);
        this.logger.info('Cache invalidation rule added', { ruleId: rule.id, name: rule.name });
    }
    /**
     * Remove cache invalidation rule
     */
    removeInvalidationRule(ruleId) {
        const index = this.invalidationRules.findIndex(rule => rule.id === ruleId);
        if (index >= 0) {
            this.invalidationRules.splice(index, 1);
            this.logger.info('Cache invalidation rule removed', { ruleId });
            return true;
        }
        return false;
    }
    /**
     * Invalidate cache entries by pattern
     */
    async invalidatePattern(pattern, reason) {
        let invalidatedCount = 0;
        try {
            const regex = new RegExp(pattern);
            const keysToDelete = [];
            if (this.adapter) {
                const keys = await this.adapter.keys(pattern);
                keysToDelete.push(...keys);
            }
            else {
                for (const key of this.storage.keys()) {
                    if (regex.test(key)) {
                        keysToDelete.push(key);
                    }
                }
            }
            for (const key of keysToDelete) {
                if (await this.delete(key)) {
                    invalidatedCount++;
                }
            }
            if (invalidatedCount > 0) {
                this.logger.info('Cache invalidation completed', {
                    pattern,
                    reason,
                    invalidatedCount
                });
                this.emit('invalidate', pattern, invalidatedCount);
            }
            return invalidatedCount;
        }
        catch (error) {
            this.logger.error('Cache invalidation error', { pattern, error });
            return 0;
        }
    }
    /**
     * Add cache warming strategy
     */
    addWarmupStrategy(strategy) {
        this.warmupStrategies.push(strategy);
        this.warmupStrategies.sort((a, b) => b.priority - a.priority);
        this.logger.info('Cache warmup strategy added', {
            name: strategy.name,
            priority: strategy.priority
        });
    }
    /**
     * Execute cache warming
     */
    async warmCache() {
        if (this.isWarming) {
            this.logger.warn('Cache warming already in progress');
            return;
        }
        this.isWarming = true;
        const warmedKeys = [];
        try {
            for (const strategy of this.warmupStrategies) {
                this.logger.info('Executing warmup strategy', { name: strategy.name });
                if (strategy.queries) {
                    for (const query of strategy.queries) {
                        try {
                            // This would typically make actual API calls to warm the cache
                            // For now, we'll simulate by pre-populating some keys
                            const key = `${query.endpoint}_${JSON.stringify(query.parameters)}`;
                            await this.set(key, { warmed: true, timestamp: Date.now() }, query.ttl);
                            warmedKeys.push(key);
                        }
                        catch (error) {
                            this.logger.error('Error warming query', { query, error });
                        }
                    }
                }
                if (strategy.customStrategy) {
                    try {
                        await strategy.customStrategy();
                    }
                    catch (error) {
                        this.logger.error('Error executing custom warmup strategy', {
                            strategy: strategy.name,
                            error
                        });
                    }
                }
            }
            this.logger.info('Cache warming completed', {
                strategiesExecuted: this.warmupStrategies.length,
                keysWarmed: warmedKeys.length
            });
            this.emit('warm', warmedKeys);
        }
        catch (error) {
            this.logger.error('Cache warming error', error);
        }
        finally {
            this.isWarming = false;
        }
    }
    /**
     * Start automatic cache warming
     */
    startCacheWarming() {
        if (this.warmupInterval) {
            clearInterval(this.warmupInterval);
        }
        this.warmupInterval = setInterval(async () => {
            await this.warmCache();
        }, this.config.warmingInterval);
        this.logger.info('Cache warming started', {
            interval: this.config.warmingInterval
        });
    }
    /**
     * Stop automatic cache warming
     */
    stopCacheWarming() {
        if (this.warmupInterval) {
            clearInterval(this.warmupInterval);
            this.warmupInterval = undefined;
            this.logger.info('Cache warming stopped');
        }
    }
    resolveKey(key) {
        if (typeof key === 'string') {
            return key;
        }
        return key.toString();
    }
    async ensureCapacity(entrySize) {
        if (this.storage.size >= this.config.maxSize) {
            await this.evictEntries(1);
        }
        // Check total size if we're tracking it
        let totalSize = 0;
        for (const entry of this.storage.values()) {
            totalSize += entry.size;
        }
        // If adding this entry would exceed memory limits, evict more
        const sizeLimitMB = 100; // 100MB limit
        if (totalSize + entrySize > sizeLimitMB * 1024 * 1024) {
            await this.evictEntries(Math.ceil(this.storage.size * 0.1)); // Evict 10%
        }
    }
    async evictEntries(count) {
        const entries = Array.from(this.storage.entries());
        let entriesToEvict = [];
        switch (this.config.evictionStrategy) {
            case 'lru':
                entriesToEvict = entries
                    .sort((a, b) => a[1].lastAccessedAt - b[1].lastAccessedAt)
                    .slice(0, count);
                break;
            case 'lfu':
                entriesToEvict = entries
                    .sort((a, b) => a[1].accessCount - b[1].accessCount)
                    .slice(0, count);
                break;
            case 'ttl':
                entriesToEvict = entries
                    .sort((a, b) => a[1].expiresAt - b[1].expiresAt)
                    .slice(0, count);
                break;
            case 'random':
                entriesToEvict = entries
                    .sort(() => Math.random() - 0.5)
                    .slice(0, count);
                break;
        }
        for (const [key, entry] of entriesToEvict) {
            this.storage.delete(key);
            this.stats.evictions++;
            this.emit('evict', key, this.config.evictionStrategy);
        }
        this.logger.debug('Cache eviction completed', {
            strategy: this.config.evictionStrategy,
            evictedCount: entriesToEvict.length
        });
    }
    estimateSize(value) {
        try {
            return new TextEncoder().encode(JSON.stringify(value)).length;
        }
        catch {
            return 1024; // Default size estimate
        }
    }
    recordHit(key, responseTime) {
        this.stats.hits++;
        this.recordOperation(responseTime);
        this.updateHitRate();
    }
    recordMiss(key, responseTime) {
        this.stats.misses++;
        this.recordOperation(responseTime);
        this.updateHitRate();
    }
    recordOperation(responseTime) {
        this.accessTimes.push(Date.now());
        // Keep only recent access times (last minute)
        const cutoff = Date.now() - 60000;
        this.accessTimes = this.accessTimes.filter(time => time > cutoff);
        this.stats.operationsPerSecond = this.accessTimes.length / 60;
    }
    updateHitRate() {
        const total = this.stats.hits + this.stats.misses;
        this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    }
    updateStats() {
        this.stats.entries = this.storage.size;
        let totalSize = 0;
        let totalAge = 0;
        for (const entry of this.storage.values()) {
            totalSize += entry.size;
            totalAge += Date.now() - entry.createdAt;
        }
        this.stats.size = totalSize;
        this.stats.utilization = this.stats.maxSize > 0
            ? (this.stats.entries / this.stats.maxSize) * 100
            : 0;
        this.stats.averageAge = this.stats.entries > 0
            ? totalAge / this.stats.entries
            : 0;
    }
    resetStats() {
        this.stats = {
            hits: 0,
            misses: 0,
            hitRate: 0,
            entries: 0,
            size: 0,
            maxSize: this.config.maxSize,
            utilization: 0,
            evictions: 0,
            averageAge: 0,
            operationsPerSecond: 0
        };
    }
    calculateHitRateTrend() {
        // Simplified trend calculation
        return [{ timestamp: Date.now(), value: this.stats.hitRate }];
    }
    calculateSizeTrend() {
        return [{ timestamp: Date.now(), value: this.stats.size }];
    }
    calculateEvictionsTrend() {
        return [{ timestamp: Date.now(), value: this.stats.evictions }];
    }
    getTopAccessedKeys() {
        const entries = Array.from(this.storage.entries())
            .sort((a, b) => b[1].accessCount - a[1].accessCount)
            .slice(0, 10);
        return entries.map(([key, entry]) => ({
            key,
            accessCount: entry.accessCount,
            hitRate: 100 // Simplified - would need to track per-key hits/misses
        }));
    }
    calculateEfficiencyScore() {
        // Simple efficiency calculation based on hit rate and utilization
        const hitRateScore = this.stats.hitRate / 100;
        const utilizationScore = Math.min(this.stats.utilization / 80, 1); // Optimal around 80%
        return Math.round((hitRateScore * 0.7 + utilizationScore * 0.3) * 100);
    }
}
exports.IntelligentCache = IntelligentCache;
//# sourceMappingURL=IntelligentCache.js.map