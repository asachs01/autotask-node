/**
 * Main Batch Manager Implementation
 *
 * Coordinates all batch processing components:
 * - Request collection and organization
 * - Batch optimization and strategy application
 * - Queue management and processing
 * - Result handling and metrics collection
 * - Error handling and recovery
 */
import { EventEmitter } from 'events';
import winston from 'winston';
import { BatchConfig, BatchRequest, BatchResult, IBatchProcessor } from './types';
/**
 * BatchManager coordinates all batch processing operations
 */
export declare class BatchManager extends EventEmitter {
    private readonly config;
    private readonly logger;
    private readonly errorLogger;
    private readonly batchQueue;
    private readonly optimizer;
    private readonly metricsCollector;
    private readonly resultAnalyzer;
    private readonly retryStrategy;
    private readonly circuitBreaker;
    private readonly strategies;
    private currentStrategy;
    private readonly activeBatches;
    private batchCounter;
    private isProcessing;
    private isShuttingDown;
    private readonly processors;
    constructor(config: Partial<BatchConfig>, processor: IBatchProcessor, logger: winston.Logger);
    /**
     * Add a request to be batched
     */
    addRequest(request: BatchRequest): Promise<void>;
    /**
     * Force process a specific batch
     */
    processBatch(batchId: string): Promise<BatchResult>;
    /**
     * Register a processor for specific endpoints or zones
     */
    registerProcessor(key: string, processor: IBatchProcessor): void;
    /**
     * Change batching strategy
     */
    setStrategy(strategyName: string): void;
    /**
     * Get current metrics
     */
    getMetrics(): {
        batchMetrics: import("./types").BatchMetrics;
        queueStats: import("./BatchQueue").QueueStats;
        optimizerStats: {
            totalOptimizations: number;
            deduplicationCount: number;
            coalescingCount: number;
            sizeReductions: number;
        };
        circuitBreakerMetrics: import("../errors/CircuitBreaker").CircuitBreakerMetrics;
        activeBatches: number;
        currentStrategy: string;
    };
    /**
     * Get system health status
     */
    getHealth(): {
        status: "healthy" | "degraded" | "critical";
        timestamp: Date;
        issues: string[] | undefined;
        details: {
            queue: {
                status: "healthy" | "degraded" | "critical";
                message?: string;
                details: any;
            };
            circuitBreaker: import("../errors/CircuitBreaker").CircuitBreakerMetrics;
            metrics: {
                successRate: number;
                errorRate: number;
                throughput: number;
                activeBatches: number;
            };
        };
    };
    /**
     * Shutdown the batch manager gracefully
     */
    shutdown(): Promise<void>;
    private initializeStrategies;
    private setupEventHandlers;
    private generateBatchKey;
    private findCompatibleBatch;
    private createNewBatch;
    private isRequestCompatible;
    private selectStrategyForRequest;
    private processQueuedBatch;
    private findProcessor;
    private handleFailedRequests;
    private processIndividualRequest;
    private startProcessing;
    private emitEvent;
}
//# sourceMappingURL=BatchManager.d.ts.map