"use strict";
/**
 * Circuit Breaker Pattern Implementation
 *
 * Prevents cascading failures by monitoring service health and temporarily
 * blocking requests to failing services, allowing them time to recover.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerRegistry = exports.CircuitBreaker = exports.CircuitBreakerState = void 0;
exports.WithCircuitBreaker = WithCircuitBreaker;
exports.withCircuitBreaker = withCircuitBreaker;
const AutotaskErrors_1 = require("./AutotaskErrors");
const events_1 = require("events");
/**
 * Circuit breaker states
 */
var CircuitBreakerState;
(function (CircuitBreakerState) {
    /** Normal operation - requests pass through */
    CircuitBreakerState["CLOSED"] = "closed";
    /** Service is failing - requests are blocked */
    CircuitBreakerState["OPEN"] = "open";
    /** Testing if service has recovered - limited requests allowed */
    CircuitBreakerState["HALF_OPEN"] = "half-open";
})(CircuitBreakerState || (exports.CircuitBreakerState = CircuitBreakerState = {}));
/**
 * Circuit breaker implementation with monitoring and recovery
 */
class CircuitBreaker extends events_1.EventEmitter {
    constructor(name, options = {}) {
        super();
        this.name = name;
        this.state = CircuitBreakerState.CLOSED;
        // Metrics tracking
        this.totalRequests = 0;
        this.successCount = 0;
        this.failureCount = 0;
        this.rejectedCount = 0;
        this.stateTransitions = 0;
        this.totalResponseTime = 0;
        // State management
        this.failures = [];
        this.successes = [];
        this.lastStateChange = 0;
        this.options = {
            failureThreshold: options.failureThreshold ?? 5,
            successThreshold: options.successThreshold ?? 3,
            monitoringPeriod: options.monitoringPeriod ?? 60000,
            openTimeout: options.openTimeout ?? 30000,
            minimumCooldown: options.minimumCooldown ?? 1000,
            isFailure: options.isFailure ?? this.defaultIsFailure.bind(this),
            onStateChange: options.onStateChange ?? (() => { }),
            onCircuitOpen: options.onCircuitOpen ?? (() => { })
        };
    }
    /**
     * Execute an operation with circuit breaker protection
     */
    async execute(operation) {
        const startTime = Date.now();
        this.totalRequests++;
        // Check if circuit is open
        if (this.state === CircuitBreakerState.OPEN) {
            this.rejectedCount++;
            const error = new AutotaskErrors_1.CircuitBreakerError(this.name, this.state, this.failures.length, this.lastOpenTime, new Date(Date.now() + this.options.openTimeout), { circuitBreakerName: this.name });
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
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            this.totalResponseTime += executionTime;
            const err = error;
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
    async executeOrThrow(operation) {
        const result = await this.execute(operation);
        if (!result.success) {
            throw result.error || new Error('Circuit breaker execution failed');
        }
        return result.data;
    }
    /**
     * Get current circuit breaker metrics
     */
    getMetrics() {
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
    forceState(state) {
        this.changeState(state);
    }
    /**
     * Reset circuit breaker to initial state
     */
    reset() {
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
    getCurrentState() {
        return this.state;
    }
    /**
     * Check if circuit breaker is healthy (closed state)
     */
    isHealthy() {
        return this.state === CircuitBreakerState.CLOSED;
    }
    /**
     * Record a successful operation
     */
    recordSuccess() {
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
    recordFailure(error) {
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
        }
        else if (this.state === CircuitBreakerState.HALF_OPEN) {
            // Any failure in half-open state opens the circuit
            this.changeState(CircuitBreakerState.OPEN, error);
        }
    }
    /**
     * Change circuit breaker state
     */
    changeState(newState, error) {
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
    scheduleHalfOpenTransition() {
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
    clearTimeouts() {
        if (this.openTimeoutHandle) {
            clearTimeout(this.openTimeoutHandle);
            this.openTimeoutHandle = undefined;
        }
    }
    /**
     * Clean old records outside monitoring period
     */
    cleanOldRecords(records, now) {
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
    calculateFailureRate() {
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
    defaultIsFailure(error) {
        // Use existing error classification
        return AutotaskErrors_1.ErrorFactory.isRetryable(error);
    }
}
exports.CircuitBreaker = CircuitBreaker;
/**
 * Circuit breaker registry for managing multiple circuit breakers
 */
class CircuitBreakerRegistry {
    constructor() {
        this.circuitBreakers = new Map();
    }
    static getInstance() {
        if (!CircuitBreakerRegistry.instance) {
            CircuitBreakerRegistry.instance = new CircuitBreakerRegistry();
        }
        return CircuitBreakerRegistry.instance;
    }
    /**
     * Get or create a circuit breaker
     */
    getCircuitBreaker(name, options) {
        if (!this.circuitBreakers.has(name)) {
            this.circuitBreakers.set(name, new CircuitBreaker(name, options));
        }
        return this.circuitBreakers.get(name);
    }
    /**
     * Get all circuit breaker metrics
     */
    getAllMetrics() {
        const metrics = {};
        this.circuitBreakers.forEach((cb, name) => {
            metrics[name] = cb.getMetrics();
        });
        return metrics;
    }
    /**
     * Reset all circuit breakers
     */
    resetAll() {
        this.circuitBreakers.forEach(cb => cb.reset());
    }
    /**
     * Remove a circuit breaker
     */
    remove(name) {
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
    getNames() {
        return Array.from(this.circuitBreakers.keys());
    }
}
exports.CircuitBreakerRegistry = CircuitBreakerRegistry;
/**
 * Decorator for adding circuit breaker protection to methods
 */
function WithCircuitBreaker(name, options) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        const registry = CircuitBreakerRegistry.getInstance();
        descriptor.value = async function (...args) {
            const circuitBreaker = registry.getCircuitBreaker(name, options);
            return circuitBreaker.executeOrThrow(() => originalMethod.apply(this, args));
        };
        return descriptor;
    };
}
/**
 * Utility function for wrapping operations with circuit breaker
 */
function withCircuitBreaker(name, operation, options) {
    const registry = CircuitBreakerRegistry.getInstance();
    const circuitBreaker = registry.getCircuitBreaker(name, options);
    return circuitBreaker.executeOrThrow(operation);
}
//# sourceMappingURL=CircuitBreaker.js.map