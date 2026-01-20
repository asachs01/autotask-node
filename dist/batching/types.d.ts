/**
 * Type definitions for the Autotask SDK batching system
 */
import { QueueRequest, QueueBatch } from '../queue/types/QueueTypes';
/**
 * Batch request interface - extends queue request with batching-specific properties
 */
export interface BatchRequest extends Omit<QueueRequest, 'batchable'> {
    /** Whether this request supports batching */
    batchable: true;
    /** Batch optimization hints */
    batchHints?: BatchHints;
    /** Original client context for result mapping */
    clientContext?: any;
    /** Callback for individual request completion within batch */
    onComplete?: (result: any, error?: Error) => void;
}
/**
 * Batch optimization hints
 */
export interface BatchHints {
    /** Preferred batch size for this request type */
    preferredBatchSize?: number;
    /** Whether request order matters in batch */
    orderSensitive?: boolean;
    /** Fields that can be used for deduplication */
    deduplicationFields?: string[];
    /** Request can be coalesced with similar requests */
    coalesceable?: boolean;
    /** Maximum acceptable delay for batching */
    maxDelay?: number;
}
/**
 * Batch processing result
 */
export interface BatchResult {
    /** Batch identifier */
    batchId: string;
    /** Overall batch success status */
    success: boolean;
    /** Individual request results */
    results: BatchRequestResult[];
    /** Batch processing metadata */
    metadata: {
        /** Time when batch was created */
        startTime: Date;
        /** Time when batch completed */
        endTime: Date;
        /** Total processing time in milliseconds */
        processingTime: number;
        /** Batch size */
        size: number;
        /** Success rate (0-1) */
        successRate: number;
        /** Strategy used for batching */
        strategy: string;
        /** Any optimization applied */
        optimizations?: string[];
    };
}
/**
 * Individual request result within a batch
 */
export interface BatchRequestResult {
    /** Request identifier */
    requestId: string;
    /** Request success status */
    success: boolean;
    /** Response data if successful */
    data?: any;
    /** Error if failed */
    error?: Error;
    /** HTTP status code */
    statusCode?: number;
    /** Processing time for this specific request */
    processingTime: number;
    /** Response size in bytes */
    responseSize?: number;
}
/**
 * Batch strategy types
 */
export type BatchStrategy = 'size-based' | 'time-based' | 'hybrid' | 'priority-aware' | 'adaptive';
/**
 * Batch configuration
 */
export interface BatchConfig {
    /** Maximum batch size (Autotask limit: 500) */
    maxBatchSize: number;
    /** Minimum batch size to trigger processing */
    minBatchSize: number;
    /** Maximum time to wait for batch completion (ms) */
    maxWaitTime: number;
    /** Default batching strategy */
    defaultStrategy: BatchStrategy;
    /** Enable request deduplication */
    enableDeduplication: boolean;
    /** Enable request coalescing */
    enableCoalescing: boolean;
    /** Enable adaptive batch sizing */
    enableAdaptiveSizing: boolean;
    /** Retry configuration for batch operations */
    retryConfig: {
        /** Maximum retry attempts */
        maxRetries: number;
        /** Base delay between retries (ms) */
        baseDelay: number;
        /** Exponential backoff multiplier */
        backoffMultiplier: number;
        /** Maximum retry delay (ms) */
        maxDelay: number;
    };
    /** Circuit breaker configuration */
    circuitBreakerConfig: {
        /** Enable circuit breaker */
        enabled: boolean;
        /** Failure threshold to open circuit */
        failureThreshold: number;
        /** Recovery timeout (ms) */
        timeout: number;
    };
}
/**
 * Batch optimization configuration
 */
export interface BatchOptimizationConfig {
    /** Enable request coalescing */
    enableCoalescing: boolean;
    /** Enable duplicate elimination */
    enableDeduplication: boolean;
    /** Enable priority-based optimization */
    enablePriorityOptimization: boolean;
    /** Enable zone-aware batching */
    enableZoneOptimization: boolean;
    /** Enable adaptive sizing based on performance */
    enableAdaptiveSizing: boolean;
    /** Optimization thresholds */
    thresholds: {
        /** Minimum requests for coalescing */
        coalescingThreshold: number;
        /** Similarity threshold for request grouping (0-1) */
        similarityThreshold: number;
        /** Performance threshold for adaptive sizing */
        performanceThreshold: number;
    };
}
/**
 * Batch queue configuration
 */
