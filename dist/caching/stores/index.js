"use strict";
/**
 * Cache Store Implementations
 *
 * Export all available cache store implementations for the Autotask SDK.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_FILE_CONFIG = exports.FileCacheStore = exports.DEFAULT_REDIS_CONFIG = exports.RedisCacheStore = exports.DEFAULT_MEMORY_CONFIG = exports.MemoryCacheStore = void 0;
exports.createCacheStore = createCacheStore;
exports.validateStoreConfig = validateStoreConfig;
exports.getDefaultStoreConfig = getDefaultStoreConfig;
var MemoryCacheStore_1 = require("./MemoryCacheStore");
Object.defineProperty(exports, "MemoryCacheStore", { enumerable: true, get: function () { return MemoryCacheStore_1.MemoryCacheStore; } });
Object.defineProperty(exports, "DEFAULT_MEMORY_CONFIG", { enumerable: true, get: function () { return MemoryCacheStore_1.DEFAULT_MEMORY_CONFIG; } });
var RedisCacheStore_1 = require("./RedisCacheStore");
Object.defineProperty(exports, "RedisCacheStore", { enumerable: true, get: function () { return RedisCacheStore_1.RedisCacheStore; } });
Object.defineProperty(exports, "DEFAULT_REDIS_CONFIG", { enumerable: true, get: function () { return RedisCacheStore_1.DEFAULT_REDIS_CONFIG; } });
var FileCacheStore_1 = require("./FileCacheStore");
Object.defineProperty(exports, "FileCacheStore", { enumerable: true, get: function () { return FileCacheStore_1.FileCacheStore; } });
Object.defineProperty(exports, "DEFAULT_FILE_CONFIG", { enumerable: true, get: function () { return FileCacheStore_1.DEFAULT_FILE_CONFIG; } });
/**
 * Store factory for creating cache stores based on configuration
 */
const types_1 = require("../types");
const MemoryCacheStore_2 = require("./MemoryCacheStore");
const RedisCacheStore_2 = require("./RedisCacheStore");
const FileCacheStore_2 = require("./FileCacheStore");
const ErrorLogger_1 = require("../../errors/ErrorLogger");
/**
 * Create a cache store instance based on type and configuration
 */
function createCacheStore(type, config = {}, logger = ErrorLogger_1.defaultErrorLogger) {
    switch (type) {
        case types_1.CacheStorageType.MEMORY:
            return new MemoryCacheStore_2.MemoryCacheStore(config.memory);
        case types_1.CacheStorageType.REDIS:
            return new RedisCacheStore_2.RedisCacheStore(config.redis, logger);
        case types_1.CacheStorageType.FILE:
            return new FileCacheStore_2.FileCacheStore(config.file, logger);
        default:
            throw new Error(`Unsupported cache storage type: ${type}`);
    }
}
/**
 * Validate cache store configuration
 */
function validateStoreConfig(type, config) {
    switch (type) {
        case types_1.CacheStorageType.MEMORY:
            return true; // Memory store has sensible defaults
        case types_1.CacheStorageType.REDIS:
            // Redis needs at least connection info
            return !!(config.redis?.redis?.host || process.env.REDIS_HOST);
        case types_1.CacheStorageType.FILE:
            // File store needs a directory
            return !!(config.file?.directory || './cache');
        default:
            return false;
    }
}
/**
 * Get default configuration for a store type
 */
function getDefaultStoreConfig(type) {
    switch (type) {
        case types_1.CacheStorageType.MEMORY:
            return { memory: {} };
        case types_1.CacheStorageType.REDIS:
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
        case types_1.CacheStorageType.FILE:
            return {
                file: {
                    directory: process.env.CACHE_DIRECTORY || './cache'
                }
            };
        default:
            return {};
    }
}
//# sourceMappingURL=index.js.map