"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ENTITY_CONFIGS = exports.InvalidationPattern = exports.CacheStrategy = exports.CacheStorageType = exports.CacheConfigBuilder = exports.CacheStrategyExecutor = exports.CacheInvalidator = exports.MetricEvent = exports.CacheMetricsCollector = exports.VolatilityLevel = exports.TTLStrategy = exports.TTLManager = exports.KeyStrategy = exports.CacheKeyGenerator = exports.CacheManager = void 0;
exports.createAutotaskCacheManager = createAutotaskCacheManager;
exports.cached = cached;
// Core types and interfaces
__exportStar(require("./types"), exports);
// Main cache manager
var CacheManager_1 = require("./CacheManager");
Object.defineProperty(exports, "CacheManager", { enumerable: true, get: function () { return CacheManager_1.CacheManager; } });
// Storage implementations
__exportStar(require("./stores"), exports);
// Core components
var CacheKeyGenerator_1 = require("./CacheKeyGenerator");
Object.defineProperty(exports, "CacheKeyGenerator", { enumerable: true, get: function () { return CacheKeyGenerator_1.CacheKeyGenerator; } });
Object.defineProperty(exports, "KeyStrategy", { enumerable: true, get: function () { return CacheKeyGenerator_1.KeyStrategy; } });
var TTLManager_1 = require("./TTLManager");
Object.defineProperty(exports, "TTLManager", { enumerable: true, get: function () { return TTLManager_1.TTLManager; } });
Object.defineProperty(exports, "TTLStrategy", { enumerable: true, get: function () { return TTLManager_1.TTLStrategy; } });
Object.defineProperty(exports, "VolatilityLevel", { enumerable: true, get: function () { return TTLManager_1.VolatilityLevel; } });
var CacheMetrics_1 = require("./CacheMetrics");
Object.defineProperty(exports, "CacheMetricsCollector", { enumerable: true, get: function () { return CacheMetrics_1.CacheMetricsCollector; } });
Object.defineProperty(exports, "MetricEvent", { enumerable: true, get: function () { return CacheMetrics_1.MetricEvent; } });
var CacheInvalidator_1 = require("./CacheInvalidator");
Object.defineProperty(exports, "CacheInvalidator", { enumerable: true, get: function () { return CacheInvalidator_1.CacheInvalidator; } });
var CacheStrategy_1 = require("./CacheStrategy");
Object.defineProperty(exports, "CacheStrategyExecutor", { enumerable: true, get: function () { return CacheStrategy_1.CacheStrategyExecutor; } });
/**
 * Cache configuration builder for common scenarios
 */
