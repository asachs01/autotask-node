/**
 * Core types for the Autotask SDK caching system
 */

/**
 * Cache storage backends supported
 */
export enum CacheStorageType {
  MEMORY = 'memory',
  REDIS = 'redis',
  FILE = 'file'
}

/**
 * Cache strategies for different scenarios
 */
export enum CacheStrategy {
  /** Cache all responses for specified TTL */
  WRITE_THROUGH = 'write_through',
  /** Cache on read, write through on update */
  LAZY_LOADING = 'lazy_loading',
  /** Cache with background refresh */
  REFRESH_AHEAD = 'refresh_ahead',
  /** Cache with write-behind persistence */
  WRITE_BEHIND = 'write_behind',
  /** No caching */
  NONE = 'none'
}

/**
 * Cache invalidation patterns
 */
export enum InvalidationPattern {
  /** Invalidate single key */
  SINGLE = 'single',
  /** Invalidate multiple keys */
  BATCH = 'batch',
  /** Invalidate by pattern matching */
  PATTERN = 'pattern',
  /** Invalidate by tags */
  TAG_BASED = 'tag_based',
  /** Time-based invalidation */
  TTL = 'ttl'
}

/**
 * Cache entry metadata
 */
export interface CacheEntry<T = any> {
  /** The cached value */
  value: T;
  /** When the entry was created */
  createdAt: number;
  /** When the entry will expire (timestamp) */
  expiresAt: number;
  /** Time-to-live in milliseconds */
  ttl: number;
  /** Tags for group invalidation */
  tags: string[];
  /** Hit count for this entry */
  hitCount: number;
  /** Last accessed timestamp */
  lastAccessed: number;
  /** Size in bytes (estimated) */
  size: number;
  /** Whether the entry is compressed */
  compressed: boolean;
  /** Entity type this cache entry represents */
  entityType?: string;
  /** Request fingerprint/hash */
  fingerprint?: string;
  /** Compression information */
  compressionInfo?: {
    algorithm: 'gzip' | 'lz4';
    originalSize: number;
    compressedSize: number;
  };
}

/**
 * Cache configuration per entity type
 */
export interface EntityCacheConfig {
  /** Entity name (e.g., 'tickets', 'companies') */
  entityType: string;
  /** Default TTL in milliseconds */
  defaultTtl: number;
  /** Maximum TTL in milliseconds */
  maxTtl: number;
  /** Minimum TTL in milliseconds */
  minTtl: number;
  /** Cache strategy to use */
  strategy: CacheStrategy;
  /** Whether to cache empty results */
  cacheEmpty: boolean;
  /** Maximum size of individual cache entry */
  maxEntrySize: number;
  /** Tags to apply to all entries of this type */
  defaultTags: string[];
  /** Custom key prefix */
  keyPrefix?: string;
}

/**
 * Global cache configuration
 */
export interface CacheConfig {
  /** Primary storage backend */
  storageType: CacheStorageType;
  /** Fallback storage if primary fails */
  fallbackStorageType?: CacheStorageType;
  /** Maximum memory usage in bytes */
  maxMemoryUsage: number;
  /** Maximum number of entries */
  maxEntries: number;
  /** Default TTL for entries without specific config */
  defaultTtl: number;
  /** Enable cache metrics collection */
  enableMetrics: boolean;
  /** Enable cache warming on startup */
  enableWarmup: boolean;
  /** Compression threshold (bytes) */
  compressionThreshold: number;
  /** Redis connection config (if using Redis) */
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
    keyPrefix?: string;
    connectTimeout?: number;
    commandTimeout?: number;
    lazyConnect?: boolean;
  };
  /** File cache config (if using file storage) */
  file?: {
    directory: string;
    maxFileSize: number;
    cleanupInterval: number;
  };
  /** Entity-specific configurations */
  entityConfigs: Map<string, EntityCacheConfig>;
  /** Global cache key prefix */
  keyPrefix: string;
  /** Enable cache stampede prevention */
  preventStampede: boolean;
  /** Stampede prevention timeout in ms */
  stampedeTimeout: number;
}

/**
 * Cache metrics data structure
 */
export interface CacheMetrics {
  /** Total cache hits */
  hits: number;
  /** Total cache misses */
  misses: number;
  /** Hit rate percentage */
  hitRate: number;
  /** Average response time from cache (ms) */
  avgResponseTime: number;
  /** Memory usage in bytes */
  memoryUsage: number;
  /** Number of entries currently cached */
  entryCount: number;
  /** Cache operations per second */
  operationsPerSecond: number;
  /** Eviction count */
  evictions: number;
  /** Error count */
  errors: number;
  /** Metrics by entity type */
  byEntityType: Map<string, EntityCacheMetrics>;
  /** Last updated timestamp */
  lastUpdated: number;
}

