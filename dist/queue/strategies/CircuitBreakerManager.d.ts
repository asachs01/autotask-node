/**
 * Circuit Breaker Manager
 *
 * Advanced circuit breaker implementation with adaptive thresholds:
 * - Per-zone circuit breakers to isolate failures
 * - Exponential backoff with jitter
 * - Health monitoring and automatic recovery
 * - Failure pattern analysis and prediction
 * - Dynamic threshold adjustment based on system load
 */
import { EventEmitter } from 'events';
import winston from 'winston';
export interface CircuitBreakerConfig {
    enabled: boolean;
    failureThreshold: number;
    successThreshold: number;
    timeout: number;
}
export interface CircuitBreakerState {
    state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    failureCount: number;
    successCount: number;
    lastFailureTime?: Date;
    lastSuccessTime?: Date;
    nextRetryTime?: Date;
    totalRequests: number;
    totalFailures: number;
    totalSuccesses: number;
}
export interface CircuitBreakerMetrics {
    zone: string;
    state: CircuitBreakerState;
    failureRate: number;
    averageResponseTime: number;
    requestsPerSecond: number;
    lastStateChange: Date;
    timeInCurrentState: number;
    recoveryAttempts: number;
}
export declare class CircuitBreakerManager extends EventEmitter {
    private config;
    private logger;
    private breakers;
    private responseTimeHistory;
    private requestHistory;
    private stateChangeHistory;
    private adaptiveThresholds;
    private healthCheckInterval?;
    private monitoringEnabled;
    constructor(config: CircuitBreakerConfig, logger: winston.Logger);
    /**
     * Check if requests can be executed for a zone
     */
    canExecute(zone: string): boolean;
    /**
     * Record a successful request
     */
    recordSuccess(zone: string, responseTime?: number): void;
    /**
     * Record a failed request
     */
    recordFailure(zone: string, error?: Error, responseTime?: number): void;
    /**
     * Get circuit breaker metrics for a zone
     */
    getMetrics(zone: string): CircuitBreakerMetrics | null;
    /**
     * Get metrics for all zones
     */
    getAllMetrics(): CircuitBreakerMetrics[];
    /**
     * Manually open circuit breaker for a zone
     */
    forceOpen(zone: string, reason: string): void;
    /**
     * Manually close circuit breaker for a zone
     */
    forceClose(zone: string, reason: string): void;
    /**
     * Reset circuit breaker for a zone
     */
    reset(zone: string): void;
    /**
     * Get current state for all zones
     */
    getStates(): Map<string, CircuitBreakerState>;
    /**
     * Enable or disable monitoring
     */
    setMonitoring(enabled: boolean): void;
    /**
     * Shutdown circuit breaker manager
     */
    shutdown(): void;
    /**
     * Get or create circuit breaker for zone
     */
    private getOrCreateBreaker;
    /**
     * Transition to OPEN state
     */
    private transitionToOpen;
    /**
     * Transition to HALF_OPEN state
     */
    private transitionToHalfOpen;
    /**
     * Transition to CLOSED state
     */
    private transitionToClosed;
    /**
     * Update retry time with exponential backoff
     */
    private updateRetryTime;
    /**
     * Record response time for adaptive monitoring
     */
    private recordResponseTime;
    /**
     * Record request history for analytics
     */
    private recordRequestHistory;
    /**
     * Record state change for analysis
     */
    private recordStateChange;
    /**
     * Get recent request history
     */
    private getRecentRequestHistory;
    /**
     * Calculate average response time
     */
    private calculateAverageResponseTime;
    /**
     * Calculate requests per second
     */
    private calculateRequestsPerSecond;
    /**
     * Get adaptive failure threshold
     */
    private getAdaptiveFailureThreshold;
    /**
     * Get adaptive success threshold
     */
    private getAdaptiveSuccessThreshold;
    /**
     * Update adaptive thresholds based on system behavior
     */
    private updateAdaptiveThresholds;
    /**
     * Start health monitoring
     */
    private startHealthMonitoring;
    /**
     * Perform health checks on all circuit breakers
     */
    private performHealthChecks;
    /**
     * Clean up old data to prevent memory leaks
     */
    private cleanupOldData;
}
//# sourceMappingURL=CircuitBreakerManager.d.ts.map