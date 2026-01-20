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
export { AutotaskRateLimiter, RateLimitConfig, RateLimitMetrics } from './AutotaskRateLimiter';
export { AutotaskRetryPatterns, RetryConfig, RetryMetrics } from './AutotaskRetryPatterns';
export { ZoneManager, ZoneConfiguration, ZoneInfo, ZoneHealth, ZoneMetrics } from './ZoneManager';
export { AutotaskErrorHandler, AutotaskErrorDetails, ErrorPattern } from './AutotaskErrorHandler';
export { ProductionReliabilityManager, ReliabilityConfig, SystemHealth, ReliabilityMetrics } from './ProductionReliabilityManager';
export { AutotaskError, RateLimitError, ServerError, NetworkError, AuthError, ValidationError, NotFoundError, ConfigurationError } from '../utils/errors';
/**
 * Factory function to create a complete reliability system
 */
import winston from 'winston';
import { AutotaskRateLimiter } from './AutotaskRateLimiter';
import { AutotaskRetryPatterns } from './AutotaskRetryPatterns';
import { ZoneManager } from './ZoneManager';
import { AutotaskErrorHandler } from './AutotaskErrorHandler';
import { ProductionReliabilityManager } from './ProductionReliabilityManager';
export interface ReliabilitySystemConfig {
    rateLimiting?: Partial<import('./AutotaskRateLimiter').RateLimitConfig>;
    retryPatterns?: Partial<import('./AutotaskRetryPatterns').RetryConfig>;
    zoneManagement?: {
        loadBalancingStrategy?: import('./ZoneManager').LoadBalancingStrategy;
    };
    reliability?: Partial<import('./ProductionReliabilityManager').ReliabilityConfig>;
    logging?: {
        level?: string;
        enableConsole?: boolean;
        enableFile?: boolean;
        logFile?: string;
    };
}
/**
 * Creates a complete Autotask reliability system with all components
 */
export declare function createReliabilitySystem(config?: ReliabilitySystemConfig, logger?: winston.Logger): {
    rateLimiter: AutotaskRateLimiter;
    retryPatterns: AutotaskRetryPatterns;
    zoneManager: ZoneManager;
    errorHandler: AutotaskErrorHandler;
    reliabilityManager: ProductionReliabilityManager;
    logger: winston.Logger;
};
/**
 * Default configuration for production environments
 */
export declare const PRODUCTION_CONFIG: ReliabilitySystemConfig;
/**
 * Default configuration for development environments
 */
export declare const DEVELOPMENT_CONFIG: ReliabilitySystemConfig;
/**
 * Create a production-ready reliability system with optimal defaults
 */
export declare function createProductionReliabilitySystem(customConfig?: Partial<ReliabilitySystemConfig>, logger?: winston.Logger): {
    rateLimiter: AutotaskRateLimiter;
    retryPatterns: AutotaskRetryPatterns;
    zoneManager: ZoneManager;
    errorHandler: AutotaskErrorHandler;
    reliabilityManager: ProductionReliabilityManager;
    logger: winston.Logger;
};
/**
 * Create a development-friendly reliability system with minimal overhead
 */
export declare function createDevelopmentReliabilitySystem(customConfig?: Partial<ReliabilitySystemConfig>, logger?: winston.Logger): {
    rateLimiter: AutotaskRateLimiter;
    retryPatterns: AutotaskRetryPatterns;
    zoneManager: ZoneManager;
    errorHandler: AutotaskErrorHandler;
    reliabilityManager: ProductionReliabilityManager;
    logger: winston.Logger;
};
//# sourceMappingURL=index.d.ts.map