"use strict";
/**
 * Autotask Rate Limiting and Reliability System
 *
 * This module provides enterprise-grade rate limiting, retry patterns,
 * zone management, error handling, and production reliability features
 * specifically designed for Autotask APIs.
 *
 * @example
 * ```typescript
 * import {
 *   AutotaskRateLimiter,
 *   AutotaskRetryPatterns,
 *   ZoneManager,
 *   AutotaskErrorHandler,
 *   ProductionReliabilityManager
 * } from './rate-limiting';
 *
 * // Create comprehensive reliability system
 * const rateLimiter = new AutotaskRateLimiter(config, logger);
 * const retryPatterns = new AutotaskRetryPatterns(retryConfig, logger);
 * const zoneManager = new ZoneManager(logger);
 * const errorHandler = new AutotaskErrorHandler(logger);
 * const reliabilityManager = new ProductionReliabilityManager(
 *   config, rateLimiter, retryPatterns, zoneManager, errorHandler, logger
 * );
 * ```
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEVELOPMENT_CONFIG = exports.PRODUCTION_CONFIG = exports.ConfigurationError = exports.NotFoundError = exports.ValidationError = exports.AuthError = exports.NetworkError = exports.ServerError = exports.RateLimitError = exports.AutotaskError = exports.ProductionReliabilityManager = exports.AutotaskErrorHandler = exports.ZoneManager = exports.AutotaskRetryPatterns = exports.AutotaskRateLimiter = void 0;
exports.createReliabilitySystem = createReliabilitySystem;
exports.createProductionReliabilitySystem = createProductionReliabilitySystem;
exports.createDevelopmentReliabilitySystem = createDevelopmentReliabilitySystem;
// Core components
var AutotaskRateLimiter_1 = require("./AutotaskRateLimiter");
Object.defineProperty(exports, "AutotaskRateLimiter", { enumerable: true, get: function () { return AutotaskRateLimiter_1.AutotaskRateLimiter; } });
var AutotaskRetryPatterns_1 = require("./AutotaskRetryPatterns");
Object.defineProperty(exports, "AutotaskRetryPatterns", { enumerable: true, get: function () { return AutotaskRetryPatterns_1.AutotaskRetryPatterns; } });
var ZoneManager_1 = require("./ZoneManager");
Object.defineProperty(exports, "ZoneManager", { enumerable: true, get: function () { return ZoneManager_1.ZoneManager; } });
var AutotaskErrorHandler_1 = require("./AutotaskErrorHandler");
Object.defineProperty(exports, "AutotaskErrorHandler", { enumerable: true, get: function () { return AutotaskErrorHandler_1.AutotaskErrorHandler; } });
var ProductionReliabilityManager_1 = require("./ProductionReliabilityManager");
Object.defineProperty(exports, "ProductionReliabilityManager", { enumerable: true, get: function () { return ProductionReliabilityManager_1.ProductionReliabilityManager; } });
// Re-export enhanced error types for convenience
var errors_1 = require("../utils/errors");
Object.defineProperty(exports, "AutotaskError", { enumerable: true, get: function () { return errors_1.AutotaskError; } });
Object.defineProperty(exports, "RateLimitError", { enumerable: true, get: function () { return errors_1.RateLimitError; } });
Object.defineProperty(exports, "ServerError", { enumerable: true, get: function () { return errors_1.ServerError; } });
Object.defineProperty(exports, "NetworkError", { enumerable: true, get: function () { return errors_1.NetworkError; } });
Object.defineProperty(exports, "AuthError", { enumerable: true, get: function () { return errors_1.AuthError; } });
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return errors_1.ValidationError; } });
Object.defineProperty(exports, "NotFoundError", { enumerable: true, get: function () { return errors_1.NotFoundError; } });
Object.defineProperty(exports, "ConfigurationError", { enumerable: true, get: function () { return errors_1.ConfigurationError; } });
/**
 * Factory function to create a complete reliability system
 */
const winston_1 = __importDefault(require("winston"));
const AutotaskRateLimiter_2 = require("./AutotaskRateLimiter");
const AutotaskRetryPatterns_2 = require("./AutotaskRetryPatterns");
const ZoneManager_2 = require("./ZoneManager");
const AutotaskErrorHandler_2 = require("./AutotaskErrorHandler");
const ProductionReliabilityManager_2 = require("./ProductionReliabilityManager");
/**
 * Creates a complete Autotask reliability system with all components
 */
