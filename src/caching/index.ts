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

// Core types and interfaces
export * from './types';

// Main cache manager
export { CacheManager } from './CacheManager';

// Storage implementations
export * from './stores';

// Core components
export { CacheKeyGenerator, KeyStrategy } from './CacheKeyGenerator';
export type { KeyGenerationOptions } from './CacheKeyGenerator';

export { TTLManager, TTLStrategy, VolatilityLevel } from './TTLManager';
export type { 
  TTLContext, 
  TTLResult, 
  UpdateFrequencyData, 
  BusinessHoursConfig 
} from './TTLManager';

export { CacheMetricsCollector, MetricEvent } from './CacheMetrics';
export type { 
  MetricDataPoint, 
  MetricThreshold, 
  TimeWindow, 
  HistoricalMetrics 
} from './CacheMetrics';

export { CacheInvalidator } from './CacheInvalidator';
export type { 
  InvalidationRule, 
  InvalidationCondition, 
  InvalidationEvent, 
  DependencyMap, 
  BatchInvalidationRequest 
} from './CacheInvalidator';

export { CacheStrategyExecutor } from './CacheStrategy';
export type { 
  DataFetcher, 
  StrategyContext, 
  StrategyResult, 
  RefreshAheadConfig, 
  WriteBehindConfig 
} from './CacheStrategy';

/**
 * Cache configuration builder for common scenarios
 */
export class CacheConfigBuilder {
  private config: Partial<CacheConfig> = {};

  /**
   * Create development configuration
   */
  static development(): CacheConfigBuilder {
    return new CacheConfigBuilder()
      .withMemoryStorage()
      .withMaxEntries(1000)
      .withDefaultTtl(60000) // 1 minute
      .withMetrics(true)
      .withKeyPrefix('dev:autotask:');
  }

  /**
   * Create production configuration
   */
  static production(): CacheConfigBuilder {
    return new CacheConfigBuilder()
      .withRedisStorage()
      .withMaxEntries(100000)
      .withDefaultTtl(300000) // 5 minutes
      .withMetrics(true)
      .withWarmup(true)
      .withKeyPrefix('prod:autotask:');
  }

  /**
   * Create testing configuration
   */
  static testing(): CacheConfigBuilder {
    return new CacheConfigBuilder()
      .withMemoryStorage()
      .withMaxEntries(100)
      .withDefaultTtl(10000) // 10 seconds
      .withMetrics(false)
      .withKeyPrefix('test:autotask:');
  }

  /**
   * Set storage type to memory
   */
  withMemoryStorage(): CacheConfigBuilder {
    this.config.storageType = CacheStorageType.MEMORY;
    return this;
  }

  /**
   * Set storage type to Redis
   */
  withRedisStorage(host = 'localhost', port = 6379, password?: string): CacheConfigBuilder {
    this.config.storageType = CacheStorageType.REDIS;
    this.config.redis = {
      host,
      port,
      password,
      db: 0,
      keyPrefix: this.config.keyPrefix
    };
    return this;
  }

  /**
   * Set storage type to file
   */
  withFileStorage(directory = './cache'): CacheConfigBuilder {
    this.config.storageType = CacheStorageType.FILE;
    this.config.file = {
      directory,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      cleanupInterval: 5 * 60 * 1000 // 5 minutes
    };
    return this;
  }

  /**
   * Set fallback storage
   */
  withFallback(storageType: CacheStorageType): CacheConfigBuilder {
    this.config.fallbackStorageType = storageType;
    return this;
  }

  /**
   * Set maximum entries
   */
  withMaxEntries(maxEntries: number): CacheConfigBuilder {
    this.config.maxEntries = maxEntries;
    return this;
  }

  /**
   * Set maximum memory usage
   */
  withMaxMemory(bytes: number): CacheConfigBuilder {
    this.config.maxMemoryUsage = bytes;
    return this;
  }

  /**
   * Set default TTL
   */
  withDefaultTtl(milliseconds: number): CacheConfigBuilder {
    this.config.defaultTtl = milliseconds;
    return this;
  }

