/**
 * Batch Queue Implementation
 *
 * Manages queuing and organization of batch requests with:
 * - Priority-based ordering
 * - Zone and endpoint grouping
 * - Memory and persistence management
 * - Queue monitoring and health checks
 */
import { EventEmitter } from 'events';
import winston from 'winston';
import { QueueBatch } from '../queue/types/QueueTypes';
import { BatchQueueConfig } from './types';
/**
 * Queue statistics for monitoring
 */
export interface QueueStats {
    totalBatches: number;
    pendingBatches: number;
    processingBatches: number;
    completedBatches: number;
    failedBatches: number;
    averageWaitTime: number;
    averageProcessingTime: number;
    memoryUsage: number;
    queueUtilization: number;
}
/**
 * BatchQueue manages the queuing and processing order of batch requests
 */
export declare class BatchQueue extends EventEmitter {
    private readonly config;
    private readonly logger;
    private readonly pendingQueue;
    private readonly processingQueue;
    private readonly completedQueue;
    private readonly priorityQueues;
    private readonly zoneQueues;
    private readonly endpointQueues;
    private stats;
    private readonly processingTimes;
    private isShuttingDown;
    constructor(config: Partial<BatchQueueConfig>, logger: winston.Logger);
    /**
     * Enqueue a batch for processing
     */
    enqueue(batch: QueueBatch): Promise<void>;
    /**
     * Dequeue the next batch for processing
     */
    dequeue(): Promise<QueueBatch | null>;
    /**
     * Mark batch as completed
     */
    complete(batchId: string, success: boolean): Promise<void>;
    /**
     * Retry a failed batch
     */
    retry(batchId: string, maxRetries?: number): Promise<boolean>;
    /**
     * Get queue statistics
     */
    getStats(): QueueStats;
    /**
     * Get batches by zone
     */
    getBatchesByZone(zone: string): QueueBatch[];
    /**
     * Get batches by endpoint
     */
    getBatchesByEndpoint(endpoint: string): QueueBatch[];
    /**
     * Remove a batch from the queue
     */
    remove(batchId: string): Promise<boolean>;
    /**
     * Clear all pending batches
     */
    clear(): Promise<number>;
    /**
     * Get queue health status
     */
    getHealth(): {
        status: 'healthy' | 'degraded' | 'critical';
        message?: string;
        details: any;
    };
    /**
     * Shutdown the queue gracefully
     */
    shutdown(): Promise<void>;
    /**
     * Select next batch based on processing strategy
     */
    private selectNextBatch;
    private selectByPriority;
    private selectByFifo;
    private selectByRoundRobin;
    private selectByLeastLoad;
    private addToPriorityQueue;
    private removeFromPriorityQueue;
    private addToZoneQueue;
    private removeFromZoneQueue;
    private addToEndpointQueue;
    private removeFromEndpointQueue;
    private updateStats;
    private updateProcessingTimeStats;
    private estimateMemoryUsage;
    private cleanupCompletedEntries;
    private startMonitoring;
    private emitEvent;
}
//# sourceMappingURL=BatchQueue.d.ts.map