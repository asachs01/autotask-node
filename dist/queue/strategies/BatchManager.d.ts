/**
 * Batch Manager
 *
 * Intelligent request batching system that optimizes API calls by:
 * - Grouping similar requests by endpoint and zone
 * - Dynamic batch sizing based on system load
 * - Smart timeout management for optimal throughput
 * - Deduplication of identical requests
 * - Priority-aware batching to maintain SLAs
 */
import { EventEmitter } from 'events';
import winston from 'winston';
import { QueueRequest, QueueBatch } from '../types/QueueTypes';
export interface BatchManagerOptions {
    maxBatchSize: number;
    batchTimeout: number;
    enableDeduplication: boolean;
    priorityAwareBatching: boolean;
    adaptiveSizing: boolean;
}
export interface BatchGroup {
    key: string;
    batch: QueueBatch;
    timer: ReturnType<typeof setTimeout>;
    lastActivity: Date;
}
export interface BatchStats {
    totalBatches: number;
    averageBatchSize: number;
    averageWaitTime: number;
    averageProcessingTime: number;
    deduplicationRate: number;
    timeoutRate: number;
}
export declare class BatchManager extends EventEmitter {
    private logger;
    private options;
    private activeBatches;
    private batchHistory;
    private stats;
    private systemLoad;
    private lastLoadUpdate;
    private dynamicBatchSizes;
    constructor(maxBatchSize: number, batchTimeout: number, logger: winston.Logger, options?: Partial<BatchManagerOptions>);
    /**
     * Add a request to a batch
     */
    addRequest(request: QueueRequest): void;
    /**
     * Force process a specific batch
     */
    processBatch(batchKey: string): void;
    /**
     * Process all active batches (for shutdown)
     */
    processAllBatches(): void;
    /**
     * Get current batch statistics
     */
    getStatistics(): BatchStats;
    /**
     * Get active batch information
     */
    getActiveBatches(): Array<{
        key: string;
        batchId: string;
        size: number;
        priority: number;
        age: number;
        endpoint: string;
        zone: string;
    }>;
    /**
     * Update system load for adaptive sizing
     */
    updateSystemLoad(load: number): void;
    /**
     * Clear all active batches
     */
    clear(): number;
    /**
     * Shutdown batch manager
     */
    shutdown(): void;
    /**
     * Generate batch key for grouping requests
     */
    private generateBatchKey;
    /**
     * Create a new batch group
     */
    private createNewBatch;
    /**
     * Check if request is duplicate within batch
     */
    private isDuplicate;
    /**
     * Check if batch should be processed
     */
    private shouldProcessBatch;
    /**
     * Get dynamic batch size based on system load and historical performance
     */
    private getDynamicBatchSize;
    /**
     * Get dynamic timeout based on priority and system conditions
     */
    private getDynamicTimeout;
    /**
     * Adjust batch sizes based on system performance
     */
    private adjustBatchSizes;
    /**
     * Record batch metrics for analysis
     */
    private recordBatchMetrics;
    /**
     * Update batch statistics
     */
    private updateStatistics;
    /**
     * Start monitoring system load
     */
    private startLoadMonitoring;
    /**
     * Mark batch as completed (called externally when batch finishes)
     */
    markBatchCompleted(batchId: string, success: boolean, processingTime: number): void;
}
//# sourceMappingURL=BatchManager.d.ts.map