function createReliabilitySystem(config = {}, logger) {
    // Create logger if not provided
    const systemLogger = logger || winston_1.default.createLogger({
        level: config.logging?.level || 'info',
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
        transports: [
            ...(config.logging?.enableConsole !== false ? [
                new winston_1.default.transports.Console({
                    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
                })
            ] : []),
            ...(config.logging?.enableFile ? [
                new winston_1.default.transports.File({
                    filename: config.logging.logFile || 'autotask-reliability.log'
                })
            ] : [])
        ]
    });
    // Create core components
    const rateLimiter = new AutotaskRateLimiter_2.AutotaskRateLimiter(config.rateLimiting || {}, systemLogger);
    const retryPatterns = new AutotaskRetryPatterns_2.AutotaskRetryPatterns(config.retryPatterns || {}, systemLogger);
    const zoneManager = new ZoneManager_2.ZoneManager(systemLogger, config.zoneManagement?.loadBalancingStrategy);
    const errorHandler = new AutotaskErrorHandler_2.AutotaskErrorHandler(systemLogger);
    const reliabilityManager = new ProductionReliabilityManager_2.ProductionReliabilityManager(config.reliability || {}, rateLimiter, retryPatterns, zoneManager, errorHandler, systemLogger);
    systemLogger.info('Autotask reliability system created successfully', {
        components: [
            'AutotaskRateLimiter',
            'AutotaskRetryPatterns',
            'ZoneManager',
            'AutotaskErrorHandler',
            'ProductionReliabilityManager'
        ]
    });
    return {
        rateLimiter,
        retryPatterns,
        zoneManager,
        errorHandler,
        reliabilityManager,
        logger: systemLogger
    };
}
/**
 * Default configuration for production environments
 */
exports.PRODUCTION_CONFIG = {
    rateLimiting: {
        hourlyRequestLimit: 10000,
        threadLimitPerEndpoint: 3,
        enableZoneAwareThrottling: true,
        enablePredictiveThrottling: true,
        maxQueueSize: 1000,
        queueTimeout: 300000
    },
    retryPatterns: {
        maxRetries: 5,
        baseDelayMs: 1000,
        maxDelayMs: 60000,
        jitterFactor: 0.1,
        backoffMultiplier: 2.0,
        circuitBreakerThreshold: 0.5,
        enableRequestReplay: true,
        enableErrorLearning: true
    },
    zoneManagement: {
        loadBalancingStrategy: { type: 'weighted_response_time' }
    },
    reliability: {
        maxQueueSize: 10000,
        enableGracefulDegradation: true,
        enableLoadShedding: true,
        batchingEnabled: true,
        enableReconciliation: true,
        degradationThresholds: {
            queueUtilization: 0.8,
            errorRate: 0.1,
            responseTime: 10000
        }
    },
    logging: {
        level: 'info',
        enableConsole: true,
        enableFile: true,
        logFile: 'autotask-production.log'
    }
};
/**
 * Default configuration for development environments
 */
exports.DEVELOPMENT_CONFIG = {
    rateLimiting: {
        hourlyRequestLimit: 1000,
        threadLimitPerEndpoint: 2,
        enableZoneAwareThrottling: true,
        enablePredictiveThrottling: false,
        maxQueueSize: 100,
        queueTimeout: 60000
    },
    retryPatterns: {
        maxRetries: 3,
        baseDelayMs: 500,
        maxDelayMs: 10000,
        enableRequestReplay: false,
        enableErrorLearning: false
    },
    zoneManagement: {
        loadBalancingStrategy: { type: 'round_robin' }
    },
    reliability: {
        maxQueueSize: 1000,
        enableGracefulDegradation: false,
        enableLoadShedding: false,
        batchingEnabled: false,
        enableReconciliation: false
    },
    logging: {
        level: 'debug',
        enableConsole: true,
        enableFile: false
    }
};
/**
 * Create a production-ready reliability system with optimal defaults
 */
function createProductionReliabilitySystem(customConfig = {}, logger) {
    const config = {
        ...exports.PRODUCTION_CONFIG,
        ...customConfig,
        rateLimiting: { ...exports.PRODUCTION_CONFIG.rateLimiting, ...customConfig.rateLimiting },
        retryPatterns: { ...exports.PRODUCTION_CONFIG.retryPatterns, ...customConfig.retryPatterns },
        zoneManagement: { ...exports.PRODUCTION_CONFIG.zoneManagement, ...customConfig.zoneManagement },
        reliability: { ...exports.PRODUCTION_CONFIG.reliability, ...customConfig.reliability },
        logging: { ...exports.PRODUCTION_CONFIG.logging, ...customConfig.logging }
    };
    return createReliabilitySystem(config, logger);
}
/**
 * Create a development-friendly reliability system with minimal overhead
 */
function createDevelopmentReliabilitySystem(customConfig = {}, logger) {
    const config = {
        ...exports.DEVELOPMENT_CONFIG,
        ...customConfig,
        rateLimiting: { ...exports.DEVELOPMENT_CONFIG.rateLimiting, ...customConfig.rateLimiting },
        retryPatterns: { ...exports.DEVELOPMENT_CONFIG.retryPatterns, ...customConfig.retryPatterns },
        zoneManagement: { ...exports.DEVELOPMENT_CONFIG.zoneManagement, ...customConfig.zoneManagement },
        reliability: { ...exports.DEVELOPMENT_CONFIG.reliability, ...customConfig.reliability },
        logging: { ...exports.DEVELOPMENT_CONFIG.logging, ...customConfig.logging }
    };
    return createReliabilitySystem(config, logger);
}
//# sourceMappingURL=index.js.map