/**
 * Queue Factory Utilities
 *
 * Factory functions and utilities for creating and configuring
 * queue components with sensible defaults and validation.
 */
import winston from 'winston';
import { QueueManager, QueueManagerOptions } from '../core/QueueManager';
import { QueueConfiguration, QueueStorageBackend } from '../types/QueueTypes';
/**
 * Create a QueueManager with intelligent defaults
 */
export declare function createQueueManager(options?: Partial<QueueManagerOptions>): Promise<QueueManager>;
/**
 * Create default queue configuration
 */
export declare function createDefaultConfiguration(overrides?: Partial<QueueConfiguration>): QueueConfiguration;
/**
 * Create production-ready configuration
 */
export declare function createProductionConfiguration(overrides?: Partial<QueueConfiguration>): QueueConfiguration;
/**
 * Create high-performance configuration for Redis
 */
export declare function createRedisConfiguration(redisConfig: {
    host: string;
    port: number;
    password?: string;
    db?: number;
}, overrides?: Partial<QueueConfiguration>): QueueConfiguration;
/**
 * Create development configuration
 */
export declare function createDevelopmentConfiguration(overrides?: Partial<QueueConfiguration>): QueueConfiguration;
/**
 * Create testing configuration
 */
export declare function createTestConfiguration(overrides?: Partial<QueueConfiguration>): QueueConfiguration;
/**
 * Validate queue configuration
 */
export declare function validateQueueConfiguration(config: QueueConfiguration): {
    valid: boolean;
    errors: string[];
    warnings: string[];
};
/**
 * Create storage backend from configuration
 */
export declare function createStorageBackend(config: QueueConfiguration, logger: winston.Logger): Promise<QueueStorageBackend>;
/**
 * Configuration presets
 */
export declare const QueuePresets: {
    readonly development: typeof createDevelopmentConfiguration;
    readonly testing: typeof createTestConfiguration;
    readonly production: typeof createProductionConfiguration;
    readonly redis: typeof createRedisConfiguration;
    readonly default: typeof createDefaultConfiguration;
};
/**
 * Quick setup functions
 */
export declare const QuickSetup: {
    /**
     * Create a basic in-memory queue for testing
     */
    memory(logger?: winston.Logger): Promise<QueueManager>;
    /**
     * Create a production SQLite queue
     */
    sqlite(dbPath?: string, logger?: winston.Logger): Promise<QueueManager>;
    /**
     * Create a Redis-based distributed queue
     */
    redis(redisConfig: {
        host: string;
        port: number;
        password?: string;
        db?: number;
    }, logger?: winston.Logger): Promise<QueueManager>;
};
declare const _default: {
    createQueueManager: typeof createQueueManager;
    createDefaultConfiguration: typeof createDefaultConfiguration;
    createProductionConfiguration: typeof createProductionConfiguration;
    createRedisConfiguration: typeof createRedisConfiguration;
    createDevelopmentConfiguration: typeof createDevelopmentConfiguration;
    createTestConfiguration: typeof createTestConfiguration;
    validateQueueConfiguration: typeof validateQueueConfiguration;
    createStorageBackend: typeof createStorageBackend;
    QueuePresets: {
        readonly development: typeof createDevelopmentConfiguration;
        readonly testing: typeof createTestConfiguration;
        readonly production: typeof createProductionConfiguration;
        readonly redis: typeof createRedisConfiguration;
        readonly default: typeof createDefaultConfiguration;
    };
    QuickSetup: {
        /**
         * Create a basic in-memory queue for testing
         */
        memory(logger?: winston.Logger): Promise<QueueManager>;
        /**
         * Create a production SQLite queue
         */
        sqlite(dbPath?: string, logger?: winston.Logger): Promise<QueueManager>;
        /**
         * Create a Redis-based distributed queue
         */
        redis(redisConfig: {
            host: string;
            port: number;
            password?: string;
            db?: number;
        }, logger?: winston.Logger): Promise<QueueManager>;
    };
};
export default _default;
//# sourceMappingURL=QueueFactory.d.ts.map