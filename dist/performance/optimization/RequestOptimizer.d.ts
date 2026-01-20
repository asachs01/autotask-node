import { EventEmitter } from 'events';
import winston from 'winston';
import { OptimizationConfig, BatchRequest, BatchResponse, RequestOptimizationMetrics, OptimizationRule, RequestPattern } from '../types/OptimizationTypes';
/**
 * Advanced request optimization system
 *
 * Orchestrates request batching, deduplication, compression, and
 * intelligent routing to maximize API performance and efficiency.
 */
export declare class RequestOptimizer extends EventEmitter {
    private logger;
    private readonly config;
    private readonly batchProcessor;
    private readonly deduplicator;
    private readonly compressionManager;
    private metrics;
    private optimizationRules;
    private requestPatterns;
    private isOptimizing;
    constructor(logger: winston.Logger, config?: OptimizationConfig);
    /**
     * Start the request optimizer
     */
    start(): void;
    /**
     * Stop the request optimizer
     */
    stop(): void;
    /**
     * Optimize a single request
     */
    optimizeRequest(request: BatchRequest): Promise<BatchResponse>;
    /**
     * Optimize multiple requests in parallel
     */
    optimizeRequests(requests: BatchRequest[]): Promise<BatchResponse[]>;
    /**
     * Add optimization rule
     */
    addOptimizationRule(rule: OptimizationRule): void;
    /**
     * Remove optimization rule
     */
    removeOptimizationRule(ruleId: string): boolean;
    /**
     * Get optimization metrics
     */
    getMetrics(): RequestOptimizationMetrics;
    /**
     * Get detected request patterns
     */
    getRequestPatterns(): RequestPattern[];
    /**
     * Get optimization recommendations
     */
    getOptimizationRecommendations(): {
        batching: string[];
        deduplication: string[];
        compression: string[];
        concurrency: string[];
        general: string[];
    };
    /**
     * Reset optimization metrics
     */
    resetMetrics(): void;
    private setupEventHandlers;
    private initializeDefaultRules;
    private applyOptimizationRules;
    private groupRequestsForOptimization;
    private processSingleRequest;
    private recordRequestPattern;
    private updateBatchEfficiency;
    private updateDeduplicationMetrics;
    private updateEfficiencyMetrics;
}
//# sourceMappingURL=RequestOptimizer.d.ts.map