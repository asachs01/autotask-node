/**
 * Queue Factory Utilities
 *
 * Factory functions and utilities for creating and configuring
 * queue components with sensible defaults and validation.
 */

import winston from 'winston';
import { QueueManager, QueueManagerOptions } from '../core/QueueManager';
import { QueueConfiguration, QueueStorageBackend } from '../types/QueueTypes';
import { MemoryBackend } from '../backends/MemoryBackend';
import { SQLiteBackend } from '../backends/SQLiteBackend';
import { RedisBackend } from '../backends/RedisBackend';

/**
 * Create a QueueManager with intelligent defaults
 */
export async function createQueueManager(
  options: Partial<QueueManagerOptions> = {}
): Promise<QueueManager> {
  const logger = options.logger || createDefaultLogger();
  const config = createDefaultConfiguration(options.config);

  const queueManager = new QueueManager({
    config,
    logger,
    ...options,
  });

  await queueManager.initialize();

  return queueManager;
}

/**
 * Create default queue configuration
 */
export function createDefaultConfiguration(
  overrides: Partial<QueueConfiguration> = {}
): QueueConfiguration {
  return {
    name: 'autotask-queue',
    maxSize: 10000,
    processingMode: 'parallel',
    maxConcurrency: 10,
    priorityEnabled: true,
    batchingEnabled: true,
    maxBatchSize: 10,
    batchTimeout: 1000,
    deduplicationEnabled: true,
    deduplicationWindow: 60000,
    defaultTimeout: 300000, // 5 minutes
    defaultRetries: 3,
    persistence: {
      backend: 'memory',
      options: {
        checkpoints: true,
        checkpointInterval: 30000,
        compression: false,
        retentionPeriod: 86400000, // 24 hours
      },
    },
    strategies: {
      priorityStrategy: 'priority',
      retryStrategy: {
        baseDelay: 1000,
        maxDelay: 30000,
        multiplier: 2,
        jitter: true,
        jitterRange: 0.1,
      },
      circuitBreaker: {
        enabled: true,
        failureThreshold: 5,
        successThreshold: 3,
        timeout: 60000,
      },
      loadBalancing: 'zone-based',
    },
    ...overrides,
  };
}

/**
 * Create production-ready configuration
 */
export function createProductionConfiguration(
  overrides: Partial<QueueConfiguration> = {}
): QueueConfiguration {
  return createDefaultConfiguration({
    maxSize: 50000,
    maxConcurrency: 20,
    batchingEnabled: true,
    maxBatchSize: 20,
    batchTimeout: 500,
    persistence: {
      backend: 'sqlite',
      connection: {
        dbPath: './data/autotask-queue.db',
      },
      options: {
        checkpoints: true,
        checkpointInterval: 15000,
        compression: true,
        retentionPeriod: 604800000, // 7 days
        walMode: true,
      },
    },
    strategies: {
      priorityStrategy: 'adaptive',
      retryStrategy: {
        baseDelay: 500,
        maxDelay: 60000,
        multiplier: 1.5,
        jitter: true,
        jitterRange: 0.2,
      },
      circuitBreaker: {
        enabled: true,
        failureThreshold: 3,
        successThreshold: 5,
        timeout: 30000,
      },
      loadBalancing: 'adaptive',
    },
    ...overrides,
  });
}

/**
 * Create high-performance configuration for Redis
 */
export function createRedisConfiguration(
  redisConfig: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  },
  overrides: Partial<QueueConfiguration> = {}
): QueueConfiguration {
  return createDefaultConfiguration({
    maxSize: 100000,
    maxConcurrency: 50,
    batchingEnabled: true,
    maxBatchSize: 50,
    batchTimeout: 200,
    deduplicationWindow: 300000, // 5 minutes
    persistence: {
      backend: 'redis',
      connection: {
        redis: redisConfig,
      },
      options: {
        checkpoints: true,
        checkpointInterval: 10000,
        compression: true,
        retentionPeriod: 1209600000, // 14 days
      },
    },
    strategies: {
      priorityStrategy: 'adaptive',
      retryStrategy: {
        baseDelay: 250,
        maxDelay: 30000,
        multiplier: 1.3,
        jitter: true,
        jitterRange: 0.15,
      },
      circuitBreaker: {
        enabled: true,
        failureThreshold: 2,
        successThreshold: 10,
        timeout: 15000,
      },
      loadBalancing: 'adaptive',
    },
    ...overrides,
  });
}

/**
 * Create development configuration
 */
export function createDevelopmentConfiguration(
  overrides: Partial<QueueConfiguration> = {}
): QueueConfiguration {
  return createDefaultConfiguration({
    maxSize: 1000,
    maxConcurrency: 3,
    batchingEnabled: false, // Simpler debugging
    deduplicationEnabled: false,
    persistence: {
      backend: 'memory',
      options: {
        checkpoints: false,
        compression: false,
        retentionPeriod: 3600000, // 1 hour
      },
    },
    strategies: {
      priorityStrategy: 'fifo',
      retryStrategy: {
        baseDelay: 2000,
        maxDelay: 10000,
        multiplier: 2,
        jitter: false,
      },
      circuitBreaker: {
        enabled: true,
        failureThreshold: 10,
        successThreshold: 2,
        timeout: 120000,
      },
      loadBalancing: 'round-robin',
    },
    ...overrides,
  });
}

/**
 * Create testing configuration
 */
