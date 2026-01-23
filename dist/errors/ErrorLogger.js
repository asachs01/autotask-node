"use strict";
/**
 * Comprehensive Error Logging System
 *
 * Provides structured logging with context enrichment, sensitive data redaction,
 * and correlation ID tracking for effective debugging and monitoring.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultErrorLogger = exports.ErrorLogger = exports.ExternalLogHandler = exports.FileLogHandler = exports.ConsoleLogHandler = exports.LogDestination = exports.LogLevel = void 0;
exports.LogErrors = LogErrors;
exports.withLoggingContext = withLoggingContext;
const AutotaskErrors_1 = require("./AutotaskErrors");
/**
 * Log levels in order of severity
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["FATAL"] = 4] = "FATAL";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Log destinations
 */
var LogDestination;
(function (LogDestination) {
    LogDestination["CONSOLE"] = "console";
    LogDestination["FILE"] = "file";
    LogDestination["EXTERNAL"] = "external";
})(LogDestination || (exports.LogDestination = LogDestination = {}));
/**
 * Console log destination
 */
class ConsoleLogHandler {
    constructor(jsonFormat = false) {
        this.jsonFormat = jsonFormat;
    }
    write(entry) {
        const levelColors = {
            [LogLevel.DEBUG]: '\x1b[36m', // Cyan
            [LogLevel.INFO]: '\x1b[32m', // Green
            [LogLevel.WARN]: '\x1b[33m', // Yellow
            [LogLevel.ERROR]: '\x1b[31m', // Red
            [LogLevel.FATAL]: '\x1b[35m' // Magenta
        };
        const reset = '\x1b[0m';
        if (this.jsonFormat) {
            console.error(JSON.stringify(entry, null, 2));
        }
        else {
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
            console.error(output);
        }
    }
}
exports.ConsoleLogHandler = ConsoleLogHandler;
/**
 * File log destination
 */
