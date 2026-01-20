/**
 * Priority Scheduler
 *
 * Advanced request scheduling with multiple strategies:
 * - FIFO: First In, First Out
 * - LIFO: Last In, First Out
 * - Priority: Highest priority first
 * - Weighted: Priority with fairness weighting
 * - Adaptive: Dynamic priority adjustment based on system load
 */
import { QueueRequest, QueueScheduler, QueueStrategyConfig } from '../types/QueueTypes';
export declare class PriorityScheduler implements QueueScheduler {
    private config;
    private adaptiveMetrics;
    private lastAdaptiveUpdate;
    constructor(config: QueueStrategyConfig);
    selectNext(availableRequests: QueueRequest[]): QueueRequest | null;
    schedule(request: QueueRequest, delay: number): void;
    getReadyRequests(): QueueRequest[];
    updateStrategy(config: QueueStrategyConfig): void;
    /**
     * Record execution metrics for adaptive scheduling
     */
    recordExecution(request: QueueRequest, success: boolean, responseTime: number): void;
    /**
     * FIFO scheduling - oldest requests first
     */
    private selectFIFO;
    /**
     * LIFO scheduling - newest requests first
     */
    private selectLIFO;
    /**
     * Priority scheduling - highest priority first, then FIFO within priority
     */
    private selectPriority;
    /**
     * Weighted priority scheduling with fairness considerations
     */
    private selectWeighted;
    /**
     * Adaptive scheduling based on historical performance
     */
    private selectAdaptive;
    /**
     * Update adaptive priorities based on collected metrics
     */
    private updateAdaptivePriorities;
    /**
     * Get current scheduling statistics
     */
    getStatistics(): Record<string, any>;
    /**
     * Reset adaptive metrics
     */
    resetAdaptiveMetrics(): void;
}
//# sourceMappingURL=PriorityScheduler.d.ts.map