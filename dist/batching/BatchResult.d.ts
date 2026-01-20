/**
 * Batch Result Implementation
 *
 * Handles batch processing results with:
 * - Individual request result tracking
 * - Success/failure analysis
 * - Performance metrics collection
 * - Result aggregation and reporting
 */
import winston from 'winston';
import { BatchResult, BatchRequestResult } from './types';
/**
 * Result builder for constructing batch results
 */
export declare class BatchResultBuilder {
    private batchId;
    private startTime;
    private strategy;
    private results;
    private optimizations;
    constructor(batchId: string, strategy?: string);
    /**
     * Add a successful request result
     */
    addSuccess(requestId: string, data: any, statusCode?: number, processingTime?: number, responseSize?: number): BatchResultBuilder;
    /**
     * Add a failed request result
     */
    addFailure(requestId: string, error: Error, statusCode?: number, processingTime?: number, responseSize?: number): BatchResultBuilder;
    /**
     * Add a request result (success or failure based on data/error)
     */
    addResult(requestId: string, data?: any, error?: Error, statusCode?: number, processingTime?: number, responseSize?: number): BatchResultBuilder;
    /**
     * Add multiple results from an array
     */
    addResults(results: Partial<BatchRequestResult>[]): BatchResultBuilder;
    /**
     * Set optimizations applied to the batch
     */
    setOptimizations(optimizations: string[]): BatchResultBuilder;
    /**
     * Build the final batch result
     */
    build(): BatchResult;
}
/**
 * Result analyzer for batch result analysis and reporting
 */
export declare class BatchResultAnalyzer {
    private readonly logger;
    constructor(logger: winston.Logger);
    /**
     * Analyze batch result and provide insights
     */
    analyzeBatchResult(result: BatchResult): BatchAnalysis;
    /**
     * Generate summary statistics for multiple batch results
     */
    generateAggregateAnalysis(results: BatchResult[]): AggregateAnalysis;
    /**
     * Extract failed requests for retry analysis
     */
    extractFailedRequests(result: BatchResult): FailedRequestInfo[];
    /**
     * Generate success/failure report
     */
    generateReport(result: BatchResult): BatchReport;
    private generateSummary;
    private analyzePerformance;
    private analyzeErrors;
    private generateRecommendations;
    private assessQuality;
    private calculateEfficiency;
    private isRetryableError;
    private isCriticalError;
    private calculateRetryDelay;
    private calculateAverageRequestTime;
    private findSlowestRequest;
    private findFastestRequest;
    private categorizeErrors;
    private categorizeError;
    private assessOptimizationEffectiveness;
    private identifyErrorPatterns;
    private analyzePerformanceTrends;
    private calculateTrend;
    private generateAggregateRecommendations;
}
export interface BatchAnalysis {
    batchId: string;
    summary: string;
    performance: PerformanceAnalysis;
    errors: ErrorAnalysis;
    recommendations: string[];
    quality: QualityAssessment;
}
export interface PerformanceAnalysis {
    averageRequestTime: number;
    maxRequestTime: number;
    minRequestTime: number;
    totalProcessingTime: number;
    throughput: number;
    efficiency: number;
}
export interface ErrorAnalysis {
    totalErrors: number;
    errorTypes: Map<string, number>;
    retryableErrors: number;
    criticalErrors: number;
}
export interface QualityAssessment {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    factors: string[];
}
export interface AggregateAnalysis {
    totalBatches: number;
    totalRequests: number;
    overallSuccessRate: number;
    averageProcessingTime: number;
    throughput: number;
    errorPatterns: ErrorPattern[];
    performanceTrends: PerformanceTrend[];
    recommendations: string[];
}
export interface ErrorPattern {
    type: string;
    frequency: number;
    percentage: number;
    impact: 'low' | 'medium' | 'high';
}
export interface PerformanceTrend {
    metric: string;
    direction: 'improving' | 'declining' | 'degrading';
    magnitude: number;
    description: string;
}
export interface FailedRequestInfo {
    requestId: string;
    error: Error;
    statusCode?: number;
    processingTime: number;
    retryable: boolean;
    retryDelay: number;
}
export interface BatchReport {
    batchId: string;
    timestamp: Date;
    summary: {
        total: number;
        successful: number;
        failed: number;
        successRate: number;
        processingTime: number;
    };
    performance: {
        averageRequestTime: number;
        slowestRequest?: BatchRequestResult;
        fastestRequest?: BatchRequestResult;
        throughput: number;
    };
    errors?: {
        totalErrors: number;
        errorBreakdown: Map<string, number>;
        retryableErrors: number;
    };
    optimization?: {
        applied: string[];
        effectiveness: number;
    };
}
//# sourceMappingURL=BatchResult.d.ts.map