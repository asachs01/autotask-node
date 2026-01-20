/**
 * Retry strategy implementation with exponential backoff
 *
 * Provides intelligent retry logic for transient failures with
 * configurable backoff strategies and jitter to prevent thundering herd.
 */
/**
 * Configuration options for retry behavior
 */
export interface RetryOptions {
    /** Maximum number of retry attempts (default: 3) */
    maxRetries?: number;
    /** Initial delay in milliseconds (default: 1000) */
    initialDelay?: number;
    /** Maximum delay in milliseconds (default: 30000) */
    maxDelay?: number;
    /** Backoff multiplier (default: 2) */
    backoffMultiplier?: number;
    /** Jitter factor (0-1) to randomize delays (default: 0.1) */
    jitterFactor?: number;
    /** Custom function to determine if error is retryable */
    isRetryable?: (error: Error, attempt: number) => boolean;
    /** Callback for retry events */
    onRetry?: (error: Error, attempt: number, nextDelay: number) => void;
    /** Abort signal for cancelling retries */
    abortSignal?: any;
}
/**
 * Legacy alias for backward compatibility
 */
export type ExponentialBackoffOptions = RetryOptions;
/**
 * Legacy alias for backward compatibility
 */
export type ExponentialBackoffStrategy = RetryStrategy;
/**
 * Legacy alias for backward compatibility
 */
export type LinearBackoffStrategy = RetryStrategy;
/**
 * Legacy alias for backward compatibility
 */
export type FixedDelayStrategy = RetryStrategy;
/**
 * Result of a retry operation
 */
export interface RetryResult<T> {
    /** Whether the operation succeeded */
    success: boolean;
    /** Result data if successful */
    data?: T;
    /** Final error if all retries failed */
    error?: Error;
    /** Number of attempts made */
    attempts: number;
    /** Total time spent retrying in milliseconds */
    totalTime: number;
}
/**
 * Retry strategy with exponential backoff and jitter
 */
export declare class RetryStrategy {
    private readonly defaultOptions;
    constructor(defaultOptions?: RetryOptions);
    /**
     * Execute an operation with retry logic
     */
    execute<T>(operation: () => Promise<T>, options?: RetryOptions): Promise<RetryResult<T>>;
    /**
     * Execute an operation with retry logic, throwing on failure
     */
    executeOrThrow<T>(operation: () => Promise<T>, options?: RetryOptions): Promise<T>;
    /**
     * Calculate delay for a given attempt with exponential backoff and jitter
     */
    private calculateDelay;
    /**
     * Delay execution for specified milliseconds
     */
    private delay;
    /**
     * Merge options with defaults
     */
    private mergeOptions;
}
/**
 * Default retry strategy instance
 */
export declare const defaultRetryStrategy: RetryStrategy;
/**
 * Decorator for adding retry logic to methods
 */
export declare function WithRetry(options?: RetryOptions): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Utility function for retrying an operation
 */
export declare function retry<T>(operation: () => Promise<T>, options?: RetryOptions): Promise<T>;
/**
 * Utility function for retrying with result
 */
export declare function retryWithResult<T>(operation: () => Promise<T>, options?: RetryOptions): Promise<RetryResult<T>>;
//# sourceMappingURL=RetryStrategy.d.ts.map