export interface BatchQueueConfig {
    /** Maximum number of concurrent batches */
    maxConcurrentBatches: number;
    /** Queue processing strategy */
    processingStrategy: 'fifo' | 'priority' | 'round-robin' | 'least-load';
    /** Enable queue persistence */
    persistent: boolean;
    /** Queue size limits */
    limits: {
        /** Maximum queue size */
        maxQueueSize: number;
        /** Warning threshold */
        warningThreshold: number;
        /** Memory usage limit (bytes) */
        memoryLimit: number;
    };
}
/**
 * Batch performance metrics
 */
export interface BatchMetrics {
    /** Total batches processed */
    totalBatches: number;
    /** Total requests processed */
    totalRequests: number;
    /** Success rate (0-1) */
    successRate: number;
    /** Average batch size */
    averageBatchSize: number;
    /** Average batch processing time (ms) */
    averageProcessingTime: number;
    /** Average request wait time (ms) */
    averageWaitTime: number;
    /** Throughput (requests per second) */
    throughput: number;
    /** Error rate (0-1) */
    errorRate: number;
    /** Deduplication rate (0-1) */
    deduplicationRate: number;
    /** Coalescing rate (0-1) */
    coalescingRate: number;
    /** Performance by strategy */
    strategyPerformance: Map<BatchStrategy, {
        totalBatches: number;
        averageTime: number;
        successRate: number;
    }>;
    /** Performance by endpoint */
    endpointPerformance: Map<string, {
        totalBatches: number;
        averageTime: number;
        successRate: number;
        averageBatchSize: number;
    }>;
    /** Time-series metrics for trending */
    timeSeries: {
        timestamp: Date;
        throughput: number;
        errorRate: number;
        averageLatency: number;
    }[];
}
/**
 * Batch event types
 */
export type BatchEventType = 'batch.created' | 'batch.ready' | 'batch.processing' | 'batch.completed' | 'batch.failed' | 'batch.optimized' | 'batch.coalesced' | 'batch.deduplicated' | 'batch.enqueued' | 'batch.dequeued' | 'batch.retry' | 'batch.removed' | 'queue.full' | 'queue.empty' | 'queue.cleared' | 'queue.warning' | 'strategy.changed' | 'performance.threshold' | 'metrics.alert' | 'stats.updated' | 'circuit.opened' | 'circuit.closed' | 'circuit.state.changed' | 'request.retry.scheduled' | 'request.failed.permanent';
/**
 * Batch event interface
 */
export interface BatchEvent {
    /** Event type */
    type: BatchEventType;
    /** Event timestamp */
    timestamp: Date;
    /** Event data */
    data: any;
    /** Batch ID if applicable */
    batchId?: string;
    /** Additional metadata */
    metadata?: Record<string, any>;
}
/**
 * Batch processor interface
 */
export interface IBatchProcessor {
    /** Process a batch of requests */
    processBatch(batch: QueueBatch): Promise<BatchResult>;
    /** Check if processor can handle the batch */
    canProcess(batch: QueueBatch): boolean;
    /** Get processor health */
    getHealth(): Promise<{
        status: 'healthy' | 'degraded' | 'offline';
        message?: string;
    }>;
}
/**
 * Batch optimizer interface
 */
export interface IBatchOptimizer {
    /** Optimize a batch before processing */
    optimize(batch: QueueBatch): Promise<QueueBatch>;
    /** Get optimization statistics */
    getStats(): {
        totalOptimizations: number;
        deduplicationCount: number;
        coalescingCount: number;
        sizeReductions: number;
    };
}
/**
 * Batch strategy interface
 */
export interface IBatchStrategy {
    /** Strategy identifier */
    readonly name: string;
    /** Determine if batch should be processed now */
    shouldProcess(batch: QueueBatch): boolean;
    /** Get optimal batch size for current conditions */
    getOptimalBatchSize(context: BatchContext): number;
    /** Get batch timeout for current conditions */
    getBatchTimeout(context: BatchContext): number;
}
/**
 * Batch context for strategy decisions
 */
export interface BatchContext {
    /** Current system load (0-1) */
    systemLoad: number;
    /** Queue depth */
    queueDepth: number;
    /** Active batch count */
    activeBatches: number;
    /** Recent performance metrics */
    recentPerformance: {
        averageResponseTime: number;
        successRate: number;
        errorRate: number;
    };
    /** Current time */
    timestamp: Date;
    /** Zone information */
    zone: string;
    /** Endpoint information */
    endpoint: string;
}
//# sourceMappingURL=types.d.ts.map