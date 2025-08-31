/**
 * Test suite for CircuitBreaker implementation
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  CircuitBreaker,
  CircuitBreakerState,
  CircuitBreakerRegistry,
  WithCircuitBreaker,
  withCircuitBreaker
} from '../../src/errors/CircuitBreaker';
import {
  NetworkError,
  ValidationError,
  AutotaskError
} from '../../src/errors/AutotaskErrors';

// Type helpers for Jest mocks
type AsyncFn<T = any> = () => Promise<T>;
type MockAsyncFn<T = any> = jest.MockedFunction<AsyncFn<T>>;

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;
  
  beforeEach(() => {
    circuitBreaker = new CircuitBreaker('test-service', {
      failureThreshold: 3,
      successThreshold: 2,
      monitoringPeriod: 10000,
      openTimeout: 1000,
      minimumCooldown: 0 // Remove cooldown for faster testing
    });
    
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    circuitBreaker.reset();
    jest.useRealTimers();
  });
  
  describe('Basic functionality', () => {
    it('should start in closed state', () => {
      expect(circuitBreaker.getCurrentState()).toBe(CircuitBreakerState.CLOSED);
      expect(circuitBreaker.isHealthy()).toBe(true);
    });
    
    it('should execute operations when closed', async () => {
      const operation = jest.fn<AsyncFn<string>>().mockResolvedValue('success');
      
      const result = await circuitBreaker.execute(operation);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.executed).toBe(true);
      expect(result.state).toBe(CircuitBreakerState.CLOSED);
      expect(operation).toHaveBeenCalledTimes(1);
    });
    
    it('should handle operation failures', async () => {
      const error = new NetworkError('Connection failed');
      const operation = jest.fn<AsyncFn<string>>().mockRejectedValue(error);
      
      const result = await circuitBreaker.execute(operation);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
      expect(result.executed).toBe(true);
      expect(result.state).toBe(CircuitBreakerState.CLOSED);
    });
  });
  
  describe('State transitions', () => {
    it('should open after failure threshold is reached', async () => {
      const error = new NetworkError('Connection failed');
      const operation = jest.fn<AsyncFn<string>>().mockRejectedValue(error);
      
      // Execute 3 failures to reach threshold
      await circuitBreaker.execute(operation);
      await circuitBreaker.execute(operation);
      
      expect(circuitBreaker.getCurrentState()).toBe(CircuitBreakerState.CLOSED);
      
      await circuitBreaker.execute(operation);
      
      expect(circuitBreaker.getCurrentState()).toBe(CircuitBreakerState.OPEN);
      expect(circuitBreaker.isHealthy()).toBe(false);
    });
    
    it('should block requests when open', async () => {
      // Force circuit to open state
      circuitBreaker.forceState(CircuitBreakerState.OPEN);
      
      const operation = jest.fn<AsyncFn<string>>().mockResolvedValue('success');
      const result = await circuitBreaker.execute(operation);
      
      expect(result.success).toBe(false);
      expect(result.executed).toBe(false);
      expect(result.error).toBeInstanceOf(AutotaskError);
      expect(result.error?.message).toContain('Circuit breaker is open');
      expect(operation).not.toHaveBeenCalled();
    });
    
    it('should transition to half-open after timeout', async () => {
      jest.useFakeTimers();
      
      // Open the circuit
      const error = new NetworkError('Connection failed');
      const operation = jest.fn<AsyncFn<string>>().mockRejectedValue(error);
      
      for (let i = 0; i < 3; i++) {
        await circuitBreaker.execute(operation);
      }
      
      expect(circuitBreaker.getCurrentState()).toBe(CircuitBreakerState.OPEN);
      
      // Advance time to trigger half-open transition
      jest.advanceTimersByTime(1000);
      
      expect(circuitBreaker.getCurrentState()).toBe(CircuitBreakerState.HALF_OPEN);
    });
    
    it('should close after successful operations in half-open state', async () => {
      // Create a fresh circuit breaker with specific config for this test
      const testCircuitBreaker = new CircuitBreaker('test-half-open', {
        successThreshold: 2,
        failureThreshold: 3,
        monitoringPeriod: 60000,
        openTimeout: 1000,
        minimumCooldown: 0 // Remove cooldown for immediate state changes
      });
      
      // Force to half-open state
      testCircuitBreaker.forceState(CircuitBreakerState.HALF_OPEN);
      expect(testCircuitBreaker.getCurrentState()).toBe(CircuitBreakerState.HALF_OPEN);
      
      const operation = jest.fn<AsyncFn<string>>().mockResolvedValue('success');
      
      // Execute first success - should stay in half-open
      let result1 = await testCircuitBreaker.execute(operation);
      expect(result1.success).toBe(true);
      expect(testCircuitBreaker.getCurrentState()).toBe(CircuitBreakerState.HALF_OPEN);
      
      // Execute second success - should close circuit (successThreshold is 2)
      let result2 = await testCircuitBreaker.execute(operation);
      expect(result2.success).toBe(true);
      expect(testCircuitBreaker.getCurrentState()).toBe(CircuitBreakerState.CLOSED);
    });
    
    it('should reopen on failure in half-open state', async () => {
      // Force to half-open state
      circuitBreaker.forceState(CircuitBreakerState.HALF_OPEN);
      
      const error = new NetworkError('Still failing');
      const operation = jest.fn<AsyncFn<string>>().mockRejectedValue(error);
      
      await circuitBreaker.execute(operation);
      
      expect(circuitBreaker.getCurrentState()).toBe(CircuitBreakerState.OPEN);
    });
  });
  
  describe('Custom failure detection', () => {
    it('should use custom failure detection function', async () => {
      const customCircuitBreaker = new CircuitBreaker('test-custom', {
        failureThreshold: 2,
        isFailure: (error) => error instanceof ValidationError
      });
      
      // NetworkError should not count as failure with custom function
      const networkError = new NetworkError('Connection failed');
      const networkOp = jest.fn<AsyncFn<string>>().mockRejectedValue(networkError);
      
      await customCircuitBreaker.execute(networkOp);
      await customCircuitBreaker.execute(networkOp);
      await customCircuitBreaker.execute(networkOp);
      
      expect(customCircuitBreaker.getCurrentState()).toBe(CircuitBreakerState.CLOSED);
      
      // ValidationError should count as failure
      const validationError = new ValidationError('Invalid input');
      const validationOp = jest.fn<AsyncFn<string>>().mockRejectedValue(validationError);
      
      await customCircuitBreaker.execute(validationOp);
      await customCircuitBreaker.execute(validationOp);
      
      expect(customCircuitBreaker.getCurrentState()).toBe(CircuitBreakerState.OPEN);
      
      customCircuitBreaker.reset();
    });
  });
  
  describe('Metrics tracking', () => {
    it('should track comprehensive metrics', async () => {
      const successOp = jest.fn<AsyncFn<string>>().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('success'), 1))
      );
      const failOp = jest.fn<AsyncFn<string>>().mockImplementation(() => 
        new Promise((_, reject) => setTimeout(() => reject(new NetworkError('Failed')), 1))
      );
      
      // Execute some operations
      await circuitBreaker.execute(successOp);
      await circuitBreaker.execute(failOp);
      await circuitBreaker.execute(successOp);
      
      // Force open state to test rejected count
      circuitBreaker.forceState(CircuitBreakerState.OPEN);
      await circuitBreaker.execute(successOp);
      
      const metrics = circuitBreaker.getMetrics();
      
      expect(metrics.totalRequests).toBe(4);
      expect(metrics.successCount).toBe(2);
      expect(metrics.failureCount).toBe(1);
      expect(metrics.rejectedCount).toBe(1);
      expect(metrics.state).toBe(CircuitBreakerState.OPEN);
      expect(metrics.failureRate).toBeGreaterThan(0);
      expect(metrics.averageResponseTime).toBeGreaterThan(0);
      expect(metrics.stateTransitions).toBeGreaterThan(0);
    });
    
    it('should track state change timestamps', async () => {
      const error = new NetworkError('Connection failed');
      const operation = jest.fn<AsyncFn<string>>().mockRejectedValue(error);
      
      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await circuitBreaker.execute(operation);
      }
      
      const metrics = circuitBreaker.getMetrics();
      expect(metrics.lastOpenTime).toBeInstanceOf(Date);
      
      // Close the circuit
      circuitBreaker.forceState(CircuitBreakerState.CLOSED);
      const closedMetrics = circuitBreaker.getMetrics();
      expect(closedMetrics.lastCloseTime).toBeInstanceOf(Date);
    });
  });
  
  describe('Event handling', () => {
    it('should emit state change events', async () => {
      const stateChangeHandler = jest.fn();
      circuitBreaker.on('stateChange', stateChangeHandler);
      
      // Open the circuit
      const error = new NetworkError('Connection failed');
      const operation = jest.fn<AsyncFn<string>>().mockRejectedValue(error);
      
      for (let i = 0; i < 3; i++) {
        await circuitBreaker.execute(operation);
      }
      
      expect(stateChangeHandler).toHaveBeenCalledWith({
        from: CircuitBreakerState.CLOSED,
        to: CircuitBreakerState.OPEN,
        error: expect.any(NetworkError)
      });
    });
    
    it('should call custom state change callback', async () => {
      const onStateChange = jest.fn();
      const customCircuitBreaker = new CircuitBreaker('test-callback', {
        failureThreshold: 2,
        onStateChange
      });
      
      const error = new NetworkError('Connection failed');
      const operation = jest.fn<AsyncFn<string>>().mockRejectedValue(error);
      
      await customCircuitBreaker.execute(operation);
      await customCircuitBreaker.execute(operation);
      
      expect(onStateChange).toHaveBeenCalledWith(
        CircuitBreakerState.OPEN,
        expect.any(NetworkError)
      );
      
      customCircuitBreaker.reset();
    });
    
    it('should call circuit open callback', async () => {
      const onCircuitOpen = jest.fn();
      const customCircuitBreaker = new CircuitBreaker('test-open-callback', {
        onCircuitOpen
      });
      
      customCircuitBreaker.forceState(CircuitBreakerState.OPEN);
      
      const operation = jest.fn<AsyncFn<string>>().mockResolvedValue('success');
      await customCircuitBreaker.execute(operation);
      
      expect(onCircuitOpen).toHaveBeenCalledWith(expect.any(AutotaskError));
      
      customCircuitBreaker.reset();
    });
  });
  
  describe('executeOrThrow method', () => {
    it('should return data on success', async () => {
      const operation = jest.fn<AsyncFn<string>>().mockResolvedValue('success');
      
      const result = await circuitBreaker.executeOrThrow(operation);
      
      expect(result).toBe('success');
    });
    
    it('should throw error on failure', async () => {
      const error = new NetworkError('Connection failed');
      const operation = jest.fn<AsyncFn<string>>().mockRejectedValue(error);
      
      await expect(circuitBreaker.executeOrThrow(operation)).rejects.toThrow(error);
    });
    
    it('should throw error when circuit is open', async () => {
      circuitBreaker.forceState(CircuitBreakerState.OPEN);
      
      const operation = jest.fn<AsyncFn<string>>().mockResolvedValue('success');
      
      await expect(circuitBreaker.executeOrThrow(operation)).rejects.toThrow('Circuit breaker is open');
    });
  });
  
  describe('Reset functionality', () => {
    it('should reset all state and metrics', async () => {
      const error = new NetworkError('Connection failed');
      const operation = jest.fn<AsyncFn<string>>().mockRejectedValue(error);
      
      // Generate some activity
      for (let i = 0; i < 3; i++) {
        await circuitBreaker.execute(operation);
      }
      
      expect(circuitBreaker.getCurrentState()).toBe(CircuitBreakerState.OPEN);
      
      const metrics = circuitBreaker.getMetrics();
      expect(metrics.totalRequests).toBeGreaterThan(0);
      
      // Reset
      circuitBreaker.reset();
      
      expect(circuitBreaker.getCurrentState()).toBe(CircuitBreakerState.CLOSED);
      expect(circuitBreaker.isHealthy()).toBe(true);
      
      const resetMetrics = circuitBreaker.getMetrics();
      expect(resetMetrics.totalRequests).toBe(0);
      expect(resetMetrics.successCount).toBe(0);
      expect(resetMetrics.failureCount).toBe(0);
    });
  });
  
  describe('Minimum cooldown period', () => {
    it('should respect minimum cooldown between state changes', async () => {
      jest.useFakeTimers();
      
      const quickCircuitBreaker = new CircuitBreaker('test-cooldown', {
        failureThreshold: 1,
        minimumCooldown: 1000
      });
      
      const error = new NetworkError('Connection failed');
      const operation = jest.fn<AsyncFn<string>>().mockRejectedValue(error);
      
      // First failure should open circuit
      await quickCircuitBreaker.execute(operation);
      expect(quickCircuitBreaker.getCurrentState()).toBe(CircuitBreakerState.OPEN);
      
      // Try to force close immediately (should be ignored due to cooldown)
      quickCircuitBreaker.forceState(CircuitBreakerState.CLOSED);
      expect(quickCircuitBreaker.getCurrentState()).toBe(CircuitBreakerState.OPEN);
      
      // After cooldown, state change should work
      jest.advanceTimersByTime(1000);
      quickCircuitBreaker.forceState(CircuitBreakerState.CLOSED);
      expect(quickCircuitBreaker.getCurrentState()).toBe(CircuitBreakerState.CLOSED);
      
      quickCircuitBreaker.reset();
    });
  });
});

describe('CircuitBreakerRegistry', () => {
  let registry: CircuitBreakerRegistry;
  
  beforeEach(() => {
    registry = CircuitBreakerRegistry.getInstance();
    registry.resetAll();
  });
  
  afterEach(() => {
    registry.resetAll();
  });
  
  it('should be a singleton', () => {
    const registry1 = CircuitBreakerRegistry.getInstance();
    const registry2 = CircuitBreakerRegistry.getInstance();
    
    expect(registry1).toBe(registry2);
  });
  
  it('should create and manage circuit breakers', () => {
    const cb1 = registry.getCircuitBreaker('service1');
    const cb2 = registry.getCircuitBreaker('service2');
    const cb1Again = registry.getCircuitBreaker('service1');
    
    expect(cb1).toBeInstanceOf(CircuitBreaker);
    expect(cb2).toBeInstanceOf(CircuitBreaker);
    expect(cb1).toBe(cb1Again); // Same instance
    expect(cb1).not.toBe(cb2); // Different instances
  });
  
  it('should get all circuit breaker names', () => {
    registry.getCircuitBreaker('service1');
    registry.getCircuitBreaker('service2');
    registry.getCircuitBreaker('service3');
    
    const names = registry.getNames();
    expect(names).toEqual(['service1', 'service2', 'service3']);
  });
  
  it('should get all metrics', async () => {
    const cb1 = registry.getCircuitBreaker('service1');
    const cb2 = registry.getCircuitBreaker('service2');
    
    const operation = jest.fn<AsyncFn<string>>().mockResolvedValue('success');
    await cb1.execute(operation);
    await cb2.execute(operation);
    
    const allMetrics = registry.getAllMetrics();
    
    expect(allMetrics).toHaveProperty('service1');
    expect(allMetrics).toHaveProperty('service2');
    expect(allMetrics.service1.totalRequests).toBe(1);
    expect(allMetrics.service2.totalRequests).toBe(1);
  });
  
  it('should remove circuit breakers', () => {
    registry.getCircuitBreaker('service1');
    
    expect(registry.getNames()).toContain('service1');
    
    const removed = registry.remove('service1');
    expect(removed).toBe(true);
    expect(registry.getNames()).not.toContain('service1');
    
    const removedAgain = registry.remove('service1');
    expect(removedAgain).toBe(false);
  });
  
  it('should reset all circuit breakers', async () => {
    const cb1 = registry.getCircuitBreaker('service1');
    const cb2 = registry.getCircuitBreaker('service2');
    
    const operation = jest.fn<AsyncFn<string>>().mockResolvedValue('success');
    await cb1.execute(operation);
    await cb2.execute(operation);
    
    registry.resetAll();
    
    const allMetrics = registry.getAllMetrics();
    expect(allMetrics.service1.totalRequests).toBe(0);
    expect(allMetrics.service2.totalRequests).toBe(0);
  });
});

describe('WithCircuitBreaker decorator', () => {
  beforeEach(() => {
    const registry = CircuitBreakerRegistry.getInstance();
    registry.resetAll();
  });
  
  it('should apply circuit breaker protection via decorator pattern', async () => {
    class TestService {
      public attempts = 0;
      
      async unreliableMethod(): Promise<string> {
        this.attempts++;
        if (this.attempts < 3) {
          throw new NetworkError('Service unavailable');
        }
        return 'success';
      }
    }
    
    // Apply decorator pattern manually to avoid TS compilation issues in tests
    const service = new TestService();
    const originalMethod = service.unreliableMethod;
    const registry = CircuitBreakerRegistry.getInstance();
    const circuitBreaker = registry.getCircuitBreaker('test-decorator', { failureThreshold: 2 });
    
    // Replace method with circuit breaker protected version
    service.unreliableMethod = async function(this: TestService) {
      return circuitBreaker.executeOrThrow(() => originalMethod.call(this));
    };
    
    // Should fail twice, then circuit opens
    await expect(service.unreliableMethod()).rejects.toThrow(NetworkError);
    expect(service.attempts).toBe(1);
    
    await expect(service.unreliableMethod()).rejects.toThrow(NetworkError);
    expect(service.attempts).toBe(2);
    
    // Circuit should be open now
    await expect(service.unreliableMethod()).rejects.toThrow('Circuit breaker is open');
    expect(service.attempts).toBe(2); // Should not execute the third time
  });
  
  it('should work with successful operations via decorator', async () => {
    class TestService {
      async reliableMethod(): Promise<string> {
        return 'reliable';
      }
    }
    
    const service = new TestService();
    const originalMethod = service.reliableMethod;
    const registry = CircuitBreakerRegistry.getInstance();
    const circuitBreaker = registry.getCircuitBreaker('test-decorator-2');
    
    // Apply circuit breaker protection
    service.reliableMethod = async function(this: TestService) {
      return circuitBreaker.executeOrThrow(() => originalMethod.call(this));
    };
    
    const result = await service.reliableMethod();
    expect(result).toBe('reliable');
  });
});

describe('withCircuitBreaker utility function', () => {
  beforeEach(() => {
    const registry = CircuitBreakerRegistry.getInstance();
    registry.resetAll();
  });
  
  it('should wrap operations with circuit breaker protection', async () => {
    let attempts = 0;
    const operation = async () => {
      attempts++;
      if (attempts < 3) {
        throw new NetworkError('Service unavailable');
      }
      return 'success';
    };
    
    // Should fail twice
    await expect(withCircuitBreaker('test-utility', operation, { failureThreshold: 2 }))
      .rejects.toThrow(NetworkError);
    
    await expect(withCircuitBreaker('test-utility', operation, { failureThreshold: 2 }))
      .rejects.toThrow(NetworkError);
    
    // Circuit should be open now
    await expect(withCircuitBreaker('test-utility', operation, { failureThreshold: 2 }))
      .rejects.toThrow('Circuit breaker is open');
    
    expect(attempts).toBe(2);
  });
  
  it('should return successful results', async () => {
    const operation = async () => 'success';
    
    const result = await withCircuitBreaker('test-utility-success', operation);
    expect(result).toBe('success');
  });
});

describe('Real-world scenarios', () => {
  it('should handle intermittent service failures', async () => {
    jest.useFakeTimers();
    
    const circuitBreaker = new CircuitBreaker('intermittent-service', {
      failureThreshold: 3,
      successThreshold: 2,
      openTimeout: 5000,
      minimumCooldown: 0
    });
    
    let callCount = 0;
    const intermittentService = jest.fn<AsyncFn<string>>().mockImplementation(async () => {
      callCount++;
      if (callCount <= 3) {
        throw new NetworkError('Service temporarily unavailable');
      }
      return 'recovered';
    });
    
    // Fail 3 times to open circuit
    for (let i = 0; i < 3; i++) {
      const result = await circuitBreaker.execute(intermittentService);
      expect(result.success).toBe(false);
    }
    
    expect(circuitBreaker.getCurrentState()).toBe(CircuitBreakerState.OPEN);
    
    // Blocked requests
    const blockedResult = await circuitBreaker.execute(intermittentService);
    expect(blockedResult.executed).toBe(false);
    
    // Wait for half-open
    jest.advanceTimersByTime(5000);
    expect(circuitBreaker.getCurrentState()).toBe(CircuitBreakerState.HALF_OPEN);
    
    // Service recovers
    const recoveryResult1 = await circuitBreaker.execute(intermittentService);
    expect(recoveryResult1.success).toBe(true);
    expect(circuitBreaker.getCurrentState()).toBe(CircuitBreakerState.HALF_OPEN);
    
    const recoveryResult2 = await circuitBreaker.execute(intermittentService);
    expect(recoveryResult2.success).toBe(true);
    expect(circuitBreaker.getCurrentState()).toBe(CircuitBreakerState.CLOSED);
    
    circuitBreaker.reset();
  });
  
  it('should handle different error types appropriately', async () => {
    const circuitBreaker = new CircuitBreaker('error-types-service', {
      failureThreshold: 3,
      isFailure: (error) => !(error instanceof ValidationError) // Don't count validation errors
    });
    
    // Validation errors should not trigger circuit breaker
    const validationOp = jest.fn<AsyncFn<string>>().mockRejectedValue(new ValidationError('Invalid'));
    
    for (let i = 0; i < 5; i++) {
      await circuitBreaker.execute(validationOp);
    }
    
    expect(circuitBreaker.getCurrentState()).toBe(CircuitBreakerState.CLOSED);
    
    // Network errors should trigger circuit breaker
    const networkOp = jest.fn<AsyncFn<string>>().mockRejectedValue(new NetworkError('Failed'));
    
    for (let i = 0; i < 3; i++) {
      await circuitBreaker.execute(networkOp);
    }
    
    expect(circuitBreaker.getCurrentState()).toBe(CircuitBreakerState.OPEN);
    
    circuitBreaker.reset();
  });
});