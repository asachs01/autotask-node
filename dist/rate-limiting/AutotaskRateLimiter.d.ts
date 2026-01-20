/**
 * Enterprise-grade Autotask Rate Limiting System
 *
 * Based on Autotask's official API documentation:
 * - 10,000 requests per hour per database (rolling window)
 * - Zone-specific threading limits (3 threads per endpoint for new integrations)
 * - Usage-based latency throttling as limits approach
 * - Thread limiting per API tracking identifier + endpoint
 *
 * This implementation provides:
 * - Multi-zone rate limiting with automatic detection
 * - Per-endpoint and global rate limiting
 * - Intelligent backoff based on API response patterns
 * - Queue management for high-throughput scenarios
 * - Performance monitoring and metrics
 */
import { EventEmitter } from 'events';
import winston from 'winston';
export interface RateLimitConfig {
    hourlyRequestLimit: number;
    threadLimitPerEndpoint: number;
    usageThresholds: {
        light: number;
        medium: number;
        heavy: number;
    };
    enableZoneAwareThrottling: boolean;
    enablePredictiveThrottling: boolean;
    queueTimeout: number;
    maxQueueSize: number;
    slidingWindowSize: number;
    metricsRetentionPeriod: number;
}
export interface ZoneInfo {
    zoneId: string;
    apiUrl: string;
    isHealthy: boolean;
    lastHealthCheck: Date;
    requestCount: number;
    threadCount: Map<string, number>;
    averageResponseTime: number;
    errorRate: number;
}
export interface RateLimitMetrics {
    totalRequests: number;
    requestsInCurrentHour: number;
    currentUsagePercentage: number;
    averageWaitTime: number;
    queueLength: number;
    throttledRequests: number;
    zoneMetrics: Map<string, ZoneInfo>;
    endpointMetrics: Map<string, {
        requests: number;
        errors: number;
        averageResponseTime: number;
        activeThreads: number;
    }>;
}
export interface QueuedRequest {
    id: string;
    zone: string;
    endpoint: string;
    priority: number;
    enqueuedAt: Date;
    resolve: (value: boolean) => void;
    reject: (error: Error) => void;
    timeout?: ReturnType<typeof setTimeout>;
}
/**
 * Advanced rate limiter specifically designed for Autotask API patterns
 */
export declare class AutotaskRateLimiter extends EventEmitter {
    private config;
    private logger;
    private requestHistory;
    private zoneInfo;
    private endpointThreads;
    private requestQueue;
    private isProcessingQueue;
    private metrics;
    private metricsUpdateInterval?;
    constructor(config: Partial<RateLimitConfig>, logger: winston.Logger);
    /**
     * Request permission to make an API call
     * Returns a promise that resolves when the request can proceed
     */
    requestPermission(zone: string, endpoint: string, priority?: number): Promise<void>;
    /**
     * Notify that a request has completed
     */
    notifyRequestComplete(zone: string, endpoint: string, statusCode?: number, responseTime?: number, error?: boolean): void;
    /**
     * Register a new zone for rate limiting
     */
    registerZone(zoneId: string, apiUrl: string): void;
    /**
     * Update zone health status
     */
    updateZoneHealth(zoneId: string, isHealthy: boolean, errorRate?: number): void;
    /**
     * Get current rate limit metrics
     */
    getMetrics(): RateLimitMetrics;
    /**
     * Get recommended delay before next request
     */
    getRecommendedDelay(zone: string, endpoint: string): number;
    /**
     * Check if request can proceed immediately without queuing
     */
    private canProceedImmediately;
    /**
     * Record the start of a new request
     */
    private recordRequestStart;
    /**
     * Process the request queue
     */
    private processQueue;
    /**
     * Remove request from queue
     */
    private removeFromQueue;
    /**
     * Get current usage as percentage of hourly limit
     */
    private getCurrentUsagePercentage;
    /**
     * Clean up old request history
     */
    private cleanupRequestHistory;
    /**
     * Initialize metrics object
     */
    private initializeMetrics;
    /**
     * Update metrics
     */
    private updateMetrics;
    /**
     * Start metrics collection interval
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
//# sourceMappingURL=AutotaskRateLimiter.d.ts.map