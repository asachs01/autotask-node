/**
 * Autotask SDK Batch Processing System
 *
 * A comprehensive request batching and optimization system designed for the Autotask REST API.
 * Provides intelligent batching strategies, request optimization, queue management,
 * performance monitoring, and detailed result analysis.
 *
 * @example
 * ```typescript
 * import { BatchManager, BatchConfig } from '@autotask/batch';
 *
 * // Initialize with configuration
 * const config: BatchConfig = {
 *   maxBatchSize: 200,
 *   minBatchSize: 5,
 *   maxWaitTime: 5000,
 *   defaultStrategy: 'hybrid',
 *   enableDeduplication: true,
 *   enableCoalescing: true
 * };
 *
 * const batchManager = new BatchManager(config, processor, logger);
 *
 * // Add requests for batching
 * await batchManager.addRequest({
 *   id: 'req-1',
 *   endpoint: '/tickets',
 *   method: 'POST',
 *   zone: 'zone1',
 *   priority: 5,
 *   data: ticketData,
 *   batchable: true,
 *   batchHints: {
 *     preferredBatchSize: 50,
 *     maxDelay: 3000
 *   }
 * });
 *
 * // Monitor performance
 * const metrics = batchManager.getMetrics();
 * console.log('Success rate:', metrics.batchMetrics.successRate);
 * console.log('Throughput:', metrics.batchMetrics.throughput, 'req/s');
 *
 * // Check system health
 * const health = batchManager.getHealth();
 * console.log('System status:', health.status);
 * ```
 */
export * from './types';
export { BatchManager } from './BatchManager';
export { BatchQueue } from './BatchQueue';
export { BatchOptimizer } from './BatchOptimizer';
export { BatchMetricsCollector } from './BatchMetrics';
export { BatchResultBuilder, BatchResultAnalyzer, type BatchAnalysis, type PerformanceAnalysis, type ErrorAnalysis, type QualityAssessment, type AggregateAnalysis, type BatchReport } from './BatchResult';
export { BatchStrategyFactory, SizeBasedStrategy, TimeBasedStrategy, HybridStrategy, PriorityAwareStrategy, AdaptiveStrategy } from './BatchStrategy';
/**
 * Create a default batch configuration for common use cases
 */
export declare function createDefaultBatchConfig(): Required<import('./types').BatchConfig>;
/**
 * Create optimized batch configuration for high-throughput scenarios
 */
export declare function createHighThroughputBatchConfig(): Required<import('./types').BatchConfig>;
/**
 * Create batch configuration optimized for low-latency scenarios
 */
export declare function createLowLatencyBatchConfig(): Required<import('./types').BatchConfig>;
/**
 * Create batch configuration for development and testing
 */
export declare function createDevelopmentBatchConfig(): Required<import('./types').BatchConfig>;
/**
 * Utility function to create a batch request from a regular request
 */
export declare function createBatchRequest(request: Omit<import('./types').BatchRequest, 'batchable'>, batchHints?: import('./types').BatchHints): import('./types').BatchRequest;
/**
 * Utility function to calculate optimal batch size based on request characteristics
 */
export declare function calculateOptimalBatchSize(requests: import('./types').BatchRequest[], maxSize?: number): number;
/**
 * Utility function to analyze batch performance and provide recommendations
 */
export declare function analyzeBatchPerformance(results: import('./types').BatchResult[]): {
    overallSuccessRate: number;
    averageProcessingTime: number;
    throughput: number;
    recommendations: string[];
};
/**
 * Version information
 */
export declare const VERSION = "1.0.0";
export declare const BUILD_DATE: string;
/**
 * Feature flags for experimental functionality
 */
export declare const FEATURES: {
    EXPERIMENTAL_COALESCING: boolean;
    EXPERIMENTAL_ADAPTIVE_SIZING: boolean;
    EXPERIMENTAL_MACHINE_LEARNING: boolean;
    DEBUG_METRICS: boolean;
};
export type { QueueBatch, QueueRequest, QueueRequestStatus } from '../queue/types/QueueTypes';
//# sourceMappingURL=index.d.ts.map