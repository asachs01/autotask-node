/**
 * Comprehensive Error Logging System
 * 
 * Provides structured logging with context enrichment, sensitive data redaction,
 * and correlation ID tracking for effective debugging and monitoring.
 */

import { AutotaskError } from './AutotaskErrors';
import { CircuitBreakerMetrics } from './CircuitBreaker';

/**
 * Log levels in order of severity
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

/**
 * Log destinations
 */
export enum LogDestination {
  CONSOLE = 'console',
  FILE = 'file',
  EXTERNAL = 'external'
}

/**
 * Context information to include with logs
 */
export interface LogContext {
  /** Unique request/operation identifier */
  correlationId?: string;
  
  /** User identifier (will be redacted if sensitive) */
  userId?: string;
  
  /** Session identifier */
  sessionId?: string;
  
  /** API operation being performed */
  operation?: string;
  
  /** Entity type being operated on */
  entityType?: string;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
  
  /** Request details */
  request?: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    params?: Record<string, any>;
  };
  
  /** Performance metrics */
  performance?: {
    startTime?: number;
    duration?: number;
    memoryUsage?: any; // NodeJS.MemoryUsage type is Node-specific
  };
  
  /** Circuit breaker state if applicable */
  circuitBreaker?: {
    name: string;
    state: string;
    metrics: CircuitBreakerMetrics;
  };
  
  /** Retry information if applicable */
  retry?: {
    attempt: number;
    maxAttempts: number;
    totalTime: number;
  };
}

/**
 * Structured log entry
 */
export interface LogEntry {
  /** Timestamp of log entry */
  timestamp: string;
  
  /** Log level */
  level: LogLevel;
  
  /** Log level as string */
  levelName: string;
  
  /** Primary log message */
  message: string;
  
  /** Error object if applicable */
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string | number;
    statusCode?: number;
    details?: any;
  };
  
  /** Context information */
  context: LogContext;
  
  /** Additional metadata */
  extra?: Record<string, any>;
}

/**
 * Configuration for error logger
 */
export interface ErrorLoggerConfig {
  /** Minimum log level to output */
  level?: LogLevel;
  
  /** Whether to include stack traces */
  includeStackTrace?: boolean;
  
  /** Fields to redact from logs */
  sensitiveFields?: string[];
  
  /** Log destinations */
  destinations?: LogDestination[];
  
  /** File path for file logging */
  filePath?: string;
  
  /** External logging service configuration */
  external?: {
    endpoint?: string;
    apiKey?: string;
    service?: 'datadog' | 'newrelic' | 'elastic' | 'custom';
  };
  
  /** Whether to format logs as JSON */
  jsonFormat?: boolean;
  
  /** Maximum log entry size in characters */
  maxLogSize?: number;
  
  /** Correlation ID header name */
  correlationIdHeader?: string;
}

/**
 * Log destination handler interface
 */
export interface LogDestinationHandler {
  write(entry: LogEntry): Promise<void> | void;
}

/**
 * Console log destination
 */
export class ConsoleLogHandler implements LogDestinationHandler {
  constructor(private readonly jsonFormat: boolean = false) {}
  
  write(entry: LogEntry): void {
    const levelColors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m',  // Green
      [LogLevel.WARN]: '\x1b[33m',  // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.FATAL]: '\x1b[35m'  // Magenta
    };
    
    const reset = '\x1b[0m';
    
    if (this.jsonFormat) {
      console.log(JSON.stringify(entry, null, 2));
    } else {
      const color = levelColors[entry.level] || '';
      const timestamp = new Date(entry.timestamp).toISOString();
      const correlationId = entry.context.correlationId ? ` [${entry.context.correlationId}]` : '';
      
      let output = `${color}${timestamp} ${entry.levelName}${correlationId}:${reset} ${entry.message}`;
      
      if (entry.error) {
        output += `\n${color}Error:${reset} ${entry.error.name}: ${entry.error.message}`;
        if (entry.error.stack) {
          output += `\n${entry.error.stack}`;
        }
        if (entry.error.details) {
          output += `\n${color}Error Details:${reset} ${JSON.stringify(entry.error.details, null, 2)}`;
        }
      }
      
      if (Object.keys(entry.context).length > 1 || entry.extra) {
        output += `\n${color}Context:${reset} ${JSON.stringify({
          ...entry.context,
          ...entry.extra
        }, null, 2)}`;
      }
      
      console.log(output);
    }
  }
}

/**
 * File log destination
 */
export class FileLogHandler implements LogDestinationHandler {
  constructor(
    private readonly filePath: string,
    private readonly jsonFormat: boolean = true
  ) {}
  
  async write(entry: LogEntry): Promise<void> {
    const fs = await import('fs');
    const path = await import('path');
    
    // Ensure directory exists
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const logLine = this.jsonFormat 
      ? JSON.stringify(entry) + '\n'
      : `${entry.timestamp} ${entry.levelName}: ${entry.message}\n`;
    
    fs.appendFileSync(this.filePath, logLine);
  }
}

