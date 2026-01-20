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
import { EventEmitter } from 'events';
import winston from 'winston';
import { AutotaskError } from '../utils/errors';
export interface RetryConfig {
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
    jitterFactor: number;
    backoffMultiplier: number;
    resetTimeoutMs: number;
    circuitBreakerThreshold: number;
    circuitBreakerWindowMs: number;
    circuitBreakerRecoveryMs: number;
    enableRequestReplay: boolean;
    replayQueueSize: number;
    replayTimeoutMs: number;
    enableErrorLearning: boolean;
    enablePredictiveRetries: boolean;
    dedupeConcurrentRequests: boolean;
}
export interface RetryAttempt {
    attemptNumber: number;
    timestamp: Date;
    error: AutotaskError;
    delayMs: number;
    wasSuccessful: boolean;
}
export interface CircuitBreakerState {
    endpoint: string;
    state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    failureCount: number;
    successCount: number;
    lastFailureTime: Date | null;
    lastSuccessTime: Date | null;
    failures: AutotaskError[];
    nextAttemptTime: Date | null;
}
export interface ReplayableRequest {
    id: string;
    endpoint: string;
    method: string;
    data: any;
    headers: Record<string, string>;
    timestamp: Date;
    priority: number;
    maxRetries: number;
    currentRetries: number;
    lastError?: AutotaskError;
}
export interface RetryMetrics {
    totalRetries: number;
    successfulRetries: number;
    failedRetries: number;
    averageRetryDelay: number;
    circuitBreakerActivations: number;
    replayedRequests: number;
    endpointStats: Map<string, {
        totalRequests: number;
        failedRequests: number;
        averageRetryCount: number;
        circuitState: CircuitBreakerState['state'];
    }>;
    errorPatterns: Map<string, number>;
}
/**
 * Advanced retry pattern implementation for Autotask APIs
 */
export declare class AutotaskRetryPatterns extends EventEmitter {
    private config;
    private logger;
    private circuitBreakers;
    private replayQueue;
    private pendingRequests;
    private errorHistory;
    private retryHistory;
    private metrics;
    private metricsInterval?;
    constructor(config: Partial<RetryConfig>, logger: winston.Logger);
    /**
     * Execute a request with advanced retry patterns
     */
    executeWithRetry<T>(requestFn: () => Promise<T>, endpoint: string, method?: string, requestData?: any, headers?: Record<string, string>): Promise<T>;
    /**
     * Add request to replay queue for later execution
     */
    addToReplayQueue(endpoint: string, method: string, data: any, headers?: Record<string, string>, priority?: number): string;
    /**
     * Get recommended retry delay based on error type and history
     */
    getRetryDelay(error: AutotaskError, attemptNumber: number, endpoint: string): number;
    /**
     * Get circuit breaker state for endpoint
     */
    getCircuitBreakerState(endpoint: string): CircuitBreakerState;
    /**
     * Check if error should trigger circuit breaker
     */
    shouldTriggerCircuitBreaker(error: AutotaskError): boolean;
    /**
     * Process replay queue
     */
    processReplayQueue(): Promise<void>;
    /**
     * Get current metrics
     */
    getMetrics(): RetryMetrics;
    /**
     * Reset circuit breaker for endpoint
     */
    resetCircuitBreaker(endpoint: string): void;
    /**
     * Execute request with circuit breaker protection
     */
    private executeRequestWithCircuitBreaker;
    /**
     * Record successful request
     */
    private recordSuccess;
    /**
     * Record failed request
     */
    private recordError;
    /**
     * Update circuit breaker state
     */
    private updateCircuitBreakerState;
    /**
     * Determine if request should be retried
     */
    private shouldRetry;
    /**
     * Determine if request should be added to replay queue
     */
    private shouldReplay;
    /**
     * Get learning adjustment for retry delay
     */
    private getLearningAdjustment;
    /**
     * Remove request from replay queue
     */
    private removeFromReplayQueue;
    /**
     * Initialize metrics
     */
    private initializeMetrics;
    /**
     * Update metrics
     */
    private updateMetrics;
    /**
     * Start metrics collection
     */
    private startMetricsCollection;
    /**
     * Sleep utility
     */
    private sleep;
    /**
     * Cleanup and shutdown
     */
    destroy(): void;
}
//# sourceMappingURL=AutotaskRetryPatterns.d.ts.map