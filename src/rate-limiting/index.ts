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

// Core components
export { AutotaskRateLimiter, RateLimitConfig, RateLimitMetrics } from './AutotaskRateLimiter';
export { AutotaskRetryPatterns, RetryConfig, RetryMetrics } from './AutotaskRetryPatterns';
export { ZoneManager, ZoneConfiguration, ZoneInfo, ZoneHealth, ZoneMetrics } from './ZoneManager';
export { AutotaskErrorHandler, AutotaskErrorDetails, ErrorPattern } from './AutotaskErrorHandler';
export { 
  ProductionReliabilityManager, 
  ReliabilityConfig, 
  SystemHealth, 
  ReliabilityMetrics 
} from './ProductionReliabilityManager';

// Re-export enhanced error types for convenience
export {
  AutotaskError,
  RateLimitError,
  ServerError,
  NetworkError,
  AuthError,
  ValidationError,
  NotFoundError,
  ConfigurationError
} from '../utils/errors';

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
export function createReliabilitySystem(
  config: ReliabilitySystemConfig = {},
  logger?: winston.Logger
): {
  rateLimiter: AutotaskRateLimiter;
  retryPatterns: AutotaskRetryPatterns;
  zoneManager: ZoneManager;
  errorHandler: AutotaskErrorHandler;
  reliabilityManager: ProductionReliabilityManager;
  logger: winston.Logger;
} {
  // Create logger if not provided
  const systemLogger = logger || winston.createLogger({
    level: config.logging?.level || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    transports: [
      ...(config.logging?.enableConsole !== false ? [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ] : []),
      ...(config.logging?.enableFile ? [
        new winston.transports.File({ 
          filename: config.logging.logFile || 'autotask-reliability.log' 
        })
      ] : [])
    ]
  });
  
  // Create core components
  const rateLimiter = new AutotaskRateLimiter(
    config.rateLimiting || {},
    systemLogger
  );
  
  const retryPatterns = new AutotaskRetryPatterns(
    config.retryPatterns || {},
    systemLogger
  );
  
  const zoneManager = new ZoneManager(
    systemLogger,
    config.zoneManagement?.loadBalancingStrategy
  );
  
  const errorHandler = new AutotaskErrorHandler(systemLogger);
  
  const reliabilityManager = new ProductionReliabilityManager(
    config.reliability || {},
    rateLimiter,
    retryPatterns,
    zoneManager,
    errorHandler,
    systemLogger
  );
  
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
export const PRODUCTION_CONFIG: ReliabilitySystemConfig = {
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
export const DEVELOPMENT_CONFIG: ReliabilitySystemConfig = {
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
export function createProductionReliabilitySystem(
  customConfig: Partial<ReliabilitySystemConfig> = {},
  logger?: winston.Logger
) {
  const config = {
    ...PRODUCTION_CONFIG,
    ...customConfig,
    rateLimiting: { ...PRODUCTION_CONFIG.rateLimiting, ...customConfig.rateLimiting },
    retryPatterns: { ...PRODUCTION_CONFIG.retryPatterns, ...customConfig.retryPatterns },
    zoneManagement: { ...PRODUCTION_CONFIG.zoneManagement, ...customConfig.zoneManagement },
    reliability: { ...PRODUCTION_CONFIG.reliability, ...customConfig.reliability },
    logging: { ...PRODUCTION_CONFIG.logging, ...customConfig.logging }
  };
  
  return createReliabilitySystem(config, logger);
}

/**
 * Create a development-friendly reliability system with minimal overhead
 */
export function createDevelopmentReliabilitySystem(
  customConfig: Partial<ReliabilitySystemConfig> = {},
  logger?: winston.Logger
) {
  const config = {
    ...DEVELOPMENT_CONFIG,
    ...customConfig,
    rateLimiting: { ...DEVELOPMENT_CONFIG.rateLimiting, ...customConfig.rateLimiting },
    retryPatterns: { ...DEVELOPMENT_CONFIG.retryPatterns, ...customConfig.retryPatterns },
    zoneManagement: { ...DEVELOPMENT_CONFIG.zoneManagement, ...customConfig.zoneManagement },
    reliability: { ...DEVELOPMENT_CONFIG.reliability, ...customConfig.reliability },
    logging: { ...DEVELOPMENT_CONFIG.logging, ...customConfig.logging }
  };
  
  return createReliabilitySystem(config, logger);
}