/**
 * External service log destination
 */
export class ExternalLogHandler implements LogDestinationHandler {
  constructor(private readonly config: NonNullable<ErrorLoggerConfig['external']>) {}
  
  async write(entry: LogEntry): Promise<void> {
    if (!this.config.endpoint || !this.config.apiKey) {
      return;
    }
    
    try {
      // Using global fetch (Node 18+) or could use node-fetch for older versions
      const response = await globalThis.fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          ...(this.config.service === 'datadog' && { 'DD-API-KEY': this.config.apiKey })
        },
        body: JSON.stringify(entry)
      });
      
      if (!response.ok) {
        console.warn(`Failed to send log to external service: ${response.status}`);
      }
    } catch (error) {
      console.warn('Failed to send log to external service:', error);
    }
  }
}

/**
 * Comprehensive error logging system
 */
export class ErrorLogger {
  private readonly config: Required<ErrorLoggerConfig>;
  private readonly handlers: Map<LogDestination, LogDestinationHandler> = new Map();
  private correlationIdCounter = 0;
  
  constructor(config: ErrorLoggerConfig = {}) {
    this.config = {
      level: config.level ?? LogLevel.INFO,
      includeStackTrace: config.includeStackTrace ?? true,
      sensitiveFields: config.sensitiveFields ?? [
        'password', 'token', 'secret', 'key', 'apiKey', 'authorization',
        'cookie', 'session', 'credentials', 'auth', 'bearer'
      ],
      destinations: config.destinations ?? [LogDestination.CONSOLE],
      filePath: config.filePath ?? './logs/autotask.log',
      external: config.external ?? {},
      jsonFormat: config.jsonFormat ?? false,
      maxLogSize: config.maxLogSize ?? 10000,
      correlationIdHeader: config.correlationIdHeader ?? 'x-correlation-id'
    };
    
    this.initializeHandlers();
  }
  
  /**
   * Generate a unique correlation ID
   */
  generateCorrelationId(): string {
    const timestamp = Date.now().toString(36);
    const counter = (++this.correlationIdCounter).toString(36).padStart(3, '0');
    const random = Math.random().toString(36).substr(2, 5);
    return `${timestamp}-${counter}-${random}`;
  }
  
