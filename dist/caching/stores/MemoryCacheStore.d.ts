/**
 * In-Memory Cache Store Implementation
 *
 * Fast in-memory cache with LRU eviction, compression support,
 * and tag-based invalidation for development and production use.
 */
import { ICacheStore, CacheResult } from '../types';
import { ErrorLogger } from '../../errors/ErrorLogger';
/**
 * Memory cache store configuration
 */
export interface MemoryCacheConfig {
    /** Maximum number of entries */
    maxEntries: number;
    /** Maximum memory usage in bytes */
    maxMemoryUsage: number;
    /** Enable LRU eviction */
    enableLRU: boolean;
    /** Cleanup interval in milliseconds */
    cleanupInterval: number;
    /** Enable compression for large values */
    enableCompression: boolean;
    /** Compression threshold in bytes */
    compressionThreshold: number;
}
/**
 * Default memory cache configuration
 */
export declare const DEFAULT_MEMORY_CONFIG: MemoryCacheConfig;
/**
 * In-memory cache store implementation
 */
export declare class MemoryCacheStore implements ICacheStore {
    private config;
    private logger;
    private cache;
    private tagIndex;
    private cleanupTimer?;
    private initialized;
    private memoryUsage;
    constructor(config?: Partial<MemoryCacheConfig>, logger?: ErrorLogger);
    /**
     * Initialize the memory cache store
     */
    initialize(): Promise<void>;
    /**
     * Get a value from cache
     */
    get<T>(key: string): Promise<CacheResult<T>>;
    /**
     * Set a value in cache
     */
    set<T>(key: string, value: T, ttl?: number, tags?: string[]): Promise<boolean>;
    /**
     * Delete a single key
     */
    delete(key: string): Promise<boolean>;
    /**
     * Delete multiple keys
     */
    deleteMany(keys: string[]): Promise<number>;
    /**
     * Delete keys matching pattern
     */
    deletePattern(pattern: string): Promise<number>;
    /**
     * Delete keys by tags
     */
    deleteByTags(tags: string[]): Promise<number>;
    /**
     * Check if key exists
     */
    exists(key: string): Promise<boolean>;
    /**
     * Clear all cache entries
     */
    clear(): Promise<void>;
    /**
     * Get all keys matching pattern
     */
    keys(pattern?: string): Promise<string[]>;
    /**
     * Get cache size info
     */
    size(): Promise<{
        entries: number;
        memoryUsage: number;
    }>;
    /**
     * Cleanup expired entries
     */
    cleanup(): Promise<number>;
    /**
     * Health check
     */
    health(): Promise<boolean>;
    /**
     * Close the memory store
     */
    close(): Promise<void>;
    /**
     * Start cleanup timer
     */
    private startCleanupTimer;
    /**
     * Evict entries to make room for new entry
     */
    private evict;
    /**
     * Update tag index
     */
    private updateTagIndex;
    /**
     * Clean up tag index for a key
     */
    private cleanupTagIndex;
    /**
     * Create regex from pattern (supports * wildcard)
     */
    private createPatternRegex;
    /**
     * Calculate size of a value
     */
    private calculateSize;
    /**
     * Generate correlation ID for logging
     */
    private generateCorrelationId;
}
//# sourceMappingURL=MemoryCacheStore.d.ts.map