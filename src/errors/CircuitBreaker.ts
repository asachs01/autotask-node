/**
 * Circuit Breaker Pattern Implementation
 * 
 * Prevents cascading failures by monitoring service health and temporarily
 * blocking requests to failing services, allowing them time to recover.
 */

import { CircuitBreakerError, ErrorFactory } from './AutotaskErrors';
import { EventEmitter } from 'events';

/**
 * Circuit breaker states
 */
export enum CircuitBreakerState {
  /** Normal operation - requests pass through */
  CLOSED = 'closed',
  /** Service is failing - requests are blocked */
  OPEN = 'open',
  /** Testing if service has recovered - limited requests allowed */
  HALF_OPEN = 'half-open'
}

/**
 * Configuration options for circuit breaker behavior
 */
export interface CircuitBreakerOptions {
  /** Number of failures required to open the circuit (default: 5) */
  failureThreshold?: number;
  
  /** Number of successes required to close the circuit when half-open (default: 3) */
  successThreshold?: number;
  
  /** Time window for counting failures in milliseconds (default: 60000) */
  monitoringPeriod?: number;
  
  /** Time to wait before attempting recovery in milliseconds (default: 30000) */
  openTimeout?: number;
  
  /** Minimum time between state changes in milliseconds (default: 1000) */
  minimumCooldown?: number;
  
  /** Function to determine if error should count as failure */
  isFailure?: (error: Error) => boolean;
  
  /** Function called when circuit breaker state changes */
  onStateChange?: (state: CircuitBreakerState, error?: Error) => void;
  
  /** Function called when request is rejected due to open circuit */
  onCircuitOpen?: (error: Error) => void;
}

/**
 * Result of a circuit breaker operation
 */
export interface CircuitBreakerResult<T> {
  /** Whether the operation succeeded */
  success: boolean;
  
  /** Result data if successful */
  data?: T;
  
  /** Error if failed */
  error?: Error;
  
  /** Current circuit breaker state */
  state: CircuitBreakerState;
  
  /** Execution time in milliseconds */
  executionTime: number;
  
  /** Whether the operation was executed or blocked */
  executed: boolean;
}

/**
 * Circuit breaker metrics
 */
export interface CircuitBreakerMetrics {
  /** Current state */
  state: CircuitBreakerState;
  
  /** Total number of requests processed */
  totalRequests: number;
  
  /** Number of successful requests */
  successCount: number;
  
  /** Number of failed requests */
  failureCount: number;
  
  /** Number of requests blocked by open circuit */
  rejectedCount: number;
  
  /** Current failure rate (0-1) */
  failureRate: number;
  
  /** Time when circuit was last opened */
  lastOpenTime?: Date;
  
  /** Time when circuit was last closed */
  lastCloseTime?: Date;
  
  /** Number of state transitions */
  stateTransitions: number;
  
  /** Average response time in milliseconds */
  averageResponseTime: number;
}

/**
 * Circuit breaker implementation with monitoring and recovery
 */
export class CircuitBreaker extends EventEmitter {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private readonly options: Required<CircuitBreakerOptions>;
  
  // Metrics tracking
  private totalRequests = 0;
  private successCount = 0;
  private failureCount = 0;
  private rejectedCount = 0;
  private stateTransitions = 0;
  private totalResponseTime = 0;
  
  // State management
  private failures: Array<{ timestamp: number; error: Error }> = [];
  private successes: Array<{ timestamp: number }> = [];
  private lastStateChange = 0;
  private lastOpenTime?: Date;
  private lastCloseTime?: Date;
  private openTimeoutHandle?: any;
  
  constructor(
    private readonly name: string,
    options: CircuitBreakerOptions = {}
  ) {
    super();
    
    this.options = {
      failureThreshold: options.failureThreshold ?? 5,
      successThreshold: options.successThreshold ?? 3,
      monitoringPeriod: options.monitoringPeriod ?? 60000,
      openTimeout: options.openTimeout ?? 30000,
      minimumCooldown: options.minimumCooldown ?? 1000,
      isFailure: options.isFailure ?? this.defaultIsFailure.bind(this),
      onStateChange: options.onStateChange ?? (() => {}),
      onCircuitOpen: options.onCircuitOpen ?? (() => {})
    };
  }
  
