/**
 * Base configuration management for example applications
 */

import { config as dotenvConfig } from 'dotenv';
import { AppConfig } from '../types/common';
import Joi from 'joi';

// Load environment variables
dotenvConfig();

/**
 * Configuration schema validation
 */
const configSchema = Joi.object({
  environment: Joi.string().valid('development', 'staging', 'production').default('development'),
  port: Joi.number().port().default(3000),
  autotask: Joi.object({
    username: Joi.string().required(),
    secret: Joi.string().required(),
    integrationCode: Joi.string().required(),
    baseURL: Joi.string().uri().optional(),
  }).required(),
  database: Joi.object({
    host: Joi.string().default('localhost'),
    port: Joi.number().port().default(5432),
    database: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
  }).optional(),
  redis: Joi.object({
    host: Joi.string().default('localhost'),
    port: Joi.number().port().default(6379),
    password: Joi.string().optional(),
  }).optional(),
  logging: Joi.object({
    level: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
    file: Joi.string().optional(),
  }).required(),
});

/**
 * Create base configuration from environment variables
 */
export function createBaseConfig(): AppConfig {
  const config: AppConfig = {
    environment: (process.env.NODE_ENV as any) || 'development',
    port: parseInt(process.env.PORT || '3000'),
    autotask: {
      username: process.env.AUTOTASK_USERNAME || '',
      secret: process.env.AUTOTASK_SECRET || '',
      integrationCode: process.env.AUTOTASK_INTEGRATION_CODE || '',
      baseURL: process.env.AUTOTASK_BASE_URL,
    },
    database: process.env.DATABASE_URL ? undefined : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'autotask_examples',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    },
    redis: process.env.REDIS_URL ? undefined : {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    },
    logging: {
      level: (process.env.LOG_LEVEL as any) || 'info',
      file: process.env.LOG_FILE,
    },
  };

  // Validate configuration
  const { error, value } = configSchema.validate(config, { allowUnknown: true });
  
  if (error) {
    throw new Error(`Configuration validation error: ${error.message}`);
  }

  return value;
}

/**
 * Get database connection string from config or environment
 */
export function getDatabaseUrl(config: AppConfig): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  if (!config.database) {
    throw new Error('Database configuration is required');
  }

  const { host, port, database, username, password } = config.database;
  return `postgresql://${username}:${password}@${host}:${port}/${database}`;
}

/**
 * Get Redis connection URL from config or environment
 */
export function getRedisUrl(config: AppConfig): string | undefined {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }

  if (!config.redis) {
    return undefined;
  }

  const { host, port, password } = config.redis;
  return password 
    ? `redis://:${password}@${host}:${port}`
    : `redis://${host}:${port}`;
}

/**
 * Check if the application is running in production
 */
export function isProduction(config: AppConfig): boolean {
  return config.environment === 'production';
}

/**
 * Check if the application is running in development
 */
export function isDevelopment(config: AppConfig): boolean {
  return config.environment === 'development';
}

/**
 * Get application secrets securely
 */
export function getSecrets() {
  return {
    autotaskSecret: process.env.AUTOTASK_SECRET || '',
    jwtSecret: process.env.JWT_SECRET || 'development-secret-key',
    encryptionKey: process.env.ENCRYPTION_KEY || 'development-encryption-key',
  };
}

/**
 * Configuration for different environments
 */
export const environments = {
  development: {
    cors: {
      origin: '*',
      credentials: true,
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
    },
  },
  staging: {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 500, // limit each IP to 500 requests per windowMs
    },
  },
  production: {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',') || [],
      credentials: true,
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },
};

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig(environment: string) {
  return environments[environment as keyof typeof environments] || environments.development;
}