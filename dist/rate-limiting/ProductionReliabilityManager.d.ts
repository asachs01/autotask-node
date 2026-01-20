/**
 * Production Reliability Manager
 *
 * Enterprise-grade reliability system for Autotask SDK with:
 * - Advanced request queuing with priority management
 * - Graceful degradation during API outages
 * - Automatic request replay and reconciliation
 * - Health monitoring and availability checks
 * - Circuit breaker patterns with automatic recovery
 * - Performance optimization and resource management
 *
 * Features:
 * - Multi-tier priority queue system
 * - Intelligent load shedding under stress
 * - Request deduplication and batching
 * - Comprehensive monitoring and alerting
 * - Automatic failover and recovery mechanisms
 */
import { EventEmitter } from 'events';
import winston from 'winston';
import { AutotaskRateLimiter } from './AutotaskRateLimiter';
import { AutotaskRetryPatterns } from './AutotaskRetryPatterns';
import { ZoneManager } from './ZoneManager';
import { AutotaskErrorHandler } from './AutotaskErrorHandler';
export interface ReliabilityConfig {
    maxQueueSize: number;
    queueTimeoutMs: number;
    enablePriorityQueuing: boolean;
    batchingEnabled: boolean;
    batchSize: number;
    batchTimeoutMs: number;
    healthCheckInterval: number;
    healthCheckTimeout: number;
    unhealthyThreshold: number;
    recoveryThreshold: number;
    enableGracefulDegradation: boolean;
    degradationThresholds: {
        queueUtilization: number;
        errorRate: number;
        responseTime: number;
    };
    enableLoadShedding: boolean;
    loadSheddingThreshold: number;
    criticalEndpoints: string[];
    enableReconciliation: boolean;
    reconciliationInterval: number;
    maxReconciliationAge: number;
}
export interface QueuedRequestGroup {
    id: string;
    priority: number;
    requests: QueuedRequest[];
    createdAt: Date;
    batchable: boolean;
    endpoint: string;
    zone: string;
    retryCount: number;
    maxRetries: number;
}
export interface QueuedRequest {
    id: string;
    groupId?: string;
    endpoint: string;
    method: string;
    zone: string;
    priority: number;
    data?: any;
    headers?: Record<string, string>;
    createdAt: Date;
    scheduledAt?: Date;
    timeout: number;
    retryable: boolean;
    metadata: Record<string, any>;
    resolve: (result: any) => void;
    reject: (error: Error) => void;
}
export interface SystemHealth {
    overall: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'UNAVAILABLE';
    zones: Map<string, 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'UNAVAILABLE'>;
    services: Map<string, {
        status: 'UP' | 'DOWN' | 'DEGRADED';
        responseTime: number;
        errorRate: number;
        lastCheck: Date;
    }>;
    queue: {
        utilization: number;
        length: number;
        oldestRequest: Date | null;
        throughput: number;
    };
    performance: {
        averageResponseTime: number;
        p95ResponseTime: number;
        requestsPerSecond: number;
        errorRate: number;
    };
}
export interface ReliabilityMetrics {
    uptime: number;
    availability: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageQueueTime: number;
    averageProcessingTime: number;
    requestsDropped: number;
    degradedOperations: number;
    failoverEvents: number;
    reconciliationEvents: number;
}
/**
 * Comprehensive production reliability management system
 */
export declare class ProductionReliabilityManager extends EventEmitter {
    private config;
    private logger;
    private rateLimiter;
    private retryPatterns;
    private zoneManager;
    private errorHandler;
    private requestQueue;
    private batchQueue;
    private processingQueue;
    private queueProcessor?;
    private systemHealth;
    private healthCheckInterval?;
    private reconciliationInterval?;
    private metrics;
    private metricsInterval?;
    private startTime;
    private isDegraded;
    private isSheddingLoad;
    private activeRequests;
    constructor(config: Partial<ReliabilityConfig>, rateLimiter: AutotaskRateLimiter, retryPatterns: AutotaskRetryPatterns, zoneManager: ZoneManager, errorHandler: AutotaskErrorHandler, logger: winston.Logger);
    /**
     * Queue a request with priority and reliability features
     */
    queueRequest<T>(endpoint: string, method: string, zone: string, requestFn: () => Promise<T>, options?: {
        priority?: number;
        timeout?: number;
        retryable?: boolean;
        batchable?: boolean;
        metadata?: Record<string, any>;
        data?: any;
        headers?: Record<string, string>;
    }): Promise<T>;
    /**
     * Execute request with full reliability patterns
     */
    executeRequest<T>(requestFn: () => Promise<T>, endpoint: string, method: string, zone: string, context?: Record<string, any>): Promise<T>;
    /**
     * Get current system health
     */
    getSystemHealth(): SystemHealth;
    /**
     * Get reliability metrics
     */
    getMetrics(): ReliabilityMetrics;
    /**
     * Enable/disable graceful degradation
     */
    setDegradedMode(enabled: boolean, reason?: string): void;
    /**
     * Force queue processing
     */
    processQueueNow(): Promise<void>;
    /**
     * Clear queue (emergency operation)
     */
    clearQueue(rejectPending?: boolean): number;
    /**
     * Get queue statistics
     */
    getQueueStatistics(): Record<string, any>;
    /**
     * Add request to queue
     */
    private addToQueue;
    /**
     * Add request to batch queue
     */
    private addToBatch;
    /**
     * Process a batch of requests
     */
    private processBatch;
    /**
     * Check if we should shed load for this request
     */
    private shouldShedLoad;
    /**
     * Try emergency queue cleanup
     */
    private tryEmergencyQueueCleanup;
    /**
     * Remove request from queue
     */
    private removeFromQueue;
    /**
     * Get total queue length
     */
    private getTotalQueueLength;
    /**
     * Process request queue
     */
    private processRequestQueue;
    /**
     * Start queue processing
     */
    private startQueueProcessing;
    /**
     * Record request success
     */
    private recordRequestSuccess;
    /**
     * Record request failure
     */
    private recordRequestFailure;
    /**
     * Update system health
     */
    private updateSystemHealth;
    /**
     * Adjust system for degradation
     */
    private adjustForDegradation;
    /**
     * Calculate throughput
     */
    private calculateThroughput;
    /**
     * Calculate requests per second
     */
    private calculateRequestsPerSecond;
    /**
     * Initialize metrics
     */
    private initializeMetrics;
    /**
     * Initialize system health
     */
    private initializeSystemHealth;
    /**
     * Start health monitoring
     */
    private startHealthMonitoring;
    /**
     * Start metrics collection
     */
    private startMetricsCollection;
    /**
     * Update metrics
     */
    private updateMetrics;
    /**
     * Start reconciliation process
     */
    private startReconciliation;
    /**
     * Perform request reconciliation
     */
    private performReconciliation;
    /**
     * Cleanup and shutdown
     */
    destroy(): void;
}
//# sourceMappingURL=ProductionReliabilityManager.d.ts.map