export function createTestConfiguration(
  overrides: Partial<QueueConfiguration> = {}
): QueueConfiguration {
  return createDefaultConfiguration({
    name: 'test-queue',
    maxSize: 100,
    maxConcurrency: 1,
    batchingEnabled: false,
    deduplicationEnabled: false,
    defaultTimeout: 5000,
    defaultRetries: 1,
    persistence: {
      backend: 'memory',
      options: {
        checkpoints: false,
        compression: false,
        retentionPeriod: 60000, // 1 minute
      },
    },
    strategies: {
      priorityStrategy: 'fifo',
      retryStrategy: {
        baseDelay: 100,
        maxDelay: 1000,
        multiplier: 1.5,
        jitter: false,
      },
      circuitBreaker: {
        enabled: false,
        failureThreshold: 5,
        successThreshold: 1,
        timeout: 5000,
      },
      loadBalancing: 'round-robin',
    },
    ...overrides,
  });
}

/**
 * Validate queue configuration
 */
export function validateQueueConfiguration(config: QueueConfiguration): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation
  if (config.maxSize <= 0) {
    errors.push('maxSize must be greater than 0');
  }

  if (config.maxConcurrency <= 0) {
    errors.push('maxConcurrency must be greater than 0');
  }

  if (config.defaultTimeout <= 0) {
    errors.push('defaultTimeout must be greater than 0');
  }

  if (config.defaultRetries < 0) {
    errors.push('defaultRetries must be non-negative');
  }

  // Batching validation
  if (config.batchingEnabled) {
    if (config.maxBatchSize <= 0) {
      errors.push(
        'maxBatchSize must be greater than 0 when batching is enabled'
      );
    }

    if (config.batchTimeout <= 0) {
      errors.push(
        'batchTimeout must be greater than 0 when batching is enabled'
      );
    }

    if (config.maxBatchSize > config.maxSize / 2) {
      warnings.push(
        'maxBatchSize is large relative to maxSize - may cause delays'
      );
    }
  }

  // Deduplication validation
  if (config.deduplicationEnabled) {
    if (config.deduplicationWindow <= 0) {
      errors.push(
        'deduplicationWindow must be greater than 0 when deduplication is enabled'
      );
    }
  }

  // Strategy validation
  if (config.strategies.retryStrategy.baseDelay <= 0) {
    errors.push('retryStrategy.baseDelay must be greater than 0');
  }

  if (
    config.strategies.retryStrategy.maxDelay <=
    config.strategies.retryStrategy.baseDelay
  ) {
    errors.push('retryStrategy.maxDelay must be greater than baseDelay');
  }

  if (config.strategies.retryStrategy.multiplier <= 1) {
    errors.push('retryStrategy.multiplier must be greater than 1');
  }

  if (config.strategies.circuitBreaker.enabled) {
    if (config.strategies.circuitBreaker.failureThreshold <= 0) {
      errors.push('circuitBreaker.failureThreshold must be greater than 0');
    }

    if (config.strategies.circuitBreaker.successThreshold <= 0) {
      errors.push('circuitBreaker.successThreshold must be greater than 0');
    }

    if (config.strategies.circuitBreaker.timeout <= 0) {
      errors.push('circuitBreaker.timeout must be greater than 0');
    }
  }

  // Performance warnings
  if (config.maxConcurrency > 50) {
    warnings.push('High concurrency may impact system performance');
  }

  if (config.maxSize > 100000) {
    warnings.push('Large queue size may impact memory usage');
  }

  if (config.persistence.backend === 'memory' && config.maxSize > 10000) {
    warnings.push(
      'Memory backend with large queue size may cause memory issues'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Create storage backend from configuration
 */
export async function createStorageBackend(
  config: QueueConfiguration,
  logger: winston.Logger
): Promise<QueueStorageBackend> {
  const { backend } = config.persistence;

  switch (backend) {
    case 'redis':
      if (!config.persistence.connection?.redis) {
        throw new Error('Redis configuration required for Redis backend');
      }
      return new RedisBackend(config.persistence.connection.redis, logger);

    case 'sqlite': {
      const dbPath = config.persistence.connection?.dbPath || './queue.db';
      return new SQLiteBackend(dbPath, config.persistence.options, logger);
    }

    case 'memory':
    default:
      return new MemoryBackend(logger);
  }
}

/**
 * Create default logger
 */
function createDefaultLogger(): winston.Logger {
  return winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: 'autotask-queue' },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
    ],
  });
}

/**
 * Configuration presets
 */
export const QueuePresets = {
  development: createDevelopmentConfiguration,
  testing: createTestConfiguration,
  production: createProductionConfiguration,
  redis: createRedisConfiguration,
  default: createDefaultConfiguration,
} as const;

/**
 * Quick setup functions
 */
export const QuickSetup = {
  /**
   * Create a basic in-memory queue for testing
   */
  async memory(logger?: winston.Logger): Promise<QueueManager> {
    return createQueueManager({
      config: createTestConfiguration(),
      logger,
    });
  },

  /**
   * Create a production SQLite queue
   */
  async sqlite(
    dbPath: string = './data/queue.db',
    logger?: winston.Logger
  ): Promise<QueueManager> {
    return createQueueManager({
      config: createProductionConfiguration({
        persistence: {
          backend: 'sqlite',
          connection: { dbPath },
          options: {
            checkpoints: true,
            checkpointInterval: 15000,
            compression: true,
            retentionPeriod: 604800000,
            walMode: true,
          },
        },
      }),
      logger,
    });
  },

  /**
   * Create a Redis-based distributed queue
   */
  async redis(
    redisConfig: { host: string; port: number; password?: string; db?: number },
    logger?: winston.Logger
  ): Promise<QueueManager> {
    return createQueueManager({
      config: createRedisConfiguration(redisConfig),
      logger,
    });
  },
};

export default {
  createQueueManager,
  createDefaultConfiguration,
  createProductionConfiguration,
  createRedisConfiguration,
  createDevelopmentConfiguration,
  createTestConfiguration,
  validateQueueConfiguration,
  createStorageBackend,
  QueuePresets,
  QuickSetup,
};
