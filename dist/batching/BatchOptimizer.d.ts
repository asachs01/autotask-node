/**
 * Batch Optimizer Implementation
 *
 * Optimizes batch requests before processing through:
 * - Request deduplication
 * - Request coalescing (combining similar requests)
 * - Priority-based reordering
 * - Size optimization
 * - Zone-aware grouping
 */
import winston from 'winston';
import { QueueBatch } from '../queue/types/QueueTypes';
import { IBatchOptimizer, BatchOptimizationConfig } from './types';
/**
 * BatchOptimizer optimizes batches for better performance and efficiency
 */
export declare class BatchOptimizer implements IBatchOptimizer {
    private readonly config;
    private readonly logger;
    private stats;
    private readonly fingerprintCache;
    private readonly similarityCache;
    constructor(config: Partial<BatchOptimizationConfig>, logger: winston.Logger);
    /**
     * Optimize a batch before processing
     */
    optimize(batch: QueueBatch): Promise<QueueBatch>;
    /**
     * Get optimization statistics
     */
    getStats(): {
        totalOptimizations: number;
        deduplicationCount: number;
        coalescingCount: number;
        sizeReductions: number;
    };
    /**
     * Clear optimization caches
     */
    clearCaches(): void;
    /**
     * Deduplicate requests in the batch
     */
    private deduplicateRequests;
    /**
     * Coalesce similar requests
     */
    private coalesceRequests;
    /**
     * Optimize request priorities within batch
     */
    private optimizePriorities;
    /**
     * Optimize zone ordering for better processing efficiency
     */
    private optimizeZoneOrdering;
    /**
     * Apply adaptive sizing based on performance characteristics
     */
    private adaptiveSize;
    /**
     * Generate request fingerprint for deduplication
     */
    private getRequestFingerprint;
    /**
     * Find similar requests for coalescing
     */
    private findSimilarRequests;
    /**
     * Calculate similarity between two requests
     */
    private calculateRequestSimilarity;
    /**
     * Create a coalesced request from multiple similar requests
     */
    private createCoalescedRequest;
    /**
     * Check if two data objects are similar enough for coalescing
     */
    private areDataSimilar;
    /**
     * Check if two header objects are similar
     */
    private areHeadersSimilar;
    /**
     * Determine if two requests can be coalesced
     */
    private canCoalesceRequests;
    /**
     * Combine data from multiple requests for coalescing
     */
    private combineRequestData;
    /**
     * Get optimal batch sizes for different endpoints
     */
    private getOptimalEndpointSizes;
    /**
     * Update optimization statistics
     */
    private updateStats;
    /**
     * Get list of enabled optimizations
     */
    private getEnabledOptimizations;
}
//# sourceMappingURL=BatchOptimizer.d.ts.map