  /**
   * Enable/disable metrics
   */
  withMetrics(enabled: boolean): CacheConfigBuilder {
    this.config.enableMetrics = enabled;
    return this;
  }

  /**
   * Enable/disable warmup
   */
  withWarmup(enabled: boolean): CacheConfigBuilder {
    this.config.enableWarmup = enabled;
    return this;
  }

  /**
   * Set key prefix
   */
  withKeyPrefix(prefix: string): CacheConfigBuilder {
    this.config.keyPrefix = prefix;
    return this;
  }

  /**
   * Add entity configuration
   */
  withEntityConfig(entityType: string, config: Partial<EntityCacheConfig>): CacheConfigBuilder {
    if (!this.config.entityConfigs) {
      this.config.entityConfigs = new Map();
    }

    const defaultConfig: EntityCacheConfig = {
      entityType,
      defaultTtl: this.config.defaultTtl || 300000,
      maxTtl: 24 * 60 * 60 * 1000, // 24 hours
      minTtl: 60 * 1000, // 1 minute
      strategy: CacheStrategy.LAZY_LOADING,
      cacheEmpty: false,
      maxEntrySize: 1024 * 1024, // 1MB
      defaultTags: [entityType]
    };

    this.config.entityConfigs.set(entityType, { ...defaultConfig, ...config });
    return this;
  }

  /**
   * Enable stampede prevention
   */
  withStampedeProtection(enabled = true, timeout = 5000): CacheConfigBuilder {
    this.config.preventStampede = enabled;
    this.config.stampedeTimeout = timeout;
    return this;
  }

  /**
   * Build the configuration
   */
  build(): CacheConfig {
    // Set defaults for required fields
    const defaultConfig: CacheConfig = {
      storageType: CacheStorageType.MEMORY,
      maxMemoryUsage: 50 * 1024 * 1024, // 50MB
      maxEntries: 5000,
      defaultTtl: 300000, // 5 minutes
      enableMetrics: true,
      enableWarmup: false,
      compressionThreshold: 1024, // 1KB
      entityConfigs: new Map(),
      keyPrefix: 'autotask:cache:',
      preventStampede: true,
      stampedeTimeout: 5000
    };

    return { ...defaultConfig, ...this.config };
  }
}

/**
 * Create a cache manager with common entity configurations
 */
export async function createAutotaskCacheManager(
  config: Partial<CacheConfig> = {},
  logger?: ErrorLogger
): Promise<CacheManager> {
  const builder = new CacheConfigBuilder();

  // Apply base configuration
  Object.entries(config).forEach(([key, value]) => {
    (builder as any).config[key] = value;
  });

  // Add common Autotask entity configurations
  const finalConfig = builder
    // High-volatility entities (short TTL)
    .withEntityConfig('tickets', {
      defaultTtl: 2 * 60 * 1000, // 2 minutes
      strategy: CacheStrategy.LAZY_LOADING,
      defaultTags: ['tickets', 'high-volatility']
    })
    .withEntityConfig('timeentries', {
      defaultTtl: 1 * 60 * 1000, // 1 minute
      strategy: CacheStrategy.LAZY_LOADING,
      defaultTags: ['timeentries', 'high-volatility']
    })
    
    // Medium-volatility entities
    .withEntityConfig('tasks', {
      defaultTtl: 10 * 60 * 1000, // 10 minutes
      strategy: CacheStrategy.REFRESH_AHEAD,
      defaultTags: ['tasks', 'medium-volatility']
    })
    .withEntityConfig('opportunities', {
      defaultTtl: 15 * 60 * 1000, // 15 minutes
      strategy: CacheStrategy.LAZY_LOADING,
      defaultTags: ['opportunities', 'medium-volatility']
    })
    
    // Low-volatility entities (longer TTL)
    .withEntityConfig('companies', {
      defaultTtl: 60 * 60 * 1000, // 1 hour
      strategy: CacheStrategy.REFRESH_AHEAD,
      defaultTags: ['companies', 'low-volatility', 'master-data']
    })
    .withEntityConfig('contacts', {
      defaultTtl: 30 * 60 * 1000, // 30 minutes
      strategy: CacheStrategy.LAZY_LOADING,
      defaultTags: ['contacts', 'low-volatility', 'master-data']
    })
    .withEntityConfig('projects', {
      defaultTtl: 20 * 60 * 1000, // 20 minutes
      strategy: CacheStrategy.LAZY_LOADING,
      defaultTags: ['projects', 'low-volatility']
    })
    .withEntityConfig('contracts', {
      defaultTtl: 2 * 60 * 60 * 1000, // 2 hours
      strategy: CacheStrategy.LAZY_LOADING,
      defaultTags: ['contracts', 'low-volatility']
    })
    
    // Configuration entities (very stable)
    .withEntityConfig('resources', {
      defaultTtl: 4 * 60 * 60 * 1000, // 4 hours
      strategy: CacheStrategy.REFRESH_AHEAD,
      defaultTags: ['resources', 'configuration']
    })
    .withEntityConfig('configurationitems', {
      defaultTtl: 2 * 60 * 60 * 1000, // 2 hours
      strategy: CacheStrategy.LAZY_LOADING,
      defaultTags: ['configurationitems', 'configuration']
    })
    .build();

  const cacheManager = new CacheManager(finalConfig, logger);
  await cacheManager.initialize();

  return cacheManager;
}

