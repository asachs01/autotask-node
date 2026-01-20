/**
 * Batch Strategy Implementation
 *
 * Implements different batching strategies for optimal request processing:
 * - Size-based: Process when batch reaches target size
 * - Time-based: Process after timeout regardless of size
 * - Hybrid: Combination of size and time triggers
 * - Priority-aware: Consider request priorities in batching decisions
 * - Adaptive: Adjust based on system performance and load
 */
import { QueueBatch } from '../queue/types/QueueTypes';
import { IBatchStrategy, BatchContext, BatchStrategy as BatchStrategyType } from './types';
/**
 * Base batch strategy with common functionality
 */
declare abstract class BaseBatchStrategy implements IBatchStrategy {
    protected config: {
        maxBatchSize: number;
        minBatchSize: number;
        maxWaitTime: number;
    };
    constructor(config: {
        maxBatchSize: number;
        minBatchSize: number;
        maxWaitTime: number;
    });
    abstract readonly name: string;
    abstract shouldProcess(batch: QueueBatch): boolean;
    abstract getOptimalBatchSize(context: BatchContext): number;
    abstract getBatchTimeout(context: BatchContext): number;
    /**
     * Calculate age of batch in milliseconds
     */
    protected getBatchAge(batch: QueueBatch): number;
    /**
     * Get highest priority in batch
     */
    protected getBatchPriority(batch: QueueBatch): number;
    /**
     * Check if batch has critical priority requests
     */
    protected hasCriticalPriority(batch: QueueBatch): boolean;
}
/**
 * Size-based batching strategy
 * Processes batches when they reach the target size
 */
export declare class SizeBasedStrategy extends BaseBatchStrategy {
    readonly name = "size-based";
    shouldProcess(batch: QueueBatch): boolean;
    getOptimalBatchSize(context: BatchContext): number;
    getBatchTimeout(context: BatchContext): number;
}
/**
 * Time-based batching strategy
 * Processes batches after a timeout regardless of size
 */
export declare class TimeBasedStrategy extends BaseBatchStrategy {
    readonly name = "time-based";
    shouldProcess(batch: QueueBatch): boolean;
    getOptimalBatchSize(context: BatchContext): number;
    getBatchTimeout(context: BatchContext): number;
}
/**
 * Hybrid batching strategy
 * Combines size and time triggers with intelligent decision making
 */
export declare class HybridStrategy extends BaseBatchStrategy {
    readonly name = "hybrid";
    shouldProcess(batch: QueueBatch): boolean;
    getOptimalBatchSize(context: BatchContext): number;
    getBatchTimeout(context: BatchContext): number;
}
/**
 * Priority-aware batching strategy
 * Groups requests by priority and processes high-priority batches first
 */
export declare class PriorityAwareStrategy extends BaseBatchStrategy {
    readonly name = "priority-aware";
    shouldProcess(batch: QueueBatch): boolean;
    getOptimalBatchSize(context: BatchContext): number;
    getBatchTimeout(context: BatchContext): number;
}
/**
 * Adaptive batching strategy
 * Continuously adjusts behavior based on system performance and conditions
 */
export declare class AdaptiveStrategy extends BaseBatchStrategy {
    readonly name = "adaptive";
    private performanceHistory;
    shouldProcess(batch: QueueBatch): boolean;
    getOptimalBatchSize(context: BatchContext): number;
    getBatchTimeout(context: BatchContext): number;
    /**
     * Record performance data for adaptive learning
     */
    recordPerformance(avgResponseTime: number, successRate: number, batchSize: number, systemLoad: number): void;
    private getAdaptiveContext;
    private getAdaptiveSizeThreshold;
    private getAdaptiveTimeThreshold;
    private getRecentPerformance;
}
/**
 * Strategy factory for creating batch strategies
 */
export declare class BatchStrategyFactory {
    private static strategies;
    /**
     * Create a batch strategy instance
     */
    static create(type: BatchStrategyType, config: {
        maxBatchSize: number;
        minBatchSize: number;
        maxWaitTime: number;
    }): IBatchStrategy;
    /**
     * Get available strategy types
     */
    static getAvailableStrategies(): BatchStrategyType[];
    /**
     * Register a custom strategy
     */
    static registerStrategy(name: BatchStrategyType, strategyClass: new (config: any) => IBatchStrategy): void;
}
export {};
//# sourceMappingURL=BatchStrategy.d.ts.map