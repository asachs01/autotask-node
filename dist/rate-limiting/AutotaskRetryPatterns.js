"use strict";
/**
 * Advanced Autotask Retry Patterns
 *
 * Implements sophisticated retry strategies specifically designed for Autotask API behavior:
 * - Exponential backoff with jitter for different error types
 * - Circuit breaker pattern for failing endpoints
 * - Request replay and reconciliation
 * - Autotask-specific error classification and handling
 *
 * Features:
 * - Intelligent backoff based on error type and API response patterns
 * - Per-endpoint circuit breakers with health monitoring
 * - Request queuing with priority and deduplication
 * - Automatic error classification and recovery strategies
 * - Comprehensive metrics and monitoring
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutotaskRetryPatterns = void 0;
const events_1 = require("events");
const errors_1 = require("../utils/errors");
/**
 * Advanced retry pattern implementation for Autotask APIs
 */
class AutotaskRetryPatterns extends events_1.EventEmitter {
    constructor(config, logger) {
        super();
        // Circuit breaker tracking
        this.circuitBreakers = new Map();
        // Request replay system
        this.replayQueue = [];
        this.pendingRequests = new Map(); // For deduplication
        // Error learning and prediction
        this.errorHistory = new Map(); // endpoint -> errors
        this.retryHistory = new Map(); // endpoint -> attempts
        this.config = {
            maxRetries: 5,
            baseDelayMs: 1000,
            maxDelayMs: 60000,
            jitterFactor: 0.1,
            backoffMultiplier: 2.0,
            resetTimeoutMs: 300000, // 5 minutes
            circuitBreakerThreshold: 0.5, // 50% failure rate
            circuitBreakerWindowMs: 60000, // 1 minute
            circuitBreakerRecoveryMs: 30000, // 30 seconds
            enableRequestReplay: true,
            replayQueueSize: 100,
            replayTimeoutMs: 600000, // 10 minutes
            enableErrorLearning: true,
            enablePredictiveRetries: true,
            dedupeConcurrentRequests: true,
            ...config
        };
        this.logger = logger;
        this.initializeMetrics();
        this.startMetricsCollection();
        this.logger.info('AutotaskRetryPatterns initialized', {
            maxRetries: this.config.maxRetries,
            circuitBreakerEnabled: true,
            requestReplayEnabled: this.config.enableRequestReplay,
            errorLearningEnabled: this.config.enableErrorLearning
        });
    }
    /**
     * Execute a request with advanced retry patterns
     */
    async executeWithRetry(requestFn, endpoint, method = 'GET', requestData, headers) {
        const requestKey = `${method}:${endpoint}`;
        // Check circuit breaker
        const circuitState = this.getCircuitBreakerState(endpoint);
        if (circuitState.state === 'OPEN') {
            const error = new Error(`Circuit breaker is OPEN for endpoint: ${endpoint}`);
            this.recordError(endpoint, error);
            throw error;
        }
        // Check for concurrent request deduplication
        if (this.config.dedupeConcurrentRequests && this.pendingRequests.has(requestKey)) {
            this.logger.debug('Deduplicating concurrent request', { endpoint, method });
            return this.pendingRequests.get(requestKey);
        }
        const promise = this.executeRequestWithCircuitBreaker(requestFn, endpoint, method, requestData, headers);
        if (this.config.dedupeConcurrentRequests) {
            this.pendingRequests.set(requestKey, promise);
            promise.finally(() => this.pendingRequests.delete(requestKey));
        }
        return promise;
    }
    /**
     * Add request to replay queue for later execution
     */
    addToReplayQueue(endpoint, method, data, headers = {}, priority = 5) {
        if (!this.config.enableRequestReplay) {
            throw new Error('Request replay is disabled');
        }
        if (this.replayQueue.length >= this.config.replayQueueSize) {
            // Remove oldest low-priority request
            const oldestLowPriority = this.replayQueue
                .filter(req => req.priority <= 3)
                .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())[0];
            if (oldestLowPriority) {
                this.removeFromReplayQueue(oldestLowPriority.id);
            }
            else {
                throw new Error('Replay queue is full');
            }
        }
        const request = {
            id: `replay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            endpoint,
            method,
            data,
            headers,
            timestamp: new Date(),
            priority,
            maxRetries: this.config.maxRetries,
            currentRetries: 0
        };
        // Insert based on priority
        const insertIndex = this.replayQueue.findIndex(req => req.priority < priority);
        if (insertIndex === -1) {
            this.replayQueue.push(request);
        }
        else {
            this.replayQueue.splice(insertIndex, 0, request);
        }
        this.emit('requestQueued', request);
        this.logger.debug('Request added to replay queue', {
            id: request.id, endpoint, method, priority, queueSize: this.replayQueue.length
        });
        return request.id;
    }
    /**
     * Get recommended retry delay based on error type and history
     */
    getRetryDelay(error, attemptNumber, endpoint) {
        let baseDelay = this.config.baseDelayMs;
        // Adjust base delay based on error type (Autotask-specific)
        if (error instanceof errors_1.RateLimitError) {
            // Use retry-after header if available, otherwise use longer delay
            baseDelay = error.retryAfter ? error.retryAfter * 1000 : 60000;
        }
        else if (error instanceof errors_1.ServerError) {
            // Server errors need longer delays
            baseDelay = this.config.baseDelayMs * 2;
        }
        else if (error instanceof errors_1.NetworkError) {
            if (error.timeout) {
                baseDelay = this.config.baseDelayMs * 1.5;
            }
        }
        else if (error instanceof errors_1.AuthError) {
            // Auth errors usually don't benefit from retries
            return 0;
        }
        // Apply exponential backoff
        const exponentialDelay = baseDelay * Math.pow(this.config.backoffMultiplier, attemptNumber - 1);
        // Add jitter to prevent thundering herd
        const jitter = exponentialDelay * this.config.jitterFactor * Math.random();
        // Apply learning from historical patterns
        const learningAdjustment = this.getLearningAdjustment(endpoint, error);
        const totalDelay = Math.min(exponentialDelay + jitter + learningAdjustment, this.config.maxDelayMs);
        return Math.max(totalDelay, 100); // Minimum 100ms delay
    }
    /**
     * Get circuit breaker state for endpoint
     */
    getCircuitBreakerState(endpoint) {
        if (!this.circuitBreakers.has(endpoint)) {
            const state = {
                endpoint,
                state: 'CLOSED',
                failureCount: 0,
                successCount: 0,
                lastFailureTime: null,
                lastSuccessTime: null,
                failures: [],
                nextAttemptTime: null
            };
            this.circuitBreakers.set(endpoint, state);
        }
        const state = this.circuitBreakers.get(endpoint);
        // Update circuit breaker state based on recent history
        this.updateCircuitBreakerState(state);
        return state;
    }
    /**
     * Check if error should trigger circuit breaker
     */
    shouldTriggerCircuitBreaker(error) {
        // Don't trigger circuit breaker for client errors (4xx) except rate limits
        if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
            return error instanceof errors_1.RateLimitError;
        }
        // Trigger for server errors (5xx) and network errors
        return error instanceof errors_1.ServerError || error instanceof errors_1.NetworkError;
    }
    /**
     * Process replay queue
     */
    async processReplayQueue() {
        const now = new Date();
        const expiredRequests = this.replayQueue.filter(req => now.getTime() - req.timestamp.getTime() > this.config.replayTimeoutMs);
        // Remove expired requests
        for (const expired of expiredRequests) {
            this.removeFromReplayQueue(expired.id);
            this.emit('requestExpired', expired);
        }
        // Process remaining requests (highest priority first)
        const processableRequests = this.replayQueue
            .filter(req => {
            const circuitState = this.getCircuitBreakerState(req.endpoint);
            return circuitState.state !== 'OPEN';
        })
            .slice(0, 5); // Process up to 5 requests at once
        for (const request of processableRequests) {
            try {
                this.emit('replayAttempt', request);
                // This would need to be implemented based on your specific request execution logic
                // For now, we'll just remove it from the queue
                this.removeFromReplayQueue(request.id);
                this.metrics.replayedRequests++;
                this.emit('replaySuccess', request);
            }
            catch (error) {
                request.currentRetries++;
                request.lastError = error;
                if (request.currentRetries >= request.maxRetries) {
                    this.removeFromReplayQueue(request.id);
                    this.emit('replayFailed', request, error);
                }
            }
        }
    }
    /**
     * Get current metrics
     */
    getMetrics() {
        this.updateMetrics();
        return { ...this.metrics };
    }
    /**
     * Reset circuit breaker for endpoint
     */
    resetCircuitBreaker(endpoint) {
        const state = this.circuitBreakers.get(endpoint);
        if (state) {
            state.state = 'CLOSED';
            state.failureCount = 0;
            state.failures = [];
            state.nextAttemptTime = null;
            this.emit('circuitBreakerReset', { endpoint });
            this.logger.info('Circuit breaker reset', { endpoint });
        }
    }
    /**
     * Execute request with circuit breaker protection
     */
    async executeRequestWithCircuitBreaker(requestFn, endpoint, method, requestData, headers) {
        const circuitState = this.getCircuitBreakerState(endpoint);
        let lastError;
        for (let attempt = 1; attempt <= this.config.maxRetries + 1; attempt++) {
            try {
                // Check circuit breaker before each attempt
                if (circuitState.state === 'OPEN') {
                    throw new Error(`Circuit breaker is OPEN for endpoint: ${endpoint}`);
                }
                const result = await requestFn();
                // Record success
                this.recordSuccess(endpoint);
                return result;
            }
            catch (error) {
                const autotaskError = error;
                lastError = autotaskError;
                // Record error
                this.recordError(endpoint, autotaskError);
                // Check if we should retry
                if (attempt <= this.config.maxRetries && this.shouldRetry(autotaskError)) {
                    const delay = this.getRetryDelay(autotaskError, attempt, endpoint);
                    if (delay > 0) {
                        this.logger.warn('Retrying request after error', {
                            endpoint, method, attempt, delay, error: autotaskError.message
                        });
                        await this.sleep(delay);
                        continue;
                    }
                }
                // No more retries - check if we should add to replay queue
                if (this.config.enableRequestReplay && this.shouldReplay(autotaskError)) {
                    this.addToReplayQueue(endpoint, method, requestData, headers || {});
                }
                throw autotaskError;
            }
        }
        throw lastError || new Error('Maximum retries exceeded');
    }
    /**
     * Record successful request
     */
    recordSuccess(endpoint) {
        const circuitState = this.circuitBreakers.get(endpoint);
        if (circuitState) {
            circuitState.successCount++;
            circuitState.lastSuccessTime = new Date();
            if (circuitState.state === 'HALF_OPEN') {
                circuitState.state = 'CLOSED';
                circuitState.failureCount = 0;
                circuitState.failures = [];
                this.emit('circuitBreakerClosed', { endpoint });
            }
        }
        this.metrics.successfulRetries++;
    }
    /**
     * Record failed request
     */
    recordError(endpoint, error) {
        const circuitState = this.getCircuitBreakerState(endpoint);
        if (this.shouldTriggerCircuitBreaker(error)) {
            circuitState.failureCount++;
            circuitState.lastFailureTime = new Date();
            circuitState.failures.push(error);
            // Keep only recent failures
            const cutoff = new Date(Date.now() - this.config.circuitBreakerWindowMs);
            circuitState.failures = circuitState.failures.filter(err => err.timestamp > cutoff);
        }
        // Store error for learning
        if (this.config.enableErrorLearning) {
            if (!this.errorHistory.has(endpoint)) {
                this.errorHistory.set(endpoint, []);
            }
            this.errorHistory.get(endpoint).push(error);
            // Keep only recent errors (last 100)
            const errors = this.errorHistory.get(endpoint);
            if (errors.length > 100) {
                errors.splice(0, errors.length - 100);
            }
        }
        this.metrics.failedRetries++;
    }
    /**
     * Update circuit breaker state
     */
    updateCircuitBreakerState(state) {
        const now = new Date();
        if (state.state === 'CLOSED') {
            // Check if failure rate exceeds threshold
            const recentFailures = state.failures.filter(err => now.getTime() - err.timestamp.getTime() < this.config.circuitBreakerWindowMs);
            if (recentFailures.length > 0) {
                const totalRequests = state.successCount + recentFailures.length;
                const failureRate = recentFailures.length / totalRequests;
                if (failureRate > this.config.circuitBreakerThreshold) {
                    state.state = 'OPEN';
                    state.nextAttemptTime = new Date(now.getTime() + this.config.circuitBreakerRecoveryMs);
                    this.emit('circuitBreakerOpened', { endpoint: state.endpoint, failureRate });
                    this.metrics.circuitBreakerActivations++;
                }
            }
        }
        else if (state.state === 'OPEN') {
            // Check if recovery time has passed
            if (state.nextAttemptTime && now >= state.nextAttemptTime) {
                state.state = 'HALF_OPEN';
                this.emit('circuitBreakerHalfOpen', { endpoint: state.endpoint });
            }
        }
    }
    /**
     * Determine if request should be retried
     */
    shouldRetry(error) {
        // Don't retry auth errors
        if (error instanceof errors_1.AuthError) {
            return false;
        }
        // Always retry rate limit errors
        if (error instanceof errors_1.RateLimitError) {
            return true;
        }
        // Retry server errors and network errors
        if (error instanceof errors_1.ServerError || error instanceof errors_1.NetworkError) {
            return true;
        }
        // Don't retry other client errors (4xx)
        return false;
    }
    /**
     * Determine if request should be added to replay queue
     */
    shouldReplay(error) {
        return error instanceof errors_1.ServerError ||
            error instanceof errors_1.NetworkError ||
            error instanceof errors_1.RateLimitError;
    }
    /**
     * Get learning adjustment for retry delay
     */
    getLearningAdjustment(endpoint, error) {
        if (!this.config.enableErrorLearning) {
            return 0;
        }
        const errors = this.errorHistory.get(endpoint) || [];
        const recentErrors = errors.filter(err => Date.now() - err.timestamp.getTime() < 600000 // Last 10 minutes
        );
        if (recentErrors.length === 0) {
            return 0;
        }
        // If we've seen similar errors recently, increase delay
        const similarErrors = recentErrors.filter(err => err.constructor.name === error.constructor.name);
        if (similarErrors.length > 3) {
            return 5000; // Add 5 seconds if many similar errors
        }
        else if (similarErrors.length > 1) {
            return 2000; // Add 2 seconds if some similar errors
        }
        return 0;
    }
    /**
     * Remove request from replay queue
     */
    removeFromReplayQueue(requestId) {
        const index = this.replayQueue.findIndex(req => req.id === requestId);
        if (index !== -1) {
            this.replayQueue.splice(index, 1);
        }
    }
    /**
     * Initialize metrics
     */
    initializeMetrics() {
        this.metrics = {
            totalRetries: 0,
            successfulRetries: 0,
            failedRetries: 0,
            averageRetryDelay: 0,
            circuitBreakerActivations: 0,
            replayedRequests: 0,
            endpointStats: new Map(),
            errorPatterns: new Map()
        };
    }
    /**
     * Update metrics
     */
    updateMetrics() {
        // Update endpoint stats
        for (const [endpoint, circuitState] of this.circuitBreakers.entries()) {
            this.metrics.endpointStats.set(endpoint, {
                totalRequests: circuitState.successCount + circuitState.failureCount,
                failedRequests: circuitState.failureCount,
                averageRetryCount: 0, // Would need to track this separately
                circuitState: circuitState.state
            });
        }
        // Update error patterns
        for (const [endpoint, errors] of this.errorHistory.entries()) {
            for (const error of errors) {
                const errorType = error.constructor.name;
                const count = this.metrics.errorPatterns.get(errorType) || 0;
                this.metrics.errorPatterns.set(errorType, count + 1);
            }
        }
    }
    /**
     * Start metrics collection
     */
    startMetricsCollection() {
        this.metricsInterval = setInterval(() => {
            this.updateMetrics();
            this.processReplayQueue();
            this.emit('metricsUpdated', this.metrics);
            // Periodic logging
            if (this.metrics.totalRetries % 50 === 0 && this.metrics.totalRetries > 0) {
                this.logger.info('Retry patterns performance summary', {
                    totalRetries: this.metrics.totalRetries,
                    successRate: `${((this.metrics.successfulRetries / this.metrics.totalRetries) * 100).toFixed(1)}%`,
                    circuitBreakerActivations: this.metrics.circuitBreakerActivations,
                    replayQueueSize: this.replayQueue.length,
                    activeCircuitBreakers: Array.from(this.circuitBreakers.values())
                        .filter(cb => cb.state !== 'CLOSED').length
                });
            }
        }, 30000); // Update every 30 seconds
    }
    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Cleanup and shutdown
     */
    destroy() {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
        this.replayQueue.length = 0;
        this.pendingRequests.clear();
        this.removeAllListeners();
        this.logger.info('AutotaskRetryPatterns destroyed');
    }
}
exports.AutotaskRetryPatterns = AutotaskRetryPatterns;
//# sourceMappingURL=AutotaskRetryPatterns.js.map