/**
 * Per-entity cache metrics
 */
export interface EntityCacheMetrics {
  entityType: string;
  hits: number;
  misses: number;
  hitRate: number;
  entryCount: number;
  memoryUsage: number;
  avgTtl: number;
  lastAccessed: number;
}

/**
 * Cache key generation context
 */
export interface CacheKeyContext {
  /** HTTP method */
  method: string;
  /** API endpoint */
  endpoint: string;
  /** Query parameters */
  params?: Record<string, any>;
  /** Request body (for POST/PUT) */
  body?: any;
  /** Entity type */
  entityType: string;
  /** User/session context */
  userContext?: string;
  /** Additional context data */
  metadata?: Record<string, any>;
}

/**
 * Cache operation result
 */
export interface CacheResult<T = any> {
  /** Whether the operation succeeded */
  success: boolean;
  /** The cached value (if found) */
  value?: T;
  /** Whether this was a cache hit */
  hit: boolean;
  /** Cache entry metadata */
  metadata?: CacheEntry<T>;
  /** Error if operation failed */
  error?: Error;
  /** Operation timing in milliseconds */
  timing: number;
}

/**
 * Cache warming configuration
 */
export interface CacheWarmupConfig {
  /** Enable warmup on startup */
  enabled: boolean;
  /** Warmup strategies to execute */
  strategies: WarmupStrategy[];
  /** Maximum warmup time in milliseconds */
  maxWarmupTime: number;
  /** Concurrent warmup operations */
  concurrency: number;
}

/**
 * Cache warmup strategy
 */
export interface WarmupStrategy {
  /** Strategy name */
  name: string;
  /** Entity types to warm up */
  entityTypes: string[];
  /** Warmup priority (1-10, 10 highest) */
  priority: number;
  /** Warmup function */
  execute: (entityType: string) => Promise<void>;
}

/**
 * Cache store interface that all storage implementations must follow
 */
export interface ICacheStore {
  /** Get a value from cache */
  get<T>(key: string): Promise<CacheResult<T>>;
  
  /** Set a value in cache */
  set<T>(key: string, value: T, ttl?: number, tags?: string[]): Promise<boolean>;
  
  /** Delete a single key */
  delete(key: string): Promise<boolean>;
  
  /** Delete multiple keys */
  deleteMany(keys: string[]): Promise<number>;
  
  /** Delete keys matching pattern */
  deletePattern(pattern: string): Promise<number>;
  
  /** Delete keys by tags */
  deleteByTags(tags: string[]): Promise<number>;
  
  /** Check if key exists */
  exists(key: string): Promise<boolean>;
  
  /** Clear all cache entries */
  clear(): Promise<void>;
  
  /** Get all keys matching pattern */
  keys(pattern?: string): Promise<string[]>;
  
  /** Get cache size info */
  size(): Promise<{ entries: number; memoryUsage: number }>;
  
  /** Cleanup expired entries */
  cleanup(): Promise<number>;
  
  /** Health check */
  health(): Promise<boolean>;
  
  /** Close/disconnect */
  close(): Promise<void>;
}

/**
 * Cache manager interface
 */
export interface ICacheManager {
  /** Initialize the cache system */
  initialize(): Promise<void>;
  
  /** Get a cached value */
  get<T>(context: CacheKeyContext): Promise<CacheResult<T>>;
  
  /** Cache a value */
  set<T>(context: CacheKeyContext, value: T, customTtl?: number): Promise<boolean>;
  
  /** Invalidate cache entries */
  invalidate(pattern: InvalidationPattern, target: string | string[]): Promise<number>;
  
  /** Get cache metrics */
  getMetrics(): CacheMetrics;
  
  /** Warm up cache */
  warmup(config?: CacheWarmupConfig): Promise<void>;
  
  /** Shutdown cache system */
  shutdown(): Promise<void>;
}

/**
 * Response caching decorator options
 */
export interface CacheDecoratorOptions {
  /** TTL override */
  ttl?: number;
  /** Tags to apply */
  tags?: string[];
  /** Cache strategy override */
  strategy?: CacheStrategy;
  /** Conditional caching function */
  condition?: (response: any) => boolean;
  /** Custom key generator */
  keyGenerator?: (context: CacheKeyContext) => string;
}

/**
 * Utility function to safely convert unknown errors to Error objects
 */
export function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(String(error));
}