  /**
   * Execute an operation with circuit breaker protection
   */
  async execute<T>(operation: () => Promise<T>): Promise<CircuitBreakerResult<T>> {
    const startTime = Date.now();
    this.totalRequests++;
    
    // Check if circuit is open
    if (this.state === CircuitBreakerState.OPEN) {
      this.rejectedCount++;
      const error = new CircuitBreakerError(
        this.name,
        this.state as 'open' | 'half-open',
        this.failures.length,
        this.lastOpenTime,
        new Date(Date.now() + this.options.openTimeout),
        { circuitBreakerName: this.name }
      );
      
      this.options.onCircuitOpen(error);
      
      return {
        success: false,
        error,
        state: this.state,
        executionTime: Date.now() - startTime,
        executed: false
      };
    }
    
    try {
      // Execute the operation
      const data = await operation();
      const executionTime = Date.now() - startTime;
      this.totalResponseTime += executionTime;
      
      // Record success
      this.recordSuccess();
      
      return {
        success: true,
        data,
        state: this.state,
        executionTime,
        executed: true
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.totalResponseTime += executionTime;
      
      const err = error as Error;
      
      // Check if this error should count as failure
      if (this.options.isFailure(err)) {
        this.recordFailure(err);
      }
      
      return {
        success: false,
        error: err,
        state: this.state,
        executionTime,
        executed: true
      };
    }
  }
  
  /**
   * Execute operation and throw on failure (simpler interface)
   */
  async executeOrThrow<T>(operation: () => Promise<T>): Promise<T> {
    const result = await this.execute(operation);
    
    if (!result.success) {
      throw result.error || new Error('Circuit breaker execution failed');
    }
    
    return result.data!;
  }
  
  /**
   * Get current circuit breaker metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      totalRequests: this.totalRequests,
      successCount: this.successCount,
      failureCount: this.failureCount,
      rejectedCount: this.rejectedCount,
      failureRate: this.calculateFailureRate(),
      lastOpenTime: this.lastOpenTime,
      lastCloseTime: this.lastCloseTime,
      stateTransitions: this.stateTransitions,
      averageResponseTime: this.totalRequests > 0 ? this.totalResponseTime / this.totalRequests : 0
    };
  }
  
  /**
   * Force circuit breaker to specific state (for testing)
   */
  forceState(state: CircuitBreakerState): void {
    this.changeState(state);
  }
  
  /**
   * Reset circuit breaker to initial state
   */
  reset(): void {
    this.clearTimeouts();
    this.state = CircuitBreakerState.CLOSED;
    this.failures = [];
    this.successes = [];
    this.totalRequests = 0;
    this.successCount = 0;
    this.failureCount = 0;
    this.rejectedCount = 0;
    this.stateTransitions = 0;
    this.totalResponseTime = 0;
    this.lastStateChange = 0;
    this.lastOpenTime = undefined;
    this.lastCloseTime = undefined;
  }
  
  /**
   * Get current state
   */
  getCurrentState(): CircuitBreakerState {
    return this.state;
  }
  
  /**
   * Check if circuit breaker is healthy (closed state)
   */
  isHealthy(): boolean {
    return this.state === CircuitBreakerState.CLOSED;
  }
  
  /**
   * Record a successful operation
   */
  private recordSuccess(): void {
    const now = Date.now();
    this.successCount++;
    this.successes.push({ timestamp: now });
    
    // Clean old successes
    this.cleanOldRecords(this.successes, now);
    
    // Check for state transitions
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      const recentSuccesses = this.successes.length;
      if (recentSuccesses >= this.options.successThreshold) {
        this.changeState(CircuitBreakerState.CLOSED);
      }
    }
  }
  
  /**
   * Record a failed operation
   */
  private recordFailure(error: Error): void {
    const now = Date.now();
    this.failureCount++;
    this.failures.push({ timestamp: now, error });
    
    // Clean old failures
    this.cleanOldRecords(this.failures, now);
    
    // Check for state transitions
    const recentFailures = this.failures.length;
    
    if (this.state === CircuitBreakerState.CLOSED) {
      if (recentFailures >= this.options.failureThreshold) {
        this.changeState(CircuitBreakerState.OPEN, error);
      }
    } else if (this.state === CircuitBreakerState.HALF_OPEN) {
      // Any failure in half-open state opens the circuit
      this.changeState(CircuitBreakerState.OPEN, error);
    }
  }
  
  /**
   * Change circuit breaker state
   */
  private changeState(newState: CircuitBreakerState, error?: Error): void {
    const now = Date.now();
    
    // Respect minimum cooldown period
    if (now - this.lastStateChange < this.options.minimumCooldown) {
      return;
    }
    
    const oldState = this.state;
    this.state = newState;
    this.lastStateChange = now;
    this.stateTransitions++;
    
    // Handle state-specific logic
    switch (newState) {
      case CircuitBreakerState.OPEN:
        this.lastOpenTime = new Date();
        this.scheduleHalfOpenTransition();
        break;
        
      case CircuitBreakerState.CLOSED:
        this.lastCloseTime = new Date();
        this.clearTimeouts();
        // Reset failure tracking when circuit closes
        this.failures = [];
        break;
        
      case CircuitBreakerState.HALF_OPEN:
        this.clearTimeouts();
        // Reset success tracking when entering half-open
        this.successes = [];
        break;
    }
    
    // Emit events
    this.emit('stateChange', { from: oldState, to: newState, error });
    this.options.onStateChange(newState, error);
  }
  
