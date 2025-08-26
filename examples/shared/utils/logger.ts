/**
 * Centralized logging utility for example applications
 */

import winston from 'winston';
import { AppConfig } from '../types/common';

// Create a default logger instance
let defaultLogger: winston.Logger;

/**
 * Create a logger instance with the specified name
 */
export function createLogger(name: string, config?: AppConfig): winston.Logger {
  const logLevel = config?.logging.level || process.env.LOG_LEVEL || 'info';
  const logFile = config?.logging.file || process.env.LOG_FILE;
  
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          let log = `${timestamp} [${name}] ${level}: ${message}`;
          if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
          }
          return log;
        })
      ),
    }),
  ];

  // Add file transport if specified
  if (logFile) {
    transports.push(
      new winston.transports.File({
        filename: logFile,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
      })
    );
  }

  const logger = winston.createLogger({
    level: logLevel,
    transports,
    exceptionHandlers: [
      new winston.transports.Console(),
      ...(logFile ? [new winston.transports.File({ filename: logFile })] : []),
    ],
    rejectionHandlers: [
      new winston.transports.Console(),
      ...(logFile ? [new winston.transports.File({ filename: logFile })] : []),
    ],
  });

  return logger;
}

/**
 * Initialize the default logger
 */
export function initializeLogger(config: AppConfig): winston.Logger {
  defaultLogger = createLogger('app', config);
  return defaultLogger;
}

/**
 * Get the default logger instance
 */
export function getLogger(): winston.Logger {
  if (!defaultLogger) {
    // Create a fallback logger if none has been initialized
    defaultLogger = createLogger('app');
  }
  return defaultLogger;
}

/**
 * Log levels for structured logging
 */
export const LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const;

/**
 * Helper functions for common logging patterns
 */
export const LogHelper = {
  /**
   * Log API request details
   */
  apiRequest: (logger: winston.Logger, method: string, url: string, duration?: number) => {
    const message = duration 
      ? `${method} ${url} completed in ${duration}ms`
      : `${method} ${url}`;
    logger.info(message);
  },

  /**
   * Log API error details
   */
  apiError: (logger: winston.Logger, method: string, url: string, error: Error, duration?: number) => {
    const message = duration
      ? `${method} ${url} failed in ${duration}ms: ${error.message}`
      : `${method} ${url} failed: ${error.message}`;
    logger.error(message, { 
      stack: error.stack,
      method,
      url,
      duration 
    });
  },

  /**
   * Log database operation details
   */
  dbOperation: (logger: winston.Logger, operation: string, table: string, duration?: number, recordCount?: number) => {
    let message = `${operation} operation on ${table}`;
    if (duration) message += ` completed in ${duration}ms`;
    if (recordCount !== undefined) message += ` (${recordCount} records)`;
    logger.info(message);
  },

  /**
   * Log database error details
   */
  dbError: (logger: winston.Logger, operation: string, table: string, error: Error, duration?: number) => {
    const message = duration
      ? `${operation} operation on ${table} failed in ${duration}ms: ${error.message}`
      : `${operation} operation on ${table} failed: ${error.message}`;
    logger.error(message, {
      stack: error.stack,
      operation,
      table,
      duration
    });
  },

  /**
   * Log workflow step progress
   */
  workflowStep: (logger: winston.Logger, workflowId: string, stepName: string, status: string, details?: any) => {
    logger.info(`Workflow ${workflowId}: ${stepName} - ${status}`, details);
  },

  /**
   * Log integration sync details
   */
  integrationSync: (logger: winston.Logger, integrationName: string, operation: string, recordCount: number, duration?: number) => {
    const message = duration
      ? `${integrationName} ${operation} completed: ${recordCount} records in ${duration}ms`
      : `${integrationName} ${operation} completed: ${recordCount} records`;
    logger.info(message);
  },

  /**
   * Log security events
   */
  securityEvent: (logger: winston.Logger, event: string, userId?: string, ipAddress?: string, details?: any) => {
    logger.warn(`Security event: ${event}`, {
      userId,
      ipAddress,
      ...details
    });
  },

  /**
   * Log performance metrics
   */
  performance: (logger: winston.Logger, metric: string, value: number, unit: string = 'ms') => {
    logger.info(`Performance: ${metric} = ${value}${unit}`);
  },

  /**
   * Log cache operations
   */
  cache: (logger: winston.Logger, operation: 'hit' | 'miss' | 'set' | 'delete', key: string, ttl?: number) => {
    let message = `Cache ${operation}: ${key}`;
    if (ttl && operation === 'set') message += ` (TTL: ${ttl}s)`;
    logger.debug(message);
  },

  /**
   * Log external API calls
   */
  externalApi: (logger: winston.Logger, service: string, endpoint: string, statusCode: number, duration?: number) => {
    const message = duration
      ? `External API ${service}${endpoint} responded with ${statusCode} in ${duration}ms`
      : `External API ${service}${endpoint} responded with ${statusCode}`;
    
    if (statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.info(message);
    }
  },
};

/**
 * Create a child logger with additional metadata
 */
export function createChildLogger(parent: winston.Logger, metadata: object): winston.Logger {
  return parent.child(metadata);
}

/**
 * Format errors for logging
 */
export function formatError(error: Error): object {
  return {
    message: error.message,
    stack: error.stack,
    name: error.name,
  };
}

/**
 * Redact sensitive information from logs
 */
export function redactSensitiveData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = ['password', 'secret', 'token', 'key', 'authorization'];
  const redacted = { ...data };

  for (const field of sensitiveFields) {
    if (field in redacted) {
      redacted[field] = '***REDACTED***';
    }
  }

  // Recursively redact nested objects
  for (const key in redacted) {
    if (typeof redacted[key] === 'object' && redacted[key] !== null) {
      redacted[key] = redactSensitiveData(redacted[key]);
    }
  }

  return redacted;
}