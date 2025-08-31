/**
 * Retry strategy implementation with exponential backoff
 * 
 * Provides intelligent retry logic for transient failures with
 * configurable backoff strategies and jitter to prevent thundering herd.
 */

import { ErrorFactory } from './AutotaskErrors';

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
export class RetryStrategy {
  private readonly defaultOptions: Required<Omit<RetryOptions, 'onRetry' | 'abortSignal'>>;
  
  constructor(defaultOptions?: RetryOptions) {
    this.defaultOptions = {
      maxRetries: defaultOptions?.maxRetries ?? 3,
      initialDelay: defaultOptions?.initialDelay ?? 1000,
      maxDelay: defaultOptions?.maxDelay ?? 30000,
      backoffMultiplier: defaultOptions?.backoffMultiplier ?? 2,
      jitterFactor: defaultOptions?.jitterFactor ?? 0.1,
      isRetryable: defaultOptions?.isRetryable ?? ErrorFactory.isRetryable
    };
  }
  
  /**
   * Execute an operation with retry logic
   */
  async execute<T>(
    operation: () => Promise<T>,
    options?: RetryOptions
  ): Promise<RetryResult<T>> {
    const opts = this.mergeOptions(options);
    const startTime = Date.now();
    let lastError: Error | undefined;
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
      } catch (error) {
        lastError = error as Error;
        
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
        } catch (abortError) {
          // If aborted during delay, use the abort error as final error
          lastError = abortError as Error;
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
  async executeOrThrow<T>(
    operation: () => Promise<T>,
    options?: RetryOptions
  ): Promise<T> {
    const result = await this.execute(operation, options);
    
    if (!result.success) {
      throw result.error || new Error('Operation failed after retries');
    }
    
    return result.data!;
  }
  
  /**
   * Calculate delay for a given attempt with exponential backoff and jitter
   */
  private calculateDelay(attempt: number, options: Required<Omit<RetryOptions, 'onRetry' | 'abortSignal'>>): number {
    // Base delay with exponential backoff
    const baseDelay = Math.min(
      options.initialDelay * Math.pow(options.backoffMultiplier, attempt - 1),
      options.maxDelay
    );
    
    // Add jitter to prevent thundering herd
    const jitter = baseDelay * options.jitterFactor * (Math.random() * 2 - 1);
    
    return Math.max(0, Math.round(baseDelay + jitter));
  }
  
  /**
   * Delay execution for specified milliseconds
   */
  private delay(ms: number, abortSignal?: any): Promise<void> {
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
  private mergeOptions(options?: RetryOptions): Required<Omit<RetryOptions, 'onRetry' | 'abortSignal'>> {
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

/**
 * Default retry strategy instance
 */
export const defaultRetryStrategy = new RetryStrategy();

/**
 * Decorator for adding retry logic to methods
 */
export function WithRetry(options?: RetryOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const strategy = new RetryStrategy(options);
      return strategy.executeOrThrow(
        () => originalMethod.apply(this, args),
        options
      );
    };
    
    return descriptor;
  };
}

/**
 * Utility function for retrying an operation
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  return defaultRetryStrategy.executeOrThrow(operation, options);
}

/**
 * Utility function for retrying with result
 */
export async function retryWithResult<T>(
  operation: () => Promise<T>,
  options?: RetryOptions
): Promise<RetryResult<T>> {
  return defaultRetryStrategy.execute(operation, options);
}