  /**
   * Schedule transition to half-open state
   */
  private scheduleHalfOpenTransition(): void {
    this.clearTimeouts();
    
    this.openTimeoutHandle = setTimeout(() => {
      if (this.state === CircuitBreakerState.OPEN) {
        this.changeState(CircuitBreakerState.HALF_OPEN);
      }
    }, this.options.openTimeout);
  }
  
  /**
   * Clear all timeouts
   */
  private clearTimeouts(): void {
    if (this.openTimeoutHandle) {
      clearTimeout(this.openTimeoutHandle);
      this.openTimeoutHandle = undefined;
    }
  }
  
  /**
   * Clean old records outside monitoring period
   */
  private cleanOldRecords(records: Array<{ timestamp: number }>, now: number): void {
    const cutoff = now - this.options.monitoringPeriod;
    let index = 0;
    while (index < records.length && records[index].timestamp < cutoff) {
      index++;
    }
    if (index > 0) {
      records.splice(0, index);
    }
  }
  
  /**
   * Calculate current failure rate
   */
  private calculateFailureRate(): number {
    const now = Date.now();
    const cutoff = now - this.options.monitoringPeriod;
    
    const recentFailures = this.failures.filter(f => f.timestamp >= cutoff).length;
    const recentSuccesses = this.successes.filter(s => s.timestamp >= cutoff).length;
    const total = recentFailures + recentSuccesses;
    
    return total > 0 ? recentFailures / total : 0;
  }
  
  /**
   * Default failure detection logic
   */
  private defaultIsFailure(error: Error): boolean {
    // Use existing error classification
    return ErrorFactory.isRetryable(error);
  }
}

/**
 * Circuit breaker registry for managing multiple circuit breakers
 */
export class CircuitBreakerRegistry {
  private static instance: CircuitBreakerRegistry;
  private circuitBreakers = new Map<string, CircuitBreaker>();
  
  private constructor() {}
  
  static getInstance(): CircuitBreakerRegistry {
    if (!CircuitBreakerRegistry.instance) {
      CircuitBreakerRegistry.instance = new CircuitBreakerRegistry();
    }
    return CircuitBreakerRegistry.instance;
  }
  
  /**
   * Get or create a circuit breaker
   */
  getCircuitBreaker(name: string, options?: CircuitBreakerOptions): CircuitBreaker {
    if (!this.circuitBreakers.has(name)) {
      this.circuitBreakers.set(name, new CircuitBreaker(name, options));
    }
    return this.circuitBreakers.get(name)!;
  }
  
  /**
   * Get all circuit breaker metrics
   */
  getAllMetrics(): Record<string, CircuitBreakerMetrics> {
    const metrics: Record<string, CircuitBreakerMetrics> = {};
    this.circuitBreakers.forEach((cb, name) => {
      metrics[name] = cb.getMetrics();
    });
    return metrics;
  }
  
  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    this.circuitBreakers.forEach(cb => cb.reset());
  }
  
  /**
   * Remove a circuit breaker
   */
  remove(name: string): boolean {
    const cb = this.circuitBreakers.get(name);
    if (cb) {
      cb.reset();
      return this.circuitBreakers.delete(name);
    }
    return false;
  }
  
  /**
   * Get circuit breaker names
   */
  getNames(): string[] {
    return Array.from(this.circuitBreakers.keys());
  }
}

/**
 * Decorator for adding circuit breaker protection to methods
 */
export function WithCircuitBreaker(
  name: string, 
  options?: CircuitBreakerOptions
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const registry = CircuitBreakerRegistry.getInstance();
    
    descriptor.value = async function (...args: any[]) {
      const circuitBreaker = registry.getCircuitBreaker(name, options);
      return circuitBreaker.executeOrThrow(
        () => originalMethod.apply(this, args)
      );
    };
    
    return descriptor;
  };
}

/**
 * Utility function for wrapping operations with circuit breaker
 */
export function withCircuitBreaker<T>(
  name: string,
  operation: () => Promise<T>,
  options?: CircuitBreakerOptions
): Promise<T> {
  const registry = CircuitBreakerRegistry.getInstance();
  const circuitBreaker = registry.getCircuitBreaker(name, options);
  return circuitBreaker.executeOrThrow(operation);
}