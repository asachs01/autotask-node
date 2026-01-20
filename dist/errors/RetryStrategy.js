"use strict";
/**
 * Retry strategy implementation with exponential backoff
 *
 * Provides intelligent retry logic for transient failures with
 * configurable backoff strategies and jitter to prevent thundering herd.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultRetryStrategy = exports.RetryStrategy = void 0;
exports.WithRetry = WithRetry;
exports.retry = retry;
exports.retryWithResult = retryWithResult;
const AutotaskErrors_1 = require("./AutotaskErrors");
/**
 * Retry strategy with exponential backoff and jitter
 */
class RetryStrategy {
    constructor(defaultOptions) {
        this.defaultOptions = {
            maxRetries: defaultOptions?.maxRetries ?? 3,
            initialDelay: defaultOptions?.initialDelay ?? 1000,
            maxDelay: defaultOptions?.maxDelay ?? 30000,
            backoffMultiplier: defaultOptions?.backoffMultiplier ?? 2,
            jitterFactor: defaultOptions?.jitterFactor ?? 0.1,
            isRetryable: defaultOptions?.isRetryable ?? AutotaskErrors_1.ErrorFactory.isRetryable
        };
    }
    /**
     * Execute an operation with retry logic
     */
    async execute(operation, options) {
        const opts = this.mergeOptions(options);
        const startTime = Date.now();
        let lastError;
        let finalAttempt = 1;
        for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
            finalAttempt = attempt;
            try {
                // Check if operation was aborted
                if (options?.abortSignal?.aborted) {
                    throw new Error('Operation aborted');
                }
                // Execute the operation
                const data = await operation();
                return {
                    success: true,
                    data,
                    attempts: attempt,
                    totalTime: Date.now() - startTime
                };
            }
            catch (error) {
                lastError = error;
                // Check if we should retry
                const isLastAttempt = attempt === opts.maxRetries + 1;
                const shouldRetry = !isLastAttempt && opts.isRetryable(lastError, attempt);
                if (!shouldRetry) {
                    break;
                }
                // Calculate delay with exponential backoff and jitter
                const delay = this.calculateDelay(attempt, opts);
                // Notify retry callback
                options?.onRetry?.(lastError, attempt, delay);
                // Wait before retrying
                try {
                    await this.delay(delay, options?.abortSignal);
                }
                catch (abortError) {
                    // If aborted during delay, use the abort error as final error
                    lastError = abortError;
                    break;
                }
            }
        }
        return {
            success: false,
            error: lastError,
            attempts: finalAttempt,
            totalTime: Date.now() - startTime
        };
    }
    /**
     * Execute an operation with retry logic, throwing on failure
     */
    async executeOrThrow(operation, options) {
        const result = await this.execute(operation, options);
        if (!result.success) {
            throw result.error || new Error('Operation failed after retries');
        }
        return result.data;
    }
    /**
     * Calculate delay for a given attempt with exponential backoff and jitter
     */
    calculateDelay(attempt, options) {
        // Base delay with exponential backoff
        const baseDelay = Math.min(options.initialDelay * Math.pow(options.backoffMultiplier, attempt - 1), options.maxDelay);
        // Add jitter to prevent thundering herd
        const jitter = baseDelay * options.jitterFactor * (Math.random() * 2 - 1);
        return Math.max(0, Math.round(baseDelay + jitter));
    }
    /**
     * Delay execution for specified milliseconds
     */
    delay(ms, abortSignal) {
        return new Promise((resolve, reject) => {
            if (abortSignal?.aborted) {
                reject(new Error('Operation aborted'));
                return;
            }
            const timeout = setTimeout(resolve, ms);
            // Handle abort signal
            if (abortSignal) {
                const abortHandler = () => {
                    clearTimeout(timeout);
                    reject(new Error('Operation aborted'));
                };
                abortSignal.addEventListener('abort', abortHandler, { once: true });
            }
        });
    }
    /**
     * Merge options with defaults
     */
    mergeOptions(options) {
        return {
            maxRetries: options?.maxRetries ?? this.defaultOptions.maxRetries,
            initialDelay: options?.initialDelay ?? this.defaultOptions.initialDelay,
            maxDelay: options?.maxDelay ?? this.defaultOptions.maxDelay,
            backoffMultiplier: options?.backoffMultiplier ?? this.defaultOptions.backoffMultiplier,
            jitterFactor: options?.jitterFactor ?? this.defaultOptions.jitterFactor,
            isRetryable: options?.isRetryable ?? this.defaultOptions.isRetryable
        };
    }
}
exports.RetryStrategy = RetryStrategy;
/**
 * Default retry strategy instance
 */
exports.defaultRetryStrategy = new RetryStrategy();
/**
 * Decorator for adding retry logic to methods
 */
function WithRetry(options) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            const strategy = new RetryStrategy(options);
            return strategy.executeOrThrow(() => originalMethod.apply(this, args), options);
        };
        return descriptor;
    };
}
/**
 * Utility function for retrying an operation
 */
async function retry(operation, options) {
    return exports.defaultRetryStrategy.executeOrThrow(operation, options);
}
/**
 * Utility function for retrying with result
 */
async function retryWithResult(operation, options) {
    return exports.defaultRetryStrategy.execute(operation, options);
}
//# sourceMappingURL=RetryStrategy.js.map