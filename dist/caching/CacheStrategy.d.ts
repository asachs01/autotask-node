/**
 * Cache Strategy Implementation System
 *
 * Implements different caching strategies for various scenarios including
 * write-through, lazy loading, refresh-ahead, and write-behind patterns.
 */
import { EventEmitter } from 'events';
import { ICacheStore, CacheStrategy, CacheKeyContext } from './types';
import { CacheKeyGenerator } from './CacheKeyGenerator';
import { TTLManager } from './TTLManager';
import { CacheMetricsCollector } from './CacheMetrics';
import { ErrorLogger } from '../errors/ErrorLogger';
/**
 * Data fetch function type for strategies
 */
export type DataFetcher<T = any> = () => Promise<T>;
/**
 * Strategy execution context
 */
export interface StrategyContext {
    /** Cache key context */
    keyContext: CacheKeyContext;
    /** Data fetcher function */
    fetcher: DataFetcher;
    /** Custom TTL override */
    customTtl?: number;
    /** Custom tags */
    tags?: string[];
    /** Force refresh flag */
    forceRefresh?: boolean;
    /** Request timestamp */
    timestamp: number;
}
/**
 * Strategy execution result
 */
export interface StrategyResult<T = any> {
    /** The retrieved/cached value */
    value: T;
    /** Whether this was a cache hit */
    fromCache: boolean;
    /** Strategy that was executed */
    strategy: CacheStrategy;
    /** Execution time in milliseconds */
    executionTime: number;
    /** Whether data was refreshed */
    refreshed: boolean;
    /** Error if strategy failed */
    error?: Error;
}
/**
 * Refresh-ahead configuration
 */
export interface RefreshAheadConfig {
    /** Refresh threshold as percentage of TTL (0-1) */
    refreshThreshold: number;
    /** Maximum concurrent refresh operations */
    maxConcurrentRefresh: number;
    /** Background refresh timeout in milliseconds */
    refreshTimeout: number;
    /** Whether to return stale data while refreshing */
    allowStaleWhileRefresh: boolean;
}
/**
 * Write-behind configuration
 */
export interface WriteBehindConfig {
    /** Write delay in milliseconds */
    writeDelay: number;
    /** Maximum number of pending writes */
    maxPendingWrites: number;
    /** Write batch size */
    batchSize: number;
    /** Write retry attempts */
    retryAttempts: number;
    /** Whether to coalesce multiple writes to same key */
    coalesceWrites: boolean;
}
/**
 * Cache strategy executor
 */
export declare class CacheStrategyExecutor extends EventEmitter {
    private store;
    private keyGenerator;
    private ttlManager;
    private metrics;
    private logger;
    private refreshInProgress;
    private refreshAheadConfig;
    private pendingWrites;
    private writeBehindTimer?;
    private writeBehindConfig;
    constructor(store: ICacheStore, keyGenerator: CacheKeyGenerator, ttlManager: TTLManager, metrics: CacheMetricsCollector, logger?: ErrorLogger);
    /**
     * Execute a cache strategy
     */
    execute<T>(context: StrategyContext, strategy: CacheStrategy): Promise<StrategyResult<T>>;
    /**
     * Update refresh-ahead configuration
     */
    updateRefreshAheadConfig(config: Partial<RefreshAheadConfig>): void;
    /**
     * Update write-behind configuration
     */
    updateWriteBehindConfig(config: Partial<WriteBehindConfig>): void;
    /**
     * Get pending write count
     */
    getPendingWriteCount(): number;
    /**
     * Force flush pending writes
     */
    flushPendingWrites(): Promise<number>;
    /**
     * Shutdown strategy executor
     */
    shutdown(): Promise<void>;
    /**
     * Execute write-through strategy
     */
    private executeWriteThrough;
    /**
     * Execute lazy loading strategy (cache-aside)
     */
    private executeLazyLoading;
    /**
     * Execute refresh-ahead strategy
     */
    private executeRefreshAhead;
    /**
     * Execute write-behind strategy
     */
    private executeWriteBehind;
    /**
     * Execute no-cache strategy
     */
    private executeNoCache;
    /**
     * Refresh data and return result
     */
    private refreshAndReturn;
    /**
     * Trigger background refresh for refresh-ahead strategy
     */
    private triggerBackgroundRefresh;
    /**
     * Start write-behind processor
     */
    private startWriteBehindProcessor;
    /**
     * Process pending writes for write-behind strategy
     */
    private processPendingWrites;
    /**
     * Estimate size of a value
     */
    private estimateSize;
    /**
     * Generate correlation ID
     */
    private generateCorrelationId;
}
//# sourceMappingURL=CacheStrategy.d.ts.map