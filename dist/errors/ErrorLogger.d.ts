/**
 * Comprehensive Error Logging System
 *
 * Provides structured logging with context enrichment, sensitive data redaction,
 * and correlation ID tracking for effective debugging and monitoring.
 */
import { CircuitBreakerMetrics } from './CircuitBreaker';
/**
 * Log levels in order of severity
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    FATAL = 4
}
/**
 * Log destinations
 */
export declare enum LogDestination {
    CONSOLE = "console",
    FILE = "file",
    EXTERNAL = "external"
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
        memoryUsage?: any;
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
    /** Component name for business rules */
    component?: string;
    /** Operation name for relationships */
    operationName?: string;
    /** Configuration data for business rules */
    config?: any;
    /** Errors collection for business rules */
    errors?: any[];
    /** Duration of operation in milliseconds */
    duration?: number;
    /** Entity count for batch operations */
    entityCount?: number;
    /** Error information for context */
    error?: any;
    /** Warning messages */
    warnings?: string[];
    /** Context data (general) */
    context?: any;
    /** Heap memory usage */
    heapUsed?: number;
    /** Algorithm name for graph traversal */
    algorithm?: string;
}
/**
 * Legacy alias for backward compatibility
 */
export type ErrorContext = LogContext;
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
export declare class ConsoleLogHandler implements LogDestinationHandler {
    private readonly jsonFormat;
    constructor(jsonFormat?: boolean);
    write(entry: LogEntry): void;
}
/**
 * File log destination
 */
export declare class FileLogHandler implements LogDestinationHandler {
    private readonly filePath;
    private readonly jsonFormat;
    constructor(filePath: string, jsonFormat?: boolean);
    write(entry: LogEntry): Promise<void>;
}
/**
 * External service log destination
 */
export declare class ExternalLogHandler implements LogDestinationHandler {
    private readonly config;
    constructor(config: NonNullable<ErrorLoggerConfig['external']>);
    write(entry: LogEntry): Promise<void>;
}
/**
 * Comprehensive error logging system
 */
export declare class ErrorLogger {
    private readonly config;
    private readonly handlers;
    private correlationIdCounter;
    constructor(config?: ErrorLoggerConfig);
    /**
     * Generate a unique correlation ID
     */
    generateCorrelationId(): string;
    /**
     * Log a debug message
     */
    debug(message: string, context?: LogContext, extra?: Record<string, any>): void;
    /**
     * Log an info message
     */
    info(message: string, context?: LogContext, extra?: Record<string, any>): void;
    /**
     * Log a warning message
     */
    warn(message: string, error?: Error, context?: LogContext, extra?: Record<string, any>): void;
    /**
     * Log an error message
     */
    error(message: string, error?: Error, context?: LogContext, extra?: Record<string, any>): void;
    /**
     * Log a fatal error message
     */
    fatal(message: string, error?: Error, context?: LogContext, extra?: Record<string, any>): void;
    /**
     * Log a retry operation
     */
    logRetry(message: string, error: Error, retryInfo: {
        attempt: number;
        maxAttempts: number;
        nextDelay: number;
        totalTime: number;
    }, context?: LogContext): void;
    /**
     * Log circuit breaker state change
     */
    logCircuitBreakerStateChange(circuitBreakerName: string, fromState: string, toState: string, error?: Error, metrics?: CircuitBreakerMetrics, context?: LogContext): void;
    /**
     * Core logging method
     */
    private log;
    /**
     * Initialize log destination handlers
     */
    private initializeHandlers;
    /**
     * Write log entry to all handlers
     */
    private writeToHandlers;
    /**
     * Redact sensitive data from objects
     */
    private redactSensitiveData;
    /**
     * Truncate message if it exceeds maximum length
     */
    private truncateMessage;
    /**
     * Update logger configuration
     */
    updateConfig(config: Partial<ErrorLoggerConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): ErrorLoggerConfig;
}
/**
 * Default error logger instance
 */
export declare const defaultErrorLogger: ErrorLogger;
/**
 * Decorator for automatic error logging
 */
export declare function LogErrors(message?: string, context?: LogContext): MethodDecorator;
/**
 * Utility function for logging with correlation context
 */
export declare function withLoggingContext<T>(operation: string, fn: (logger: ErrorLogger, correlationId: string) => Promise<T>, context?: LogContext): Promise<T>;
//# sourceMappingURL=ErrorLogger.d.ts.map