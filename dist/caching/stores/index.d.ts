/**
 * Cache Store Implementations
 *
 * Export all available cache store implementations for the Autotask SDK.
 */
export { MemoryCacheStore, DEFAULT_MEMORY_CONFIG } from './MemoryCacheStore';
export type { MemoryCacheConfig } from './MemoryCacheStore';
export { RedisCacheStore, DEFAULT_REDIS_CONFIG } from './RedisCacheStore';
export type { RedisCacheConfig } from './RedisCacheStore';
export { FileCacheStore, DEFAULT_FILE_CONFIG } from './FileCacheStore';
export type { FileCacheConfig } from './FileCacheStore';
/**
 * Store factory for creating cache stores based on configuration
 */
import { ICacheStore, CacheStorageType } from '../types';
import { MemoryCacheConfig } from './MemoryCacheStore';
import { RedisCacheConfig } from './RedisCacheStore';
import { FileCacheConfig } from './FileCacheStore';
import { ErrorLogger } from '../../errors/ErrorLogger';
export interface StoreConfigurations {
    memory?: Partial<MemoryCacheConfig>;
    redis?: Partial<RedisCacheConfig>;
    file?: Partial<FileCacheConfig>;
}
/**
 * Create a cache store instance based on type and configuration
 */
export declare function createCacheStore(type: CacheStorageType, config?: StoreConfigurations, logger?: ErrorLogger): ICacheStore;
/**
 * Validate cache store configuration
 */
export declare function validateStoreConfig(type: CacheStorageType, config: StoreConfigurations): boolean;
/**
 * Get default configuration for a store type
 */
export declare function getDefaultStoreConfig(type: CacheStorageType): StoreConfigurations;
//# sourceMappingURL=index.d.ts.map