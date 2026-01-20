/**
 * Caching system types and interfaces
 */
export interface CacheConfig {
    /** Default TTL in milliseconds */
    defaultTtl?: number;
    /** Maximum number of cached items */
    maxSize?: number;
    /** Enable cache statistics */
    enableStats?: boolean;
    /** Cache eviction strategy */
    evictionStrategy?: 'lru' | 'lfu' | 'ttl' | 'random';
    /** Enable cache compression */
    enableCompression?: boolean;
    /** Cache storage backend */
    storage?: 'memory' | 'redis' | 'file' | 'hybrid';
    /** Enable cache warming */
    enableWarming?: boolean;
    /** Cache warming interval in milliseconds */
    warmingInterval?: number;
}
export interface CacheEntry<T = any> {
    /** Cached value */
    value: T;
    /** Cache key */
    key: string;
    /** Time when entry was created */
    createdAt: number;
    /** Time when entry expires */
    expiresAt: number;
    /** Time when entry was last accessed */
    lastAccessedAt: number;
    /** Number of times entry has been accessed */
    accessCount: number;
    /** Size of cached value in bytes */
    size: number;
    /** Entry metadata */
    metadata?: Record<string, any>;
}
export interface CacheStats {
    /** Total number of cache hits */
    hits: number;
    /** Total number of cache misses */
    misses: number;
    /** Cache hit rate percentage */
    hitRate: number;
    /** Total number of cache entries */
    entries: number;
    /** Total cache size in bytes */
    size: number;
    /** Maximum cache size in bytes */
    maxSize: number;
    /** Cache utilization percentage */
    utilization: number;
    /** Number of evictions */
    evictions: number;
    /** Average entry age in milliseconds */
    averageAge: number;
    /** Cache operations per second */
    operationsPerSecond: number;
}
export interface EntityCacheOptions {
    /** Entity type for scoped caching */
    entityType: string;
    /** TTL specific to entity type */
    ttl?: number;
    /** Enable relationship caching */
    cacheRelationships?: boolean;
    /** Maximum relationships to cache */
    maxRelationships?: number;
    /** Enable change detection */
    enableChangeDetection?: boolean;
    /** Change detection interval */
    changeDetectionInterval?: number;
}
export interface QueryCacheOptions {
    /** Query hash key */
    queryHash: string;
    /** Query parameters for cache key generation */
    parameters: Record<string, any>;
    /** TTL for query result */
    ttl?: number;
    /** Enable parameter normalization */
    normalizeParameters?: boolean;
    /** Cache invalidation tags */
    tags?: string[];
}
export interface ReferenceDataCacheOptions {
    /** Reference data type */
    dataType: 'dropdown' | 'lookup' | 'picklist' | 'entity_metadata';
    /** Auto-refresh interval in milliseconds */
    refreshInterval?: number;
    /** Enable background refresh */
    backgroundRefresh?: boolean;
    /** Stale while revalidate threshold */
    staleThreshold?: number;
}
export interface CacheInvalidationRule {
    /** Rule ID */
    id: string;
    /** Rule name */
    name: string;
    /** Entity types that trigger invalidation */
    triggerEntities: string[];
    /** Cache patterns to invalidate */
    invalidatePatterns: string[];
    /** Invalidation strategy */
    strategy: 'immediate' | 'lazy' | 'scheduled';
    /** Conditions for invalidation */
    conditions?: Array<{
        field: string;
        operator: 'equals' | 'contains' | 'startsWith' | 'endsWith';
        value: any;
    }>;
}
export interface CacheWarmupStrategy {
    /** Strategy name */
    name: string;
    /** Entity types to warm up */
    entityTypes: string[];
    /** Warm up priority (1-10) */
    priority: number;
    /** Warm up schedule */
    schedule?: string;
    /** Pre-defined queries to warm up */
    queries?: Array<{
        endpoint: string;
        parameters: Record<string, any>;
        ttl?: number;
    }>;
    /** Custom warm up function */
    customStrategy?: () => Promise<void>;
}
export interface CacheMetrics {
    /** Overall cache statistics */
    overall: CacheStats;
    /** Per-entity cache statistics */
    entities: Record<string, CacheStats>;
    /** Per-query-type cache statistics */
    queries: Record<string, CacheStats>;
    /** Reference data cache statistics */
    referenceData: CacheStats;
    /** Cache performance trends */
    trends: {
        hitRate: Array<{
            timestamp: number;
            value: number;
        }>;
        size: Array<{
            timestamp: number;
            value: number;
        }>;
        evictions: Array<{
            timestamp: number;
            value: number;
        }>;
    };
    /** Most accessed cache keys */
    topKeys: Array<{
        key: string;
        accessCount: number;
        hitRate: number;
    }>;
    /** Cache efficiency score (0-100) */
    efficiencyScore: number;
}
export interface CacheEventEmitter {
    on(event: 'hit', listener: (key: string, value: any) => void): void;
    on(event: 'miss', listener: (key: string) => void): void;
    on(event: 'set', listener: (key: string, value: any, ttl?: number) => void): void;
    on(event: 'delete', listener: (key: string) => void): void;
    on(event: 'evict', listener: (key: string, reason: string) => void): void;
    on(event: 'expire', listener: (key: string) => void): void;
    on(event: 'invalidate', listener: (pattern: string, count: number) => void): void;
    on(event: 'warm', listener: (keys: string[]) => void): void;
    emit(event: string, ...args: any[]): boolean;
}
export interface SmartCacheKey {
    /** Base key */
    base: string;
    /** Entity type */
    entity?: string;
    /** Entity ID */
    entityId?: string | number;
    /** Query parameters */
    params?: Record<string, any>;
    /** Version for cache busting */
    version?: string;
    /** User context */
    userContext?: string;
    /** Generate final cache key */
    toString(): string;
}
export interface CacheAdapter {
    /** Get value from cache */
    get<T>(key: string): Promise<T | null>;
    /** Set value in cache */
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    /** Delete value from cache */
    delete(key: string): Promise<boolean>;
    /** Check if key exists */
    exists(key: string): Promise<boolean>;
    /** Clear all cache entries */
    clear(): Promise<void>;
    /** Get cache statistics */
    getStats(): Promise<CacheStats>;
    /** Get keys matching pattern */
    keys(pattern: string): Promise<string[]>;
    /** Set expiration for key */
    expire(key: string, ttl: number): Promise<boolean>;
}
export type CacheSerializationStrategy = 'json' | 'msgpack' | 'protobuf' | 'custom';
export interface CacheCompressionOptions {
    /** Compression algorithm */
    algorithm: 'gzip' | 'lz4' | 'snappy' | 'brotli';
    /** Compression level (1-9) */
    level?: number;
    /** Minimum size threshold for compression */
    threshold?: number;
}
//# sourceMappingURL=CacheTypes.d.ts.map