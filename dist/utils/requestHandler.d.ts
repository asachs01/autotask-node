import { AxiosInstance, AxiosResponse } from 'axios';
import winston from 'winston';
import { PerformanceMonitor } from './performanceMonitor';
import { RetryOptions } from '../errors/RetryStrategy';
import { CircuitBreakerOptions } from '../errors/CircuitBreaker';
import { ErrorLogger } from '../errors/ErrorLogger';
export interface RequestOptions {
    retries?: number;
    baseDelay?: number;
    timeout?: number;
    enableRequestLogging?: boolean;
    enableResponseLogging?: boolean;
    requestId?: string;
    enablePerformanceMonitoring?: boolean;
    retryStrategy?: RetryOptions;
    useAdvancedRetry?: boolean;
    circuitBreaker?: CircuitBreakerOptions;
    enableCircuitBreaker?: boolean;
    circuitBreakerName?: string;
}
export interface RequestContext {
    requestId: string;
    endpoint: string;
    method: string;
    startTime: number;
    attempt: number;
}
/**
 * Enhanced request handler with structured error handling, retry logic, and logging
 */
export declare class RequestHandler {
    private axios;
    private logger;
    private globalOptions;
    private defaultOptions;
    private performanceMonitor;
    private retryStrategy;
    private circuitBreakerRegistry;
    private errorLogger;
    constructor(axios: AxiosInstance, logger: winston.Logger, globalOptions?: Partial<RequestOptions>, errorLogger?: ErrorLogger);
    /**
     * Setup axios interceptors for request/response logging and timeout handling
     */
    private setupAxiosInterceptors;
    /**
     * Execute a request with enterprise-grade reliability patterns
     */
    executeRequest<T>(requestFn: () => Promise<AxiosResponse<T>>, endpoint: string, method: string, options?: RequestOptions): Promise<AxiosResponse<T>>;
    /**
     * Execute request with advanced retry strategy and circuit breaker
     */
    private executeWithAdvancedRetry;
    /**
     * Execute request with legacy retry logic (for backward compatibility)
     */
    private executeWithLegacyRetry;
    /**
     * Handle and classify errors
     */
    private handleError;
    /**
     * Log request details
     */
    private logRequest;
    /**
     * Log response details
     */
    private logResponse;
    /**
     * Log error details
     */
    private logError;
    /**
     * Sleep for specified milliseconds
     */
    private sleep;
    /**
     * Get performance monitor instance
     */
    getPerformanceMonitor(): PerformanceMonitor;
    /**
     * Get current performance metrics
     */
    getPerformanceMetrics(): import("./performanceMonitor").PerformanceMetrics;
    /**
     * Get detailed performance report
     */
    getPerformanceReport(): {
        metrics: import("./performanceMonitor").PerformanceMetrics;
        recentTimings: import("./performanceMonitor").RequestTiming[];
        percentiles: {
            p50: number;
            p90: number;
            p95: number;
            p99: number;
        };
        endpointStats: Record<string, {
            count: number;
            averageTime: number;
            errorCount: number;
            errorRate: number;
        }>;
    };
    /**
     * Reset performance metrics
     */
    resetPerformanceMetrics(): void;
    /**
     * Log performance summary
     */
    logPerformanceSummary(): void;
    /**
     * Update global options for all requests
     */
    updateGlobalOptions(options: Partial<RequestOptions>): void;
    /**
     * Get current global options
     */
    getGlobalOptions(): Partial<RequestOptions>;
    /**
     * Get circuit breaker metrics for all endpoints
     */
    getCircuitBreakerMetrics(): Record<string, import("../errors/CircuitBreaker").CircuitBreakerMetrics>;
    /**
     * Get circuit breaker metrics for a specific endpoint
     */
    getCircuitBreakerMetricsForEndpoint(endpoint: string, method: string): import("../errors/CircuitBreaker").CircuitBreakerMetrics;
    /**
     * Reset circuit breaker for a specific endpoint
     */
    resetCircuitBreakerForEndpoint(endpoint: string, method: string): void;
    /**
     * Reset all circuit breakers
     */
    resetAllCircuitBreakers(): void;
    /**
     * Update retry strategy configuration
     */
    updateRetryStrategy(options: Partial<RetryOptions>): void;
    /**
     * Get comprehensive health status including circuit breakers
     */
    getHealthStatus(): {
        timestamp: string;
        status: string;
        circuitBreakers: {
            total: number;
            healthy: number;
            open: number;
            halfOpen: number;
            metrics: Record<string, import("../errors/CircuitBreaker").CircuitBreakerMetrics>;
        };
        performance: import("./performanceMonitor").PerformanceMetrics;
        features: {
            advancedRetry: boolean;
            circuitBreaker: boolean;
            performanceMonitoring: boolean;
        };
    };
    /**
     * Configure endpoint-specific circuit breaker
     */
    configureCircuitBreakerForEndpoint(endpoint: string, method: string, options: CircuitBreakerOptions): void;
}
//# sourceMappingURL=requestHandler.d.ts.map