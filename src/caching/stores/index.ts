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
import { MemoryCacheStore, MemoryCacheConfig } from './MemoryCacheStore';
import { RedisCacheStore, RedisCacheConfig } from './RedisCacheStore';
import { FileCacheStore, FileCacheConfig } from './FileCacheStore';
import { ErrorLogger, defaultErrorLogger } from '../../errors/ErrorLogger';

export interface StoreConfigurations {
  memory?: Partial<MemoryCacheConfig>;
  redis?: Partial<RedisCacheConfig>;
  file?: Partial<FileCacheConfig>;
}

/**
 * Create a cache store instance based on type and configuration
 */
export function createCacheStore(
  type: CacheStorageType,
  config: StoreConfigurations = {},
  logger: ErrorLogger = defaultErrorLogger
): ICacheStore {
  switch (type) {
    case CacheStorageType.MEMORY:
      return new MemoryCacheStore(config.memory);
      
    case CacheStorageType.REDIS:
      return new RedisCacheStore(config.redis, logger);
      
    case CacheStorageType.FILE:
      return new FileCacheStore(config.file, logger);
      
    default:
      throw new Error(`Unsupported cache storage type: ${type}`);
  }
}

/**
 * Validate cache store configuration
 */
export function validateStoreConfig(
  type: CacheStorageType,
  config: StoreConfigurations
): boolean {
  switch (type) {
    case CacheStorageType.MEMORY:
      return true; // Memory store has sensible defaults
      
    case CacheStorageType.REDIS:
      // Redis needs at least connection info
      return !!(config.redis?.redis?.host || process.env.REDIS_HOST);
      
    case CacheStorageType.FILE:
      // File store needs a directory
      return !!(config.file?.directory || './cache');
      
    default:
      return false;
  }
}

/**
 * Get default configuration for a store type
 */
export function getDefaultStoreConfig(type: CacheStorageType): StoreConfigurations {
  switch (type) {
    case CacheStorageType.MEMORY:
      return { memory: {} };
      
    case CacheStorageType.REDIS:
      return {
        redis: {
          redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            db: parseInt(process.env.REDIS_DB || '0')
          }
        }
      };
      
    case CacheStorageType.FILE:
      return {
        file: {
          directory: process.env.CACHE_DIRECTORY || './cache'
        }
      };
      
    default:
      return {};
  }
}