  /**
   * Log a debug message
   */
  debug(message: string, context: LogContext = {}, extra?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, undefined, context, extra);
  }
  
  /**
   * Log an info message
   */
  info(message: string, context: LogContext = {}, extra?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, undefined, context, extra);
  }
  
  /**
   * Log a warning message
   */
  warn(message: string, error?: Error, context: LogContext = {}, extra?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, error, context, extra);
  }
  
  /**
   * Log an error message
   */
  error(message: string, error?: Error, context: LogContext = {}, extra?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, error, context, extra);
  }
  
  /**
   * Log a fatal error message
   */
  fatal(message: string, error?: Error, context: LogContext = {}, extra?: Record<string, any>): void {
    this.log(LogLevel.FATAL, message, error, context, extra);
  }
  
  /**
   * Log a retry operation
   */
  logRetry(
    message: string, 
    error: Error, 
    retryInfo: { attempt: number; maxAttempts: number; nextDelay: number; totalTime: number },
    context: LogContext = {}
  ): void {
    this.warn(`Retry attempt ${retryInfo.attempt}/${retryInfo.maxAttempts}: ${message}`, error, {
      ...context,
      retry: {
        attempt: retryInfo.attempt,
        maxAttempts: retryInfo.maxAttempts,
        totalTime: retryInfo.totalTime
      }
    }, { nextDelay: retryInfo.nextDelay });
  }
  
  /**
   * Log circuit breaker state change
   */
  logCircuitBreakerStateChange(
    circuitBreakerName: string,
    fromState: string,
    toState: string,
    error?: Error,
    metrics?: CircuitBreakerMetrics,
    context: LogContext = {}
  ): void {
    const level = toState === 'open' ? LogLevel.ERROR : LogLevel.WARN;
    const message = `Circuit breaker '${circuitBreakerName}' changed from ${fromState} to ${toState}`;
    
    this.log(level, message, error, {
      ...context,
      circuitBreaker: {
        name: circuitBreakerName,
        state: toState,
        metrics: metrics || {} as CircuitBreakerMetrics
      }
    });
  }
  
  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    error?: Error,
    context: LogContext = {},
    extra?: Record<string, any>
  ): void {
    // Check if we should log this level
    if (level < this.config.level) {
      return;
    }
    
    // Ensure correlation ID exists
    if (!context.correlationId) {
      context.correlationId = this.generateCorrelationId();
    }
    
    // Create log entry
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      levelName: LogLevel[level],
      message: this.truncateMessage(message),
      context: this.redactSensitiveData(context),
      ...(extra && { extra: this.redactSensitiveData(extra) })
    };
    
    // Add error information
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        ...(error instanceof AutotaskError && {
          code: error.code,
          ...(error.context && { details: this.redactSensitiveData(error.context) })
        }),
        ...((error as any).statusCode && { statusCode: (error as any).statusCode }),
        ...(this.config.includeStackTrace && error.stack && { stack: error.stack })
      };
    }
    
    // Write to all configured destinations
    this.writeToHandlers(entry);
  }
  
  /**
   * Initialize log destination handlers
   */
  private initializeHandlers(): void {
    for (const destination of this.config.destinations) {
      switch (destination) {
        case LogDestination.CONSOLE:
          this.handlers.set(destination, new ConsoleLogHandler(this.config.jsonFormat));
          break;
          
        case LogDestination.FILE:
          this.handlers.set(destination, new FileLogHandler(this.config.filePath, true));
          break;
          
        case LogDestination.EXTERNAL:
          if (this.config.external.endpoint) {
            this.handlers.set(destination, new ExternalLogHandler(this.config.external));
          }
          break;
      }
    }
  }
  
  /**
   * Write log entry to all handlers
   */
  private writeToHandlers(entry: LogEntry): void {
    for (const handler of this.handlers.values()) {
      try {
        const result = handler.write(entry);
        if (result instanceof Promise) {
          result.catch(err => console.warn('Log handler error:', err));
        }
      } catch (err) {
        console.warn('Log handler error:', err);
      }
    }
  }
  
  /**
   * Redact sensitive data from objects
   */
  private redactSensitiveData(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.redactSensitiveData(item));
    }
    
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = this.config.sensitiveFields.some(field => 
        lowerKey.includes(field.toLowerCase())
      );
      
      if (isSensitive) {
        result[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        result[key] = this.redactSensitiveData(value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }
  
  /**
   * Truncate message if it exceeds maximum length
   */
  private truncateMessage(message: string): string {
    if (message.length <= this.config.maxLogSize) {
      return message;
    }
    
    return message.substring(0, this.config.maxLogSize - 3) + '...';
  }
  
  /**
   * Update logger configuration
   */
  updateConfig(config: Partial<ErrorLoggerConfig>): void {
    Object.assign(this.config, config);
    this.handlers.clear();
    this.initializeHandlers();
  }
  
  /**
   * Get current configuration
   */
  getConfig(): ErrorLoggerConfig {
    return { ...this.config };
  }
}

/**
 * Default error logger instance
 */
export const defaultErrorLogger = new ErrorLogger();

/**
 * Decorator for automatic error logging
 */
export function LogErrors(
  message?: string,
  context?: LogContext
): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const methodName = `${target.constructor.name}.${String(propertyKey)}`;
    
    descriptor.value = async function (...args: any[]) {
      const correlationId = defaultErrorLogger.generateCorrelationId();
      const startTime = Date.now();
      
      try {
        defaultErrorLogger.debug(
          message || `Executing ${methodName}`,
          { 
            ...context, 
            correlationId, 
            operation: methodName,
            performance: { startTime }
          }
        );
        
        const result = await originalMethod.apply(this, args);
        
        defaultErrorLogger.debug(
          `Successfully completed ${methodName}`,
          {
            ...context,
            correlationId,
            operation: methodName,
            performance: {
              startTime,
              duration: Date.now() - startTime
            }
          }
        );
        
        return result;
      } catch (error) {
        defaultErrorLogger.error(
          message || `Error in ${methodName}`,
          error as Error,
          {
            ...context,
            correlationId,
            operation: methodName,
            performance: {
              startTime,
              duration: Date.now() - startTime
            }
          }
        );
        
        throw error;
      }
    };
    
    return descriptor;
  };
}

/**
 * Utility function for logging with correlation context
 */
export function withLoggingContext<T>(
  operation: string,
  fn: (logger: ErrorLogger, correlationId: string) => Promise<T>,
  context?: LogContext
): Promise<T> {
  const correlationId = defaultErrorLogger.generateCorrelationId();
  const startTime = Date.now();
  
  defaultErrorLogger.debug(`Starting ${operation}`, {
    ...context,
    correlationId,
    operation,
    performance: { startTime }
  });
  
  return fn(defaultErrorLogger, correlationId).then(
    result => {
      defaultErrorLogger.debug(`Completed ${operation}`, {
        ...context,
        correlationId,
        operation,
        performance: {
          startTime,
          duration: Date.now() - startTime
        }
      });
      return result;
    },
    error => {
      defaultErrorLogger.error(`Failed ${operation}`, error, {
        ...context,
        correlationId,
        operation,
        performance: {
          startTime,
          duration: Date.now() - startTime
        }
      });
      throw error;
    }
  );
}