import { ICacheStore, CacheResult } from '../types';
import { ErrorLogger } from '../../errors/ErrorLogger';
/**
 * File cache store configuration
 */
export interface FileCacheConfig {
    /** Base directory for cache files */
    directory: string;
    /** Maximum size per cache file in bytes */
    maxFileSize: number;
    /** Maximum total directory size in bytes */
    maxDirectorySize: number;
    /** Enable compression for large entries */
    enableCompression: boolean;
    /** Compression threshold in bytes */
    compressionThreshold: number;
    /** Cleanup interval in milliseconds */
    cleanupInterval: number;
    /** Number of subdirectories for distribution */
    subdirectories: number;
    /** File extension for cache files */
    fileExtension: string;
    /** Enable atomic writes via temp files */
    atomicWrites: boolean;
    /** Directory permissions */
    dirPermissions: number;
    /** File permissions */
    filePermissions: number;
}
/**
 * Default file cache configuration
 */
export declare const DEFAULT_FILE_CONFIG: FileCacheConfig;
/**
 * Directory statistics
 */
interface DirectoryStats {
    /** Total number of files */
    fileCount: number;
    /** Total size in bytes */
    totalSize: number;
    /** Last cleanup time */
    lastCleanup: number;
    /** Directory creation time */
    created: number;
}
/**
 * File-based cache store implementation
 */
export declare class FileCacheStore implements ICacheStore {
    private config;
    private logger;
    private cleanupTimer?;
    private tagIndex;
    private keyIndex;
    private initialized;
    private stats;
    constructor(config?: Partial<FileCacheConfig>, logger?: ErrorLogger);
    /**
     * Initialize the file cache store
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
     * Close the file store
     */
    close(): Promise<void>;
    /**
     * Get detailed cache statistics
     */
    getDetailedStats(): DirectoryStats & {
        averageFileSize: number;
        indexSize: number;
        compressionRatio: number;
    };
    /**
     * Ensure directory structure exists
     */
    private ensureDirectoryStructure;
    /**
     * Rebuild indexes by scanning the directory
     */
    private rebuildIndexes;
    /**
     * Scan directory and rebuild indexes
     */
    private scanDirectory;
    /**
     * Process a file for indexing
     */
    private processFileForIndex;
    /**
     * Get file path for a key
     */
    private getFilePath;
    /**
     * Extract key from file path (reverse of getFilePath)
     */
    private keyFromFilePath;
    /**
     * Update tag index
     */
    private updateTagIndex;
    /**
     * Clean up tag index for a key
     */
    private cleanupTagIndex;
    /**
     * Start cleanup timer
     */
    private startCleanupTimer;
    /**
     * Perform cleanup of expired entries
     */
    private performCleanup;
    /**
     * Remove all contents of a directory
     */
    private removeDirectoryContents;
    /**
     * Update entry statistics in file
     */
    private updateEntryStats;
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
export {};
//# sourceMappingURL=FileCacheStore.d.ts.map