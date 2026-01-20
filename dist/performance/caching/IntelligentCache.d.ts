import { EventEmitter } from 'events';
import winston from 'winston';
import { CacheConfig, CacheStats, CacheInvalidationRule, CacheWarmupStrategy, CacheMetrics, SmartCacheKey, CacheAdapter } from '../types/CacheTypes';
/**
 * Intelligent caching system with advanced features
 *
 * Provides smart caching with TTL management, intelligent eviction,
 * cache warming, and pattern-based invalidation for optimal performance.
 */
export declare class IntelligentCache extends EventEmitter {
    private logger;
    private readonly config;
    private readonly storage;
    private readonly adapter?;
    private stats;
    private invalidationRules;
    private warmupStrategies;
    private accessTimes;
    private isWarming;
    private warmupInterval?;
    constructor(logger: winston.Logger, config?: CacheConfig, adapter?: CacheAdapter);
    /**
     * Get value from cache
     */
    get<T>(key: string | SmartCacheKey): Promise<T | null>;
    /**
     * Set value in cache
     */
    set<T>(key: string | SmartCacheKey, value: T, ttl?: number): Promise<void>;
    /**
     * Delete value from cache
     */
    delete(key: string | SmartCacheKey): Promise<boolean>;
    /**
     * Check if key exists in cache
     */
    exists(key: string | SmartCacheKey): Promise<boolean>;
    /**
     * Clear all cache entries
     */
    clear(): Promise<void>;
    /**
     * Get cache statistics
     */
    getStats(): CacheStats;
    /**
     * Get cache metrics with detailed analysis
     */
    getMetrics(): CacheMetrics;
    /**
     * Add cache invalidation rule
     */
    addInvalidationRule(rule: CacheInvalidationRule): void;
    /**
     * Remove cache invalidation rule
     */
    removeInvalidationRule(ruleId: string): boolean;
    /**
     * Invalidate cache entries by pattern
     */
    invalidatePattern(pattern: string, reason?: string): Promise<number>;
    /**
     * Add cache warming strategy
     */
    addWarmupStrategy(strategy: CacheWarmupStrategy): void;
    /**
     * Execute cache warming
     */
    warmCache(): Promise<void>;
    /**
     * Start automatic cache warming
     */
    private startCacheWarming;
    /**
     * Stop automatic cache warming
     */
    stopCacheWarming(): void;
    private resolveKey;
    private ensureCapacity;
    private evictEntries;
    private estimateSize;
    private recordHit;
    private recordMiss;
    private recordOperation;
    private updateHitRate;
    private updateStats;
    private resetStats;
    private calculateHitRateTrend;
    private calculateSizeTrend;
    private calculateEvictionsTrend;
    private getTopAccessedKeys;
    private calculateEfficiencyScore;
}
//# sourceMappingURL=IntelligentCache.d.ts.map