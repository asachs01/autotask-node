/**
 * Advanced Queue Manager
 *
 * Enterprise-grade queue management system with comprehensive features:
 * - Multi-backend persistence (Redis, SQLite, Memory)
 * - Priority-based request scheduling
 * - Intelligent batching and deduplication
 * - Circuit breaker patterns and retry strategies
 * - Real-time monitoring and health checks
 * - Graceful degradation and load shedding
 */
import { EventEmitter } from 'events';
import winston from 'winston';
import { QueueRequest, QueueConfiguration, QueueMetrics, QueueHealth, QueueFilter, QueueStorageBackend, QueueProcessor } from '../types/QueueTypes';
export interface QueueManagerOptions {
    /** Queue configuration */
    config: Partial<QueueConfiguration>;
    /** Logger instance */
    logger?: winston.Logger;
    /** Custom storage backend */
    customBackend?: QueueStorageBackend;
    /** Custom processors */
    processors?: Map<string, QueueProcessor>;
    /** Enable monitoring */
    enableMonitoring?: boolean;
}
/**
 * Advanced queue manager with enterprise features
 */
export declare class QueueManager extends EventEmitter {
    private config;
    private logger;
    private backend;
    private scheduler;
    private circuitBreaker;
    private batchManager;
    private monitor?;
    private processors;
    private isProcessing;
    private isShuttingDown;
    private processingInterval?;
    private maintenanceInterval?;
    private activeRequests;
    private requestDeduplication;
    private scheduledRequests;
    private metrics;
    private metricsUpdateInterval?;
    constructor(options: QueueManagerOptions);
    /**
     * Initialize the queue manager
     */
    initialize(): Promise<void>;
    /**
     * Enqueue a request with advanced features
     */
    enqueue<T = any>(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', zone: string, options?: {
        data?: any;
        headers?: Record<string, string>;
        priority?: number;
        timeout?: number;
        maxRetries?: number;
        retryable?: boolean;
        batchable?: boolean;
        metadata?: Record<string, any>;
        scheduledAt?: Date;
    }): Promise<T>;
    /**
     * Process requests from the queue
     */
    processNext(): Promise<boolean>;
    /**
     * Get queue metrics
     */
    getMetrics(): Promise<QueueMetrics>;
    /**
     * Get queue health status
     */
    getHealth(): Promise<QueueHealth>;
    /**
     * Get requests by filter
     */
    getRequests(filter?: QueueFilter): Promise<QueueRequest[]>;
    /**
     * Cancel a request
     */
    cancelRequest(requestId: string): Promise<boolean>;
    /**
     * Clear the queue
     */
    clear(zone?: string): Promise<number>;
    /**
     * Pause queue processing
     */
    pauseProcessing(): void;
    /**
     * Resume queue processing
     */
    resumeProcessing(): void;
    /**
     * Shutdown the queue manager
     */
    shutdown(): Promise<void>;
    /**
     * Execute a request
     */
    private executeRequest;
    /**
     * Handle successful request completion
     */
    private handleRequestSuccess;
    /**
     * Handle failed request
     */
    private handleRequestFailure;
    /**
     * Schedule request retry with exponential backoff
     */
    private scheduleRetry;
    /**
     * Generate unique request ID
     */
    private generateRequestId;
    /**
     * Generate request fingerprint for deduplication
     */
    private generateFingerprint;
    /**
     * Register a processor for handling requests
     */
    registerProcessor(key: string, processor: QueueProcessor): void;
    /**
     * Unregister a processor
     */
    unregisterProcessor(key: string): boolean;
    /**
     * Get appropriate processor for request
     */
    private getProcessor;
    /**
     * Build complete configuration with defaults
     */
    private buildConfiguration;
    /**
     * Create storage backend based on configuration
     */
    private createBackend;
    /**
     * Initialize metrics
     */
    private initializeMetrics;
    /**
     * Update metrics
     */
    private updateMetrics;
    /**
     * Start processing loop
     */
    private startProcessing;
    /**
     * Start maintenance tasks
     */
    private startMaintenance;
    /**
     * Start metrics collection
     */
    private startMetricsCollection;
    /**
     * Handle queue full condition
     */
    private handleQueueFull;
    /**
     * Handle request timeout
     */
    private handleRequestTimeout;
    /**
     * Reschedule a request for later execution
     */
    private rescheduleRequest;
    /**
     * Clean up request resources
     */
    private cleanupRequest;
    /**
     * Check backend health
     */
    private checkBackendHealth;
    /**
     * Check processing health
     */
    private checkProcessingHealth;
    /**
     * Determine overall health status
     */
    private determineOverallHealth;
}
//# sourceMappingURL=QueueManager.d.ts.map