/**
 * Cache decorator for methods
 */
export function cached(
  cacheManager: CacheManager,
  options?: {
    entityType?: string;
    ttl?: number;
    tags?: string[];
    keyGenerator?: (args: any[]) => string;
  }
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const entityType = options?.entityType || 'default';
      const keyContext: CacheKeyContext = {
        method: 'GET',
        endpoint: `/${entityType}/${propertyName}`,
        entityType,
        params: { args: options?.keyGenerator ? options.keyGenerator(args) : JSON.stringify(args) }
      };

      try {
        const result = await cacheManager.executeStrategy(
          keyContext,
          () => method.apply(this, args),
          {
            customTtl: options?.ttl,
            tags: options?.tags
          }
        );
        return result;
      } catch (error) {
        // Fallback to direct method call if cache fails
        return method.apply(this, args);
      }
    };

    return descriptor;
  };
}

// Re-export all types for convenience
import {
  CacheConfig,
  CacheStorageType,
  CacheStrategy,
  InvalidationPattern,
  EntityCacheConfig,
  CacheKeyContext
} from './types';
import { ErrorLogger } from '../errors/ErrorLogger';
import { CacheManager } from './CacheManager';

export {
  CacheConfig,
  CacheStorageType,
  CacheStrategy,
  InvalidationPattern,
  EntityCacheConfig,
  CacheKeyContext
};

/**
 * Default entity configurations for common Autotask entities
 */
export const DEFAULT_ENTITY_CONFIGS = new Map<string, EntityCacheConfig>([
  ['tickets', {
    entityType: 'tickets',
    defaultTtl: 2 * 60 * 1000,
    maxTtl: 10 * 60 * 1000,
    minTtl: 30 * 1000,
    strategy: CacheStrategy.LAZY_LOADING,
    cacheEmpty: false,
    maxEntrySize: 500 * 1024,
    defaultTags: ['tickets', 'high-volatility']
  }],
  ['companies', {
    entityType: 'companies',
    defaultTtl: 60 * 60 * 1000,
    maxTtl: 4 * 60 * 60 * 1000,
    minTtl: 5 * 60 * 1000,
    strategy: CacheStrategy.REFRESH_AHEAD,
    cacheEmpty: false,
    maxEntrySize: 100 * 1024,
    defaultTags: ['companies', 'master-data']
  }],
  ['contacts', {
    entityType: 'contacts',
    defaultTtl: 30 * 60 * 1000,
    maxTtl: 2 * 60 * 60 * 1000,
    minTtl: 2 * 60 * 1000,
    strategy: CacheStrategy.LAZY_LOADING,
    cacheEmpty: false,
    maxEntrySize: 50 * 1024,
    defaultTags: ['contacts', 'master-data']
  }]
]);