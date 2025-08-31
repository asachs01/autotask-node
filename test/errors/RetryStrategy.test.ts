/**
 * Test suite for RetryStrategy implementation
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  RetryStrategy,
  RetryOptions,
  retry,
  retryWithResult,
  WithRetry
} from '../../src/errors/RetryStrategy';
import {
  NetworkError,
  RateLimitError,
  ValidationError,
  AuthenticationError
} from '../../src/errors/AutotaskErrors';

// Type helpers for Jest mocks
type AsyncFn<T = any> = () => Promise<T>;
type MockAsyncFn<T = any> = jest.MockedFunction<AsyncFn<T>>;

describe('RetryStrategy', () => {
  let strategy: RetryStrategy;
  
  beforeEach(() => {
    strategy = new RetryStrategy({
      maxRetries: 3,
      initialDelay: 100,
      maxDelay: 1000,
      backoffMultiplier: 2,
      jitterFactor: 0
    });
    
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  describe('Basic retry behavior', () => {
    it('should succeed on first attempt', async () => {
      const operation = jest.fn<AsyncFn<string>>().mockResolvedValue('success');
      
      const result = await strategy.execute(operation);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(1);
      expect(operation).toHaveBeenCalledTimes(1);
    });
    
    it('should retry on transient failure', async () => {
      const operation = jest.fn<AsyncFn<string>>()
        .mockRejectedValueOnce(new NetworkError('Connection failed'))
        .mockRejectedValueOnce(new NetworkError('Connection failed'))
        .mockResolvedValue('success');
      
      const result = await strategy.execute(operation);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(3);
      expect(operation).toHaveBeenCalledTimes(3);
    });
    
    it('should fail after max retries', async () => {
      const error = new NetworkError('Connection failed');
      const operation = jest.fn<AsyncFn<string>>().mockRejectedValue(error);
      
      const result = await strategy.execute(operation);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
      expect(result.attempts).toBe(4); // initial + 3 retries
      expect(operation).toHaveBeenCalledTimes(4);
    });
    
    it('should not retry non-retryable errors', async () => {
      const error = new ValidationError('Invalid input');
      const operation = jest.fn<AsyncFn<string>>().mockRejectedValue(error);
      
      const result = await strategy.execute(operation);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
      expect(result.attempts).toBe(1);
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('Exponential backoff', () => {
    it('should apply exponential backoff without jitter', async () => {
      jest.useFakeTimers();
      
      const operation = jest.fn<AsyncFn<string>>()
        .mockRejectedValueOnce(new NetworkError('Failed'))
        .mockRejectedValueOnce(new NetworkError('Failed'))
        .mockRejectedValueOnce(new NetworkError('Failed'))
        .mockResolvedValue('success');
      
      const delays: number[] = [];
      const onRetry = jest.fn((error: Error, attempt: number, delay: number) => {
        delays.push(delay);
      });
      
      const promise = strategy.execute(operation, { onRetry });
      
      // First attempt fails immediately
      await jest.advanceTimersByTimeAsync(0);
      expect(operation).toHaveBeenCalledTimes(1);
      
      // Second attempt after 100ms
      await jest.advanceTimersByTimeAsync(100);
      expect(operation).toHaveBeenCalledTimes(2);
      
      // Third attempt after 200ms (100 * 2)
      await jest.advanceTimersByTimeAsync(200);
      expect(operation).toHaveBeenCalledTimes(3);
      
      // Fourth attempt after 400ms (100 * 2^2)
      await jest.advanceTimersByTimeAsync(400);
      expect(operation).toHaveBeenCalledTimes(4);
      
      const result = await promise;
      
      expect(result.success).toBe(true);
      expect(delays).toEqual([100, 200, 400]);
    });
    
    it('should respect max delay', async () => {
      const strategy = new RetryStrategy({
        maxRetries: 5,
        initialDelay: 500,
        maxDelay: 1000,
        backoffMultiplier: 2,
        jitterFactor: 0
      });
      
      const operation = jest.fn<AsyncFn<string>>().mockRejectedValue(new NetworkError('Failed'));
      const delays: number[] = [];
      
      await strategy.execute(operation, {
        onRetry: (error: Error, attempt: number, delay: number) => delays.push(delay)
      });
      
      // 500, 1000, 1000, 1000, 1000 (capped at maxDelay)
      expect(delays).toEqual([500, 1000, 1000, 1000, 1000]);
    });
  });
  
  describe('Jitter', () => {
    it('should add jitter to prevent thundering herd', async () => {
      const strategy = new RetryStrategy({
        maxRetries: 3,
        initialDelay: 1000,
        backoffMultiplier: 2,
        jitterFactor: 0.5
      });
      
      const operation = jest.fn<AsyncFn<string>>().mockRejectedValue(new NetworkError('Failed'));
      const delays: number[] = [];
      
      await strategy.execute(operation, {
        onRetry: (error: Error, attempt: number, delay: number) => delays.push(delay)
      });
      
      // With 50% jitter, delays should be within ±50% of base delay
      expect(delays[0]).toBeGreaterThanOrEqual(500);  // 1000 - 50%
      expect(delays[0]).toBeLessThanOrEqual(1500);    // 1000 + 50%
      
      expect(delays[1]).toBeGreaterThanOrEqual(1000); // 2000 - 50%
      expect(delays[1]).toBeLessThanOrEqual(3000);    // 2000 + 50%
      
      expect(delays[2]).toBeGreaterThanOrEqual(2000); // 4000 - 50%
      expect(delays[2]).toBeLessThanOrEqual(6000);    // 4000 + 50%
    });
  });
  
  describe('Custom retry logic', () => {
    it('should use custom isRetryable function', async () => {
      const customRetryable = jest.fn((error: Error, attempt: number) => {
        // Only retry on first two attempts
        return attempt <= 2;
      });
      
      const operation = jest.fn<AsyncFn<string>>().mockRejectedValue(new NetworkError('Failed'));
      
      const result = await strategy.execute(operation, {
        isRetryable: customRetryable
      });
      
      expect(customRetryable).toHaveBeenCalledTimes(3);
      expect(operation).toHaveBeenCalledTimes(3); // initial + 2 retries
    });
    
    it('should handle RateLimitError with retry-after header', async () => {
      const rateLimitError = new RateLimitError('Rate limited', 2); // 2 seconds
      const operation = jest.fn<AsyncFn<string>>()
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValue('success');
      
      const delays: number[] = [];
      const result = await strategy.execute(operation, {
        onRetry: (error, attempt, delay) => delays.push(delay),
        isRetryable: (error) => error instanceof RateLimitError
      });
      
      expect(result.success).toBe(true);
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('Abort signal', () => {
    it('should abort retry on signal', async () => {
      const controller = { signal: { aborted: false }, abort: () => { controller.signal.aborted = true; } };
      const operation = jest.fn<AsyncFn<string>>()
        .mockRejectedValueOnce(new NetworkError('Failed'))
        .mockImplementation(() => {
          // Abort after first retry
          controller.abort();
          return Promise.reject(new NetworkError('Failed'));
        });
      
      const result = await strategy.execute(operation, {
        abortSignal: controller.signal
      });
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('aborted');
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('executeOrThrow', () => {
    it('should return data on success', async () => {
      const operation = jest.fn<AsyncFn<string>>().mockResolvedValue('success');
      
      const result = await strategy.executeOrThrow(operation);
      
      expect(result).toBe('success');
    });
    
    it('should throw error on failure', async () => {
      const error = new ValidationError('Invalid');
      const operation = jest.fn<AsyncFn<string>>().mockRejectedValue(error);
      
      await expect(strategy.executeOrThrow(operation)).rejects.toThrow(error);
    });
  });
  
  describe('Utility functions', () => {
    it('should retry using default strategy', async () => {
      const operation = jest.fn<AsyncFn<string>>()
        .mockRejectedValueOnce(new NetworkError('Failed'))
        .mockResolvedValue('success');
      
      const result = await retry(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });
    
    it('should get retry result with details', async () => {
      const operation = jest.fn<AsyncFn<string>>()
        .mockRejectedValueOnce(new NetworkError('Failed'))
        .mockResolvedValue('success');
      
      const result = await retryWithResult(operation);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(2);
      expect(result.totalTime).toBeGreaterThan(0);
    });
  });
  
  describe('WithRetry decorator', () => {
    it('should retry decorated method', async () => {
      class TestService {
        public attempts = 0;
        
        async unreliableMethod(): Promise<string> {
          this.attempts++;
          if (this.attempts < 3) {
            throw new NetworkError('Connection failed');
          }
          return 'success';
        }
      }
      
      // Apply decorator manually for testing
      const service = new TestService();
      const originalMethod = service.unreliableMethod.bind(service);
      const strategy = new RetryStrategy({ maxRetries: 2, initialDelay: 10, jitterFactor: 0 });
      
      const result = await strategy.executeOrThrow(() => originalMethod());
      
      expect(result).toBe('success');
      expect(service.attempts).toBe(3);
    });
    
    it('should throw after max retries on decorated method', async () => {
      class TestService {
        async nonRetryableMethod(): Promise<string> {
          throw new ValidationError('Always fails');
        }
      }
      
      const service = new TestService();
      const originalMethod = service.nonRetryableMethod.bind(service);
      const strategy = new RetryStrategy({ maxRetries: 1 });
      
      await expect(strategy.executeOrThrow(() => originalMethod())).rejects.toThrow(ValidationError);
    });
  });
  
  describe('Real-world scenarios', () => {
    it('should handle intermittent network issues', async () => {
      let callCount = 0;
      const operation = jest.fn<AsyncFn<{ id: number; name: string }>>().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw new NetworkError('ECONNRESET');
        } else if (callCount === 2) {
          throw new NetworkError('ETIMEDOUT');
        } else {
          return Promise.resolve({ id: 123, name: 'Test' });
        }
      });
      
      const result = await strategy.execute(operation);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 123, name: 'Test' });
      expect(result.attempts).toBe(3);
    });
    
    it('should handle rate limiting with backoff', async () => {
      jest.useFakeTimers();
      
      let callCount = 0;
      const operation = jest.fn<AsyncFn<string>>().mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          throw new RateLimitError('Too many requests', 1);
        }
        return Promise.resolve('success');
      });
      
      const promise = strategy.execute(operation);
      
      // Advance through retries
      await jest.advanceTimersByTimeAsync(0);    // First attempt
      await jest.advanceTimersByTimeAsync(100);  // Second attempt after delay
      await jest.advanceTimersByTimeAsync(200);  // Third attempt after delay
      
      const result = await promise;
      
      expect(result.success).toBe(true);
      expect(callCount).toBe(3);
    });
    
    it('should not retry authentication errors', async () => {
      const operation = jest.fn<AsyncFn<string>>().mockRejectedValue(
        new AuthenticationError('Invalid credentials')
      );
      
      const result = await strategy.execute(operation);
      
      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1);
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('Performance and timing', () => {
    it('should track total retry time', async () => {
      const operation = jest.fn<AsyncFn<string>>()
        .mockRejectedValueOnce(new NetworkError('Failed'))
        .mockRejectedValueOnce(new NetworkError('Failed'))
        .mockResolvedValue('success');
      
      const startTime = Date.now();
      const result = await strategy.execute(operation);
      const endTime = Date.now();
      
      // Should have taken at least some time due to delays
      expect(result.totalTime).toBeGreaterThan(0);
      expect(result.totalTime).toBeLessThanOrEqual(endTime - startTime + 50); // Allow 50ms tolerance
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(3);
    });
  });
});