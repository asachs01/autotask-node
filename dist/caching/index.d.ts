/**
 * Autotask SDK Caching System
 *
 * Production-ready response caching system with multiple storage backends,
 * intelligent strategies, and comprehensive monitoring capabilities.
 *
 * @example Basic Usage
 * ```typescript
 * import { CacheManager, CacheConfig, CacheStorageType } from './caching';
 *
 * const config: CacheConfig = {
 *   storageType: CacheStorageType.MEMORY,
 *   maxMemoryUsage: 100 * 1024 * 1024, // 100MB
 *   maxEntries: 10000,
 *   defaultTtl: 300000, // 5 minutes
 *   enableMetrics: true,
 *   keyPrefix: 'autotask:cache:'
 * };
 *
 * const cacheManager = new CacheManager(config);
 * await cacheManager.initialize();
 *
 * // Use with API requests
 * const context = {
 *   method: 'GET',
 *   endpoint: '/api/v1/tickets',
 *   entityType: 'tickets',
 *   params: { status: 'Open' }
 * };
 *
 * const cachedResult = await cacheManager.get(context);
 * if (!cachedResult.hit) {
 *   const freshData = await fetchFromAPI();
 *   await cacheManager.set(context, freshData);
 * }
 * ```
 *
 * @example Advanced Strategy Usage
 * ```typescript
 * const data = await cacheManager.executeStrategy(context, fetchFunction, {
 *   strategy: CacheStrategy.REFRESH_AHEAD,
 *   customTtl: 600000, // 10 minutes
 *   tags: ['tickets', 'open']
 * });
 * ```
 *
 * @example Cache Invalidation
 * ```typescript
 * // Invalidate by pattern
 * await cacheManager.invalidate(InvalidationPattern.PATTERN, 'autotask:tickets:*');
 *
 * // Invalidate by entity change
 * await cacheManager.invalidateByEntityChange('tickets', ticketData, 'update');
 * ```
 */
export * from './types';
export { CacheManager } from './CacheManager';
export * from './stores';
export { CacheKeyGenerator, KeyStrategy } from './CacheKeyGenerator';
export type { KeyGenerationOptions } from './CacheKeyGenerator';
export { TTLManager, TTLStrategy, VolatilityLevel } from './TTLManager';
export type { TTLContext, TTLResult, UpdateFrequencyData, BusinessHoursConfig } from './TTLManager';
export { CacheMetricsCollector, MetricEvent } from './CacheMetrics';
export type { MetricDataPoint, MetricThreshold, TimeWindow, HistoricalMetrics } from './CacheMetrics';
export { CacheInvalidator } from './CacheInvalidator';
export type { InvalidationRule, InvalidationCondition, InvalidationEvent, DependencyMap, BatchInvalidationRequest } from './CacheInvalidator';
export { CacheStrategyExecutor } from './CacheStrategy';
export type { DataFetcher, StrategyContext, StrategyResult, RefreshAheadConfig, WriteBehindConfig } from './CacheStrategy';
/**
 * Cache configuration builder for common scenarios
 */
export declare class CacheConfigBuilder {
    private config;
    /**
     * Create development configuration
     */
    static development(): CacheConfigBuilder;
    /**
     * Create production configuration
     */
    static production(): CacheConfigBuilder;
    /**
     * Create testing configuration
     */
    static testing(): CacheConfigBuilder;
    /**
     * Set storage type to memory
     */
    withMemoryStorage(): CacheConfigBuilder;
    /**
     * Set storage type to Redis
     */
    withRedisStorage(host?: string, port?: number, password?: string): CacheConfigBuilder;
    /**
     * Set storage type to file
     */
    withFileStorage(directory?: string): CacheConfigBuilder;
    /**
     * Set fallback storage
     */
    withFallback(storageType: CacheStorageType): CacheConfigBuilder;
    /**
     * Set maximum entries
     */
    withMaxEntries(maxEntries: number): CacheConfigBuilder;
    /**
     * Set maximum memory usage
     */
    withMaxMemory(bytes: number): CacheConfigBuilder;
    /**
     * Set default TTL
     */
    withDefaultTtl(milliseconds: number): CacheConfigBuilder;
    /**
     * Enable/disable metrics
     */
    withMetrics(enabled: boolean): CacheConfigBuilder;
    /**
     * Enable/disable warmup
     */
    withWarmup(enabled: boolean): CacheConfigBuilder;
    /**
     * Set key prefix
     */
    withKeyPrefix(prefix: string): CacheConfigBuilder;
    /**
     * Add entity configuration
     */
    withEntityConfig(entityType: string, config: Partial<EntityCacheConfig>): CacheConfigBuilder;
    /**
     * Enable stampede prevention
     */
    withStampedeProtection(enabled?: boolean, timeout?: number): CacheConfigBuilder;
    /**
     * Build the configuration
     */
    build(): CacheConfig;
}
/**
 * Create a cache manager with common entity configurations
 */
export declare function createAutotaskCacheManager(config?: Partial<CacheConfig>, logger?: ErrorLogger): Promise<CacheManager>;
/**
 * Cache decorator for methods
 */
export declare function cached(cacheManager: CacheManager, options?: {
    entityType?: string;
    ttl?: number;
    tags?: string[];
    keyGenerator?: (args: any[]) => string;
}): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
import { CacheConfig, CacheStorageType, CacheStrategy, InvalidationPattern, EntityCacheConfig, CacheKeyContext } from './types';
import { ErrorLogger } from '../errors/ErrorLogger';
import { CacheManager } from './CacheManager';
export { CacheConfig, CacheStorageType, CacheStrategy, InvalidationPattern, EntityCacheConfig, CacheKeyContext };
/**
 * Default entity configurations for common Autotask entities
 */
export declare const DEFAULT_ENTITY_CONFIGS: Map<string, EntityCacheConfig>;
//# sourceMappingURL=index.d.ts.map