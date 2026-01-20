"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestHandler = void 0;
const uuid_1 = require("uuid");
const errors_1 = require("./errors");
const AutotaskErrors_1 = require("../errors/AutotaskErrors");
const performanceMonitor_1 = require("./performanceMonitor");
const RetryStrategy_1 = require("../errors/RetryStrategy");
const CircuitBreaker_1 = require("../errors/CircuitBreaker");
const ErrorLogger_1 = require("../errors/ErrorLogger");
/**
 * Enhanced request handler with structured error handling, retry logic, and logging
 */
class RequestHandler {
    constructor(axios, logger, globalOptions = {}, errorLogger) {
        this.axios = axios;
        this.logger = logger;
        this.globalOptions = globalOptions;
        this.defaultOptions = {
            retries: 3,
            baseDelay: 1000,
            timeout: 30000,
            enableRequestLogging: true,
            enableResponseLogging: true,
            requestId: '',
            enablePerformanceMonitoring: true,
            useAdvancedRetry: true,
            enableCircuitBreaker: true,
        };
        this.errorLogger = errorLogger || ErrorLogger_1.defaultErrorLogger;
        this.performanceMonitor = new performanceMonitor_1.PerformanceMonitor(this.logger);
        this.retryStrategy = new RetryStrategy_1.RetryStrategy({
            maxRetries: this.defaultOptions.retries,
            initialDelay: this.defaultOptions.baseDelay,
            backoffMultiplier: 2,
            jitterFactor: 0.1,
            maxDelay: 30000,
        });
        this.circuitBreakerRegistry = CircuitBreaker_1.CircuitBreakerRegistry.getInstance();
        this.setupAxiosInterceptors();
    }
    /**
     * Setup axios interceptors for request/response logging and timeout handling
     */
    setupAxiosInterceptors() {
        // Request interceptor
        this.axios.interceptors.request.use(config => {
            // Add timeout if not already set
            if (!config.timeout && this.defaultOptions.timeout) {
                config.timeout = this.defaultOptions.timeout;
            }
            // Add request ID for tracking
            const requestId = (0, uuid_1.v4)();
            config.metadata = { requestId, startTime: Date.now() };
            return config;
        }, error => {
            this.logger.error('Request interceptor error:', error);
            return Promise.reject(error);
        });
        // Response interceptor
        this.axios.interceptors.response.use(response => {
            const duration = Date.now() - (response.config.metadata?.startTime || 0);
            response.metadata = {
                ...response.config.metadata,
                duration,
                success: true,
            };
            return response;
        }, error => {
            const duration = Date.now() - (error.config?.metadata?.startTime || 0);
            if (error.config) {
                error.config.metadata = {
                    ...error.config.metadata,
                    duration,
                    success: false,
                };
            }
            return Promise.reject(error);
        });
    }
    /**
     * Execute a request with enterprise-grade reliability patterns
     */
    async executeRequest(requestFn, endpoint, method, options = {}) {
        const mergedOptions = {
            ...this.defaultOptions,
            ...this.globalOptions,
            ...options,
        };
        const requestId = options.requestId || (0, uuid_1.v4)();
        const context = {
            requestId,
            endpoint,
            method,
            startTime: Date.now(),
            attempt: 0,
        };
        // Start performance monitoring if enabled
        let performanceTimer;
        if (mergedOptions.enablePerformanceMonitoring) {
            performanceTimer = this.performanceMonitor.startTimer(endpoint, method);
        }
        // Use advanced retry strategy if enabled
        if (mergedOptions.useAdvancedRetry) {
            return this.executeWithAdvancedRetry(requestFn, context, mergedOptions, performanceTimer);
        }
        // Fall back to legacy retry logic for backward compatibility
        return this.executeWithLegacyRetry(requestFn, context, mergedOptions, performanceTimer);
    }
    /**
     * Execute request with advanced retry strategy and circuit breaker
     */
    async executeWithAdvancedRetry(requestFn, context, options, performanceTimer) {
        // Create retry strategy with merged options
        const retryOptions = {
            ...options.retryStrategy,
            maxRetries: options.retries,
            initialDelay: options.baseDelay,
            onRetry: (error, attempt, delay) => {
                const logContext = {
                    correlationId: context.requestId,
                    operation: `${context.method} ${context.endpoint}`,
                    request: {
                        method: context.method,
                        url: context.endpoint,
                    },
                    retry: {
                        attempt,
                        maxAttempts: options.retries,
                        totalTime: Date.now() - context.startTime
                    }
                };
                this.errorLogger.logRetry('Request failed, retrying with advanced strategy', error, { attempt, maxAttempts: options.retries, nextDelay: delay, totalTime: Date.now() - context.startTime }, logContext);
                // Fallback to winston for backward compatibility
                this.logger.warn('Advanced retry: Request failed, retrying', {
                    requestId: context.requestId,
                    endpoint: context.endpoint,
                    method: context.method,
                    attempt,
                    delay,
                    errorType: error.constructor.name,
                    errorMessage: error.message,
                });
            },
            isRetryable: (error, attempt) => {
                if (error instanceof errors_1.AutotaskError) {
                    return (0, errors_1.isRetryableError)(error);
                }
                return true; // Assume retryable for unknown errors
            }
        };
        const strategy = new RetryStrategy_1.RetryStrategy(retryOptions);
        // Wrap the request execution
        const executeWithLogging = async () => {
            context.attempt++;
            this.logRequest(context, options, context.attempt > 1);
            try {
                const response = await requestFn();
                this.logResponse(context, response, options);
                // Log successful request with ErrorLogger
                const logContext = {
                    correlationId: context.requestId,
                    operation: `${context.method} ${context.endpoint}`,
                    request: {
                        method: context.method,
                        url: context.endpoint,
                    },
                    performance: {
                        startTime: context.startTime,
                        duration: Date.now() - context.startTime
                    }
                };
                this.errorLogger.info(`Request completed successfully`, logContext, {
                    statusCode: response.status,
                    statusText: response.statusText,
                    responseSize: JSON.stringify(response.data).length
                });
                // Record successful performance metrics
                if (performanceTimer) {
                    performanceTimer(response.status, undefined);
                }
                return response;
            }
            catch (error) {
                const autotaskError = this.handleError(error, context);
                this.logError(context, autotaskError, options);
                throw autotaskError;
            }
        };
        // Use circuit breaker if enabled
        if (options.enableCircuitBreaker) {
            const circuitBreakerName = options.circuitBreakerName ||
                `${context.endpoint}-${context.method}`.replace(/[^a-zA-Z0-9-]/g, '-');
            const circuitBreaker = this.circuitBreakerRegistry.getCircuitBreaker(circuitBreakerName, options.circuitBreaker);
            try {
                const result = await circuitBreaker.execute(executeWithLogging);
                if (!result.success) {
                    // Record error performance metrics
                    if (performanceTimer) {
                        performanceTimer(undefined, result.error?.message);
                    }
                    throw result.error;
                }
                return result.data;
            }
            catch (error) {
                // Handle circuit breaker specific errors
                if (error instanceof AutotaskErrors_1.CircuitBreakerError) {
                    const logContext = {
                        correlationId: context.requestId,
                        operation: `${context.method} ${context.endpoint}`,
                        request: {
                            method: context.method,
                            url: context.endpoint,
                        },
                        circuitBreaker: {
                            name: circuitBreakerName,
                            state: 'open',
                            metrics: {} // Will be populated by circuit breaker
                        }
                    };
                    this.errorLogger.warn('Circuit breaker is open', error, logContext);
                    // Fallback to winston for backward compatibility
                    this.logger.warn('Circuit breaker is open', {
                        requestId: context.requestId,
                        endpoint: context.endpoint,
                        method: context.method,
                        circuitBreakerName,
                    });
                    if (performanceTimer) {
                        performanceTimer(503, 'Circuit breaker open');
                    }
                }
                throw error;
            }
        }
        // Execute with retry strategy only (no circuit breaker)
        try {
            const result = await strategy.execute(executeWithLogging);
            if (!result.success) {
                // Record error performance metrics
                if (performanceTimer) {
                    performanceTimer(undefined, result.error?.message);
                }
                throw result.error;
            }
            return result.data;
        }
        catch (error) {
            // Record error performance metrics
            if (performanceTimer) {
                const autotaskError = error instanceof errors_1.AutotaskError ? error :
                    this.handleError(error, context);
                performanceTimer(autotaskError.statusCode, autotaskError.message);
            }
            throw error;
        }
    }
    /**
     * Execute request with legacy retry logic (for backward compatibility)
     */
    async executeWithLegacyRetry(requestFn, context, options, performanceTimer) {
        let lastError;
        for (let attempt = 1; attempt <= options.retries + 1; attempt++) {
            context.attempt = attempt;
            try {
                this.logRequest(context, options, attempt > 1);
                const response = await requestFn();
                this.logResponse(context, response, options);
                // Record successful performance metrics
                if (performanceTimer) {
                    performanceTimer(response.status, undefined);
                }
                // Success - return the response
                return response;
            }
            catch (error) {
                const autotaskError = this.handleError(error, context);
                lastError = autotaskError;
                this.logError(context, autotaskError, options);
                // Record error performance metrics
                if (performanceTimer && attempt === options.retries + 1) {
                    // Only record on final attempt to avoid duplicate metrics
                    performanceTimer(autotaskError.statusCode, autotaskError.message);
                }
                // Check if we should retry
                if (attempt <= options.retries &&
                    (0, errors_1.isRetryableError)(autotaskError)) {
                    const delay = (0, errors_1.getRetryDelay)(autotaskError, attempt, options.baseDelay);
                    const logContext = {
                        correlationId: context.requestId,
                        operation: `${context.method} ${context.endpoint}`,
                        request: {
                            method: context.method,
                            url: context.endpoint,
                        },
                        retry: {
                            attempt,
                            maxAttempts: options.retries,
                            totalTime: Date.now() - context.startTime
                        }
                    };
                    this.errorLogger.logRetry('Request failed, retrying with legacy strategy', autotaskError, { attempt, maxAttempts: options.retries, nextDelay: delay, totalTime: Date.now() - context.startTime }, logContext);
                    // Fallback to winston for backward compatibility
                    this.logger.warn(`Legacy retry: Request failed, retrying in ${delay}ms`, {
                        requestId: context.requestId,
                        endpoint: context.endpoint,
                        method: context.method,
                        attempt,
                        maxRetries: options.retries,
                        delay,
                        errorType: autotaskError.constructor.name,
                        statusCode: autotaskError.statusCode,
                    });
                    await this.sleep(delay);
                    continue;
                }
                // No more retries or non-retryable error
                throw autotaskError;
            }
        }
        // This should never be reached, but TypeScript requires it
        throw lastError || new Error('Unexpected error in request execution');
    }
    /**
     * Handle and classify errors
     */
    handleError(error, context) {
        const requestDetails = {
            endpoint: context.endpoint,
            method: context.method,
            requestId: context.requestId,
        };
        if (error.isAxiosError) {
            return (0, errors_1.createAutotaskError)(error, requestDetails);
        }
        if (error instanceof errors_1.AutotaskError) {
            return error;
        }
        // Handle non-axios errors
        return (0, errors_1.createAutotaskError)({
            message: error.message || 'Unknown error',
            isAxiosError: false,
        }, requestDetails);
    }
    /**
     * Log request details
     */
    logRequest(context, options, isRetry = false) {
        if (!options.enableRequestLogging)
            return;
        const logData = {
            requestId: context.requestId,
            endpoint: context.endpoint,
            method: context.method,
            attempt: context.attempt,
            isRetry,
            timestamp: new Date().toISOString(),
        };
        if (isRetry) {
            this.logger.info('Retrying request', logData);
        }
        else {
            this.logger.info('Making request', logData);
        }
    }
    /**
     * Log response details
     */
    logResponse(context, response, options) {
        if (!options.enableResponseLogging)
            return;
        const duration = Date.now() - context.startTime;
        this.logger.info('Request completed successfully', {
            requestId: context.requestId,
            endpoint: context.endpoint,
            method: context.method,
            statusCode: response.status,
            statusText: response.statusText,
            duration,
            attempt: context.attempt,
            responseSize: JSON.stringify(response.data).length,
            timestamp: new Date().toISOString(),
        });
    }
    /**
     * Log error details
     */
    logError(context, error, options) {
        const duration = Date.now() - context.startTime;
        const logContext = {
            correlationId: context.requestId,
            operation: `${context.method} ${context.endpoint}`,
            request: {
                method: context.method,
                url: context.endpoint,
            },
            performance: {
                startTime: context.startTime,
                duration
            }
        };
        const extraData = {
            attempt: context.attempt,
            errorType: error.constructor.name,
            statusCode: error.statusCode,
            isRetryable: (0, errors_1.isRetryableError)(error),
        };
        if (error.statusCode && error.statusCode >= 500) {
            this.errorLogger.error('Server error occurred', error, logContext, extraData);
            this.logger.error('Server error occurred', {
                requestId: context.requestId,
                endpoint: context.endpoint,
                method: context.method,
                ...extraData
            });
        }
        else if (error.statusCode && error.statusCode >= 400) {
            this.errorLogger.warn('Client error occurred', error, logContext, extraData);
            this.logger.warn('Client error occurred', {
                requestId: context.requestId,
                endpoint: context.endpoint,
                method: context.method,
                ...extraData
            });
        }
        else {
            this.errorLogger.error('Network or unknown error occurred', error, logContext, extraData);
            this.logger.error('Network or unknown error occurred', {
                requestId: context.requestId,
                endpoint: context.endpoint,
                method: context.method,
                ...extraData
            });
        }
    }
    /**
     * Sleep for specified milliseconds
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Get performance monitor instance
     */
    getPerformanceMonitor() {
        return this.performanceMonitor;
    }
    /**
     * Get current performance metrics
     */
    getPerformanceMetrics() {
        return this.performanceMonitor.getMetrics();
    }
    /**
     * Get detailed performance report
     */
    getPerformanceReport() {
        return this.performanceMonitor.getDetailedReport();
    }
    /**
     * Reset performance metrics
     */
    resetPerformanceMetrics() {
        this.performanceMonitor.reset();
    }
    /**
     * Log performance summary
     */
    logPerformanceSummary() {
        this.performanceMonitor.logSummary();
    }
    /**
     * Update global options for all requests
     */
    updateGlobalOptions(options) {
        Object.assign(this.globalOptions, options);
    }
    /**
     * Get current global options
     */
    getGlobalOptions() {
        return { ...this.globalOptions };
    }
    /**
     * Get circuit breaker metrics for all endpoints
     */
    getCircuitBreakerMetrics() {
        return this.circuitBreakerRegistry.getAllMetrics();
    }
    /**
     * Get circuit breaker metrics for a specific endpoint
     */
    getCircuitBreakerMetricsForEndpoint(endpoint, method) {
        const circuitBreakerName = `${endpoint}-${method}`.replace(/[^a-zA-Z0-9-]/g, '-');
        const circuitBreaker = this.circuitBreakerRegistry.getCircuitBreaker(circuitBreakerName);
        return circuitBreaker.getMetrics();
    }
    /**
     * Reset circuit breaker for a specific endpoint
     */
    resetCircuitBreakerForEndpoint(endpoint, method) {
        const circuitBreakerName = `${endpoint}-${method}`.replace(/[^a-zA-Z0-9-]/g, '-');
        const circuitBreaker = this.circuitBreakerRegistry.getCircuitBreaker(circuitBreakerName);
        circuitBreaker.reset();
    }
    /**
     * Reset all circuit breakers
     */
    resetAllCircuitBreakers() {
        this.circuitBreakerRegistry.resetAll();
    }
    /**
     * Update retry strategy configuration
     */
    updateRetryStrategy(options) {
        this.retryStrategy = new RetryStrategy_1.RetryStrategy({
            maxRetries: this.defaultOptions.retries,
            initialDelay: this.defaultOptions.baseDelay,
            backoffMultiplier: 2,
            jitterFactor: 0.1,
            maxDelay: 30000,
            ...options,
        });
    }
    /**
     * Get comprehensive health status including circuit breakers
     */
    getHealthStatus() {
        const circuitBreakerMetrics = this.getCircuitBreakerMetrics();
        const performanceMetrics = this.getPerformanceMetrics();
        const healthyCircuitBreakers = Object.values(circuitBreakerMetrics).filter(metrics => metrics.state === CircuitBreaker_1.CircuitBreakerState.CLOSED).length;
        const totalCircuitBreakers = Object.keys(circuitBreakerMetrics).length;
        return {
            timestamp: new Date().toISOString(),
            status: healthyCircuitBreakers === totalCircuitBreakers ? 'healthy' : 'degraded',
            circuitBreakers: {
                total: totalCircuitBreakers,
                healthy: healthyCircuitBreakers,
                open: Object.values(circuitBreakerMetrics).filter(metrics => metrics.state === CircuitBreaker_1.CircuitBreakerState.OPEN).length,
                halfOpen: Object.values(circuitBreakerMetrics).filter(metrics => metrics.state === CircuitBreaker_1.CircuitBreakerState.HALF_OPEN).length,
                metrics: circuitBreakerMetrics
            },
            performance: performanceMetrics,
            features: {
                advancedRetry: this.defaultOptions.useAdvancedRetry,
                circuitBreaker: this.defaultOptions.enableCircuitBreaker,
                performanceMonitoring: this.defaultOptions.enablePerformanceMonitoring,
            }
        };
    }
    /**
     * Configure endpoint-specific circuit breaker
     */
    configureCircuitBreakerForEndpoint(endpoint, method, options) {
        const circuitBreakerName = `${endpoint}-${method}`.replace(/[^a-zA-Z0-9-]/g, '-');
        this.circuitBreakerRegistry.getCircuitBreaker(circuitBreakerName, options);
    }
}
exports.RequestHandler = RequestHandler;
//# sourceMappingURL=requestHandler.js.map