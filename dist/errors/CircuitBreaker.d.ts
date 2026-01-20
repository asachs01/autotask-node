/**
 * Circuit Breaker Pattern Implementation
 *
 * Prevents cascading failures by monitoring service health and temporarily
 * blocking requests to failing services, allowing them time to recover.
 */
import { EventEmitter } from 'events';
/**
 * Circuit breaker states
 */
export declare enum CircuitBreakerState {
    /** Normal operation - requests pass through */
    CLOSED = "closed",
    /** Service is failing - requests are blocked */
    OPEN = "open",
    /** Testing if service has recovered - limited requests allowed */
    HALF_OPEN = "half-open"
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
export declare class CircuitBreaker extends EventEmitter {
    private readonly name;
    private state;
    private readonly options;
    private totalRequests;
    private successCount;
    private failureCount;
    private rejectedCount;
    private stateTransitions;
    private totalResponseTime;
    private failures;
    private successes;
    private lastStateChange;
    private lastOpenTime?;
    private lastCloseTime?;
    private openTimeoutHandle?;
    constructor(name: string, options?: CircuitBreakerOptions);
    /**
     * Execute an operation with circuit breaker protection
     */
    execute<T>(operation: () => Promise<T>): Promise<CircuitBreakerResult<T>>;
    /**
     * Execute operation and throw on failure (simpler interface)
     */
    executeOrThrow<T>(operation: () => Promise<T>): Promise<T>;
    /**
     * Get current circuit breaker metrics
     */
    getMetrics(): CircuitBreakerMetrics;
    /**
     * Force circuit breaker to specific state (for testing)
     */
    forceState(state: CircuitBreakerState): void;
    /**
     * Reset circuit breaker to initial state
     */
    reset(): void;
    /**
     * Get current state
     */
    getCurrentState(): CircuitBreakerState;
    /**
     * Check if circuit breaker is healthy (closed state)
     */
    isHealthy(): boolean;
    /**
     * Record a successful operation
     */
    private recordSuccess;
    /**
     * Record a failed operation
     */
    private recordFailure;
    /**
     * Change circuit breaker state
     */
    private changeState;
    /**
     * Schedule transition to half-open state
     */
    private scheduleHalfOpenTransition;
    /**
     * Clear all timeouts
     */
    private clearTimeouts;
    /**
     * Clean old records outside monitoring period
     */
    private cleanOldRecords;
    /**
     * Calculate current failure rate
     */
    private calculateFailureRate;
    /**
     * Default failure detection logic
     */
    private defaultIsFailure;
}
/**
 * Circuit breaker registry for managing multiple circuit breakers
 */
export declare class CircuitBreakerRegistry {
    private static instance;
    private circuitBreakers;
    private constructor();
    static getInstance(): CircuitBreakerRegistry;
    /**
     * Get or create a circuit breaker
     */
    getCircuitBreaker(name: string, options?: CircuitBreakerOptions): CircuitBreaker;
    /**
     * Get all circuit breaker metrics
     */
    getAllMetrics(): Record<string, CircuitBreakerMetrics>;
    /**
     * Reset all circuit breakers
     */
    resetAll(): void;
    /**
     * Remove a circuit breaker
     */
    remove(name: string): boolean;
    /**
     * Get circuit breaker names
     */
    getNames(): string[];
}
/**
 * Decorator for adding circuit breaker protection to methods
 */
export declare function WithCircuitBreaker(name: string, options?: CircuitBreakerOptions): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * Utility function for wrapping operations with circuit breaker
 */
export declare function withCircuitBreaker<T>(name: string, operation: () => Promise<T>, options?: CircuitBreakerOptions): Promise<T>;
//# sourceMappingURL=CircuitBreaker.d.ts.map