class FileLogHandler {
    constructor(filePath, jsonFormat = true) {
        this.filePath = filePath;
        this.jsonFormat = jsonFormat;
    }
    async write(entry) {
        const fs = await Promise.resolve().then(() => __importStar(require('fs')));
        const path = await Promise.resolve().then(() => __importStar(require('path')));
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
exports.FileLogHandler = FileLogHandler;
/**
 * External service log destination
 */
class ExternalLogHandler {
    constructor(config) {
        this.config = config;
    }
    async write(entry) {
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
        }
        catch (error) {
            console.warn('Failed to send log to external service:', error);
        }
    }
}
exports.ExternalLogHandler = ExternalLogHandler;
/**
 * Comprehensive error logging system
 */
class ErrorLogger {
    constructor(config = {}) {
        this.handlers = new Map();
        this.correlationIdCounter = 0;
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
    generateCorrelationId() {
        const timestamp = Date.now().toString(36);
        const counter = (++this.correlationIdCounter).toString(36).padStart(3, '0');
        const random = Math.random().toString(36).substr(2, 5);
        return `${timestamp}-${counter}-${random}`;
    }
    /**
     * Log a debug message
     */
    debug(message, context = {}, extra) {
        this.log(LogLevel.DEBUG, message, undefined, context, extra);
    }
    /**
     * Log an info message
     */
    info(message, context = {}, extra) {
        this.log(LogLevel.INFO, message, undefined, context, extra);
    }
    /**
     * Log a warning message
     */
    warn(message, error, context = {}, extra) {
        this.log(LogLevel.WARN, message, error, context, extra);
    }
    /**
     * Log an error message
     */
    error(message, error, context = {}, extra) {
        this.log(LogLevel.ERROR, message, error, context, extra);
    }
    /**
     * Log a fatal error message
     */
    fatal(message, error, context = {}, extra) {
        this.log(LogLevel.FATAL, message, error, context, extra);
    }
    /**
     * Log a retry operation
     */
    logRetry(message, error, retryInfo, context = {}) {
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
    logCircuitBreakerStateChange(circuitBreakerName, fromState, toState, error, metrics, context = {}) {
        const level = toState === 'open' ? LogLevel.ERROR : LogLevel.WARN;
        const message = `Circuit breaker '${circuitBreakerName}' changed from ${fromState} to ${toState}`;
        this.log(level, message, error, {
            ...context,
            circuitBreaker: {
                name: circuitBreakerName,
                state: toState,
                metrics: metrics || {}
            }
        });
    }
    /**
     * Core logging method
     */
    log(level, message, error, context = {}, extra) {
        // Check if we should log this level
        if (level < this.config.level) {
            return;
        }
        // Ensure correlation ID exists
        if (!context.correlationId) {
            context.correlationId = this.generateCorrelationId();
        }
        // Create log entry
        const entry = {
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
                ...(error instanceof AutotaskErrors_1.AutotaskError && {
                    code: error.code,
                    ...(error.context && { details: this.redactSensitiveData(error.context) })
                }),
                ...(error.statusCode && { statusCode: error.statusCode }),
                ...(this.config.includeStackTrace && error.stack && { stack: error.stack })
            };
        }
        // Write to all configured destinations
        this.writeToHandlers(entry);
    }
    /**
     * Initialize log destination handlers
     */
    initializeHandlers() {
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
    writeToHandlers(entry) {
        for (const handler of this.handlers.values()) {
            try {
                const result = handler.write(entry);
                if (result instanceof Promise) {
                    result.catch(err => console.warn('Log handler error:', err));
                }
            }
            catch (err) {
                console.warn('Log handler error:', err);
            }
        }
    }
    /**
     * Redact sensitive data from objects
     */
    redactSensitiveData(obj) {
        if (!obj || typeof obj !== 'object') {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map(item => this.redactSensitiveData(item));
        }
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            const lowerKey = key.toLowerCase();
            const isSensitive = this.config.sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()));
            if (isSensitive) {
                result[key] = '[REDACTED]';
            }
            else if (typeof value === 'object') {
                result[key] = this.redactSensitiveData(value);
            }
            else {
                result[key] = value;
            }
        }
        return result;
    }
    /**
     * Truncate message if it exceeds maximum length
     */
    truncateMessage(message) {
        if (message.length <= this.config.maxLogSize) {
            return message;
        }
        return message.substring(0, this.config.maxLogSize - 3) + '...';
    }
    /**
     * Update logger configuration
     */
    updateConfig(config) {
        Object.assign(this.config, config);
        this.handlers.clear();
        this.initializeHandlers();
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
}
exports.ErrorLogger = ErrorLogger;
/**
 * Default error logger instance
 */
exports.defaultErrorLogger = new ErrorLogger();
/**
 * Decorator for automatic error logging
 */
function LogErrors(message, context) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const methodName = `${target.constructor.name}.${String(propertyKey)}`;
        descriptor.value = async function (...args) {
            const correlationId = exports.defaultErrorLogger.generateCorrelationId();
            const startTime = Date.now();
            try {
                exports.defaultErrorLogger.debug(message || `Executing ${methodName}`, {
                    ...context,
                    correlationId,
                    operation: methodName,
                    performance: { startTime }
                });
                const result = await originalMethod.apply(this, args);
                exports.defaultErrorLogger.debug(`Successfully completed ${methodName}`, {
                    ...context,
                    correlationId,
                    operation: methodName,
                    performance: {
                        startTime,
                        duration: Date.now() - startTime
                    }
                });
                return result;
            }
            catch (error) {
                exports.defaultErrorLogger.error(message || `Error in ${methodName}`, error, {
                    ...context,
                    correlationId,
                    operation: methodName,
                    performance: {
                        startTime,
                        duration: Date.now() - startTime
                    }
                });
                throw error;
            }
        };
        return descriptor;
    };
}
/**
 * Utility function for logging with correlation context
 */
function withLoggingContext(operation, fn, context) {
    const correlationId = exports.defaultErrorLogger.generateCorrelationId();
    const startTime = Date.now();
    exports.defaultErrorLogger.debug(`Starting ${operation}`, {
        ...context,
        correlationId,
        operation,
        performance: { startTime }
    });
    return fn(exports.defaultErrorLogger, correlationId).then(result => {
        exports.defaultErrorLogger.debug(`Completed ${operation}`, {
            ...context,
            correlationId,
            operation,
            performance: {
                startTime,
                duration: Date.now() - startTime
            }
        });
        return result;
    }, error => {
        exports.defaultErrorLogger.error(`Failed ${operation}`, error, {
            ...context,
            correlationId,
            operation,
            performance: {
                startTime,
                duration: Date.now() - startTime
            }
        });
        throw error;
    });
}
//# sourceMappingURL=ErrorLogger.js.map