class CacheConfigBuilder {
    constructor() {
        this.config = {};
    }
    /**
     * Create development configuration
     */
    static development() {
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
    static production() {
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
    static testing() {
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
    withMemoryStorage() {
        this.config.storageType = types_1.CacheStorageType.MEMORY;
        return this;
    }
    /**
     * Set storage type to Redis
     */
    withRedisStorage(host = 'localhost', port = 6379, password) {
        this.config.storageType = types_1.CacheStorageType.REDIS;
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
    withFileStorage(directory = './cache') {
        this.config.storageType = types_1.CacheStorageType.FILE;
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
    withFallback(storageType) {
        this.config.fallbackStorageType = storageType;
        return this;
    }
    /**
     * Set maximum entries
     */
    withMaxEntries(maxEntries) {
        this.config.maxEntries = maxEntries;
        return this;
    }
    /**
     * Set maximum memory usage
     */
    withMaxMemory(bytes) {
        this.config.maxMemoryUsage = bytes;
        return this;
    }
    /**
     * Set default TTL
     */
    withDefaultTtl(milliseconds) {
        this.config.defaultTtl = milliseconds;
        return this;
    }
    /**
     * Enable/disable metrics
     */
    withMetrics(enabled) {
        this.config.enableMetrics = enabled;
        return this;
    }
    /**
     * Enable/disable warmup
     */
    withWarmup(enabled) {
        this.config.enableWarmup = enabled;
        return this;
    }
    /**
     * Set key prefix
     */
    withKeyPrefix(prefix) {
        this.config.keyPrefix = prefix;
        return this;
    }
    /**
     * Add entity configuration
     */
    withEntityConfig(entityType, config) {
        if (!this.config.entityConfigs) {
            this.config.entityConfigs = new Map();
        }
        const defaultConfig = {
            entityType,
            defaultTtl: this.config.defaultTtl || 300000,
            maxTtl: 24 * 60 * 60 * 1000, // 24 hours
            minTtl: 60 * 1000, // 1 minute
            strategy: types_1.CacheStrategy.LAZY_LOADING,
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
    withStampedeProtection(enabled = true, timeout = 5000) {
        this.config.preventStampede = enabled;
        this.config.stampedeTimeout = timeout;
        return this;
    }
    /**
     * Build the configuration
     */
    build() {
        // Set defaults for required fields
        const defaultConfig = {
            storageType: types_1.CacheStorageType.MEMORY,
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
exports.CacheConfigBuilder = CacheConfigBuilder;
/**
 * Create a cache manager with common entity configurations
 */
async function createAutotaskCacheManager(config = {}, logger) {
    const builder = new CacheConfigBuilder();
    // Apply base configuration
    Object.entries(config).forEach(([key, value]) => {
        builder.config[key] = value;
    });
    // Add common Autotask entity configurations
    const finalConfig = builder
        // High-volatility entities (short TTL)
        .withEntityConfig('tickets', {
        defaultTtl: 2 * 60 * 1000, // 2 minutes
        strategy: types_1.CacheStrategy.LAZY_LOADING,
        defaultTags: ['tickets', 'high-volatility']
    })
        .withEntityConfig('timeentries', {
        defaultTtl: 1 * 60 * 1000, // 1 minute
        strategy: types_1.CacheStrategy.LAZY_LOADING,
        defaultTags: ['timeentries', 'high-volatility']
    })
        // Medium-volatility entities
        .withEntityConfig('tasks', {
        defaultTtl: 10 * 60 * 1000, // 10 minutes
        strategy: types_1.CacheStrategy.REFRESH_AHEAD,
        defaultTags: ['tasks', 'medium-volatility']
    })
        .withEntityConfig('opportunities', {
        defaultTtl: 15 * 60 * 1000, // 15 minutes
        strategy: types_1.CacheStrategy.LAZY_LOADING,
        defaultTags: ['opportunities', 'medium-volatility']
    })
        // Low-volatility entities (longer TTL)
        .withEntityConfig('companies', {
        defaultTtl: 60 * 60 * 1000, // 1 hour
        strategy: types_1.CacheStrategy.REFRESH_AHEAD,
        defaultTags: ['companies', 'low-volatility', 'master-data']
    })
        .withEntityConfig('contacts', {
        defaultTtl: 30 * 60 * 1000, // 30 minutes
        strategy: types_1.CacheStrategy.LAZY_LOADING,
        defaultTags: ['contacts', 'low-volatility', 'master-data']
    })
        .withEntityConfig('projects', {
        defaultTtl: 20 * 60 * 1000, // 20 minutes
        strategy: types_1.CacheStrategy.LAZY_LOADING,
        defaultTags: ['projects', 'low-volatility']
    })
        .withEntityConfig('contracts', {
        defaultTtl: 2 * 60 * 60 * 1000, // 2 hours
        strategy: types_1.CacheStrategy.LAZY_LOADING,
        defaultTags: ['contracts', 'low-volatility']
    })
        // Configuration entities (very stable)
        .withEntityConfig('resources', {
        defaultTtl: 4 * 60 * 60 * 1000, // 4 hours
        strategy: types_1.CacheStrategy.REFRESH_AHEAD,
        defaultTags: ['resources', 'configuration']
    })
        .withEntityConfig('configurationitems', {
        defaultTtl: 2 * 60 * 60 * 1000, // 2 hours
        strategy: types_1.CacheStrategy.LAZY_LOADING,
        defaultTags: ['configurationitems', 'configuration']
    })
        .build();
    const cacheManager = new CacheManager_2.CacheManager(finalConfig, logger);
    await cacheManager.initialize();
    return cacheManager;
}
/**
 * Cache decorator for methods
 */
function cached(cacheManager, options) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = async function (...args) {
            const entityType = options?.entityType || 'default';
            const keyContext = {
                method: 'GET',
                endpoint: `/${entityType}/${propertyName}`,
                entityType,
                params: { args: options?.keyGenerator ? options.keyGenerator(args) : JSON.stringify(args) }
            };
            try {
                const result = await cacheManager.executeStrategy(keyContext, () => method.apply(this, args), {
                    customTtl: options?.ttl,
                    tags: options?.tags
                });
                return result;
            }
            catch (error) {
                // Fallback to direct method call if cache fails
                return method.apply(this, args);
            }
        };
        return descriptor;
    };
}
// Re-export all types for convenience
const types_1 = require("./types");
Object.defineProperty(exports, "CacheStorageType", { enumerable: true, get: function () { return types_1.CacheStorageType; } });
Object.defineProperty(exports, "CacheStrategy", { enumerable: true, get: function () { return types_1.CacheStrategy; } });
Object.defineProperty(exports, "InvalidationPattern", { enumerable: true, get: function () { return types_1.InvalidationPattern; } });
const CacheManager_2 = require("./CacheManager");
/**
 * Default entity configurations for common Autotask entities
 */
exports.DEFAULT_ENTITY_CONFIGS = new Map([
    ['tickets', {
            entityType: 'tickets',
            defaultTtl: 2 * 60 * 1000,
            maxTtl: 10 * 60 * 1000,
            minTtl: 30 * 1000,
            strategy: types_1.CacheStrategy.LAZY_LOADING,
            cacheEmpty: false,
            maxEntrySize: 500 * 1024,
            defaultTags: ['tickets', 'high-volatility']
        }],
    ['companies', {
            entityType: 'companies',
            defaultTtl: 60 * 60 * 1000,
            maxTtl: 4 * 60 * 60 * 1000,
            minTtl: 5 * 60 * 1000,
            strategy: types_1.CacheStrategy.REFRESH_AHEAD,
            cacheEmpty: false,
            maxEntrySize: 100 * 1024,
            defaultTags: ['companies', 'master-data']
        }],
    ['contacts', {
            entityType: 'contacts',
            defaultTtl: 30 * 60 * 1000,
            maxTtl: 2 * 60 * 60 * 1000,
            minTtl: 2 * 60 * 1000,
            strategy: types_1.CacheStrategy.LAZY_LOADING,
            cacheEmpty: false,
            maxEntrySize: 50 * 1024,
            defaultTags: ['contacts', 'master-data']
        }]
]);
//# sourceMappingURL=index.js.map