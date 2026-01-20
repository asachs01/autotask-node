/**
 * Cache Manager - Main Cache System Coordinator
 *
 * Orchestrates all caching components including stores, strategies, invalidation,
 * metrics, and provides the main interface for the Autotask SDK caching system.
 */
import { EventEmitter } from 'events';
import { ICacheManager, CacheConfig, CacheKeyContext, CacheResult, CacheMetrics, CacheWarmupConfig, InvalidationPattern, CacheStrategy } from './types';
import { ErrorLogger } from '../errors/ErrorLogger';
/**
 * Main cache manager implementation
 */
export declare class CacheManager extends EventEmitter implements ICacheManager {
    private config;
    private logger;
    private primaryStore;
    private fallbackStore?;
    private keyGenerator;
    private ttlManager;
    private metrics;
    private invalidator;
    private strategyExecutor;
    private initialized;
    private circuitBreaker;
    private pendingRequests;
    constructor(config: CacheConfig, logger?: ErrorLogger);
    /**
     * Initialize the cache system
     */
    initialize(): Promise<void>;
    /**
     * Get a cached value
     */
    get<T>(context: CacheKeyContext): Promise<CacheResult<T>>;
    /**
     * Cache a value
     */
    set<T>(context: CacheKeyContext, value: T, customTtl?: number): Promise<boolean>;
    /**
     * Invalidate cache entries
     */
    invalidate(pattern: InvalidationPattern, target: string | string[]): Promise<number>;
    /**
     * Invalidate cache based on entity changes
     */
    invalidateByEntityChange(entityType: string, entityData: any, changeType: 'create' | 'update' | 'delete', entityId?: string): Promise<number>;
    /**
     * Execute cache strategy with data fetcher
     */
    executeStrategy<T>(context: CacheKeyContext, fetcher: () => Promise<T>, options?: {
        strategy?: CacheStrategy;
        customTtl?: number;
        tags?: string[];
        forceRefresh?: boolean;
    }): Promise<T>;
    /**
     * Get cache metrics
     */
    getMetrics(): CacheMetrics;
    /**
     * Warm up cache
     */
    warmup(config?: CacheWarmupConfig): Promise<void>;
    /**
     * Get cache health status
     */
    getHealthStatus(): Promise<{
        healthy: boolean;
        primaryStore: boolean;
        fallbackStore?: boolean;
        circuitBreaker: string;
        metrics: {
            hitRate: number;
            avgResponseTime: number;
            errorRate: number;
        };
    }>;
    /**
     * Shutdown cache system
     */
    shutdown(): Promise<void>;
    /**
     * Initialize core components
     */
    private initializeComponents;
    /**
     * Initialize cache stores
     */
    private initializeStores;
    /**
     * Setup event handlers
     */
    private setupEventHandlers;
    /**
     * Perform initial cache warmup
     */
    private performInitialWarmup;
    /**
     * Check if circuit breaker is open
     */
    private isCircuitOpen;
    /**
     * Record successful operation for circuit breaker
     */
    private recordSuccess;
    /**
     * Record failed operation for circuit breaker
     */
    private recordFailure;
    /**
     * Execute with stampede protection
     */
    private executeStampedeProtected;
    /**
     * Check if value should be cached based on entity configuration
     */
    private shouldCache;
    /**
     * Check if value is empty
     */
    private isEmpty;
    /**
     * Estimate size of value
     */
    private estimateSize;
    /**
     * Generate correlation ID
     */
    private generateCorrelationId;
}
//# sourceMappingURL=CacheManager.d.ts.map