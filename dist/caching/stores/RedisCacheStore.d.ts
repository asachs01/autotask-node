/**
 * Redis Cache Store Implementation
 *
 * Production-ready Redis cache implementation with clustering support,
 * connection pooling, compression, and advanced Redis features.
 */
import { RedisOptions } from 'ioredis';
import { ICacheStore, CacheResult } from '../types';
import { ErrorLogger } from '../../errors/ErrorLogger';
/**
 * Redis cache store configuration
 */
export interface RedisCacheConfig {
    /** Redis connection options */
    redis: RedisOptions;
    /** Redis cluster configuration */
    cluster?: {
        nodes: Array<{
            host: string;
            port: number;
        }>;
        options?: any;
    };
    /** Enable compression for large entries */
    enableCompression: boolean;
    /** Compression threshold in bytes */
    compressionThreshold: number;
    /** Key prefix for all cache entries */
    keyPrefix: string;
    /** Connection timeout in milliseconds */
    connectionTimeout: number;
    /** Command timeout in milliseconds */
    commandTimeout: number;
    /** Enable Redis scripting for atomic operations */
    enableScripting: boolean;
    /** Maximum retry attempts */
    maxRetries: number;
    /** Retry delay in milliseconds */
    retryDelay: number;
}
/**
 * Default Redis cache configuration
 */
export declare const DEFAULT_REDIS_CONFIG: RedisCacheConfig;
/**
 * Redis cache store with advanced features
 */
export declare class RedisCacheStore implements ICacheStore {
    private client;
    private config;
    private logger;
    private scripts;
    private connected;
    constructor(config?: Partial<RedisCacheConfig>, logger?: ErrorLogger);
    /**
     * Initialize connection
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
     * Cleanup expired entries (Redis handles this automatically)
     */
    cleanup(): Promise<number>;
    /**
     * Health check
     */
    health(): Promise<boolean>;
    /**
     * Close connection
     */
    close(): Promise<void>;
    /**
     * Setup Redis event handlers
     */
    private setupEventHandlers;
    /**
     * Load Lua scripts into Redis
     */
    private loadScripts;
    /**
     * Set tags for a key
     */
    private setTags;
    /**
     * Clean up tags for a key
     */
    private cleanupTags;
    /**
     * Add tag cleanup commands to pipeline
     */
    private addTagCleanupToPipeline;
    /**
     * Update entry statistics
     */
    private updateEntryStats;
    /**
     * Get prefixed key
     */
    private getPrefixedKey;
    /**
     * Remove prefix from key
     */
    private removePrefixFromKey;
    /**
     * Calculate size of a value
     */
    private calculateSize;
    /**
     * Generate correlation ID for logging
     */
    private generateCorrelationId;
}
//# sourceMappingURL=RedisCacheStore.d.ts.map