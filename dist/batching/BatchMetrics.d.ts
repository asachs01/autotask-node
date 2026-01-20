/**
 * Batch Metrics Implementation
 *
 * Comprehensive metrics collection and analysis for batch operations:
 * - Real-time performance monitoring
 * - Historical trend analysis
 * - Alerting and threshold monitoring
 * - Detailed reporting and insights
 */
import { EventEmitter } from 'events';
import winston from 'winston';
import { BatchMetrics, BatchResult } from './types';
/**
 * Metric data point for time-series analysis
 */
interface MetricDataPoint {
    timestamp: Date;
    value: number;
    metadata?: Record<string, any>;
}
/**
 * Alert configuration
 */
interface AlertConfig {
    metric: string;
    threshold: number;
    operator: 'gt' | 'lt' | 'eq';
    enabled: boolean;
    cooldown: number;
    lastTriggered?: Date;
}
/**
 * Performance window for tracking metrics over time
 */
interface PerformanceWindow {
    startTime: Date;
    endTime: Date;
    totalBatches: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalProcessingTime: number;
    totalWaitTime: number;
}
/**
 * BatchMetricsCollector manages comprehensive metrics for batch operations
 */
export declare class BatchMetricsCollector extends EventEmitter {
    private readonly logger;
    private readonly windowSize;
    private readonly maxDataPoints;
    private metrics;
    private readonly timeSeriesData;
    private readonly performanceWindows;
    private readonly strategyMetrics;
    private readonly endpointMetrics;
    private readonly alerts;
    private lastSnapshot?;
    private lastSnapshotTime;
    private totalOriginalRequests;
    private totalDeduplicatedRequests;
    private totalCoalescedRequests;
    constructor(windowSize: number | undefined, // 5 minutes
    maxDataPoints: number | undefined, logger: winston.Logger);
    /**
     * Record a batch completion event
     */
    recordBatchCompletion(result: BatchResult): void;
    /**
     * Record endpoint-specific performance
     */
    recordEndpointPerformance(endpoint: string, batchSize: number, processingTime: number, success: boolean): void;
    /**
     * Record wait time for batches
     */
    recordWaitTime(waitTime: number): void;
    /**
     * Get current metrics snapshot
     */
    getMetrics(): BatchMetrics;
    /**
     * Get metrics for a specific time range
     */
    getMetricsForTimeRange(startTime: Date, endTime: Date): Partial<BatchMetrics>;
    /**
     * Get performance trends
     */
    getPerformanceTrends(windowCount?: number): {
        throughputTrend: 'increasing' | 'decreasing' | 'stable';
        errorRateTrend: 'increasing' | 'decreasing' | 'stable';
        latencyTrend: 'increasing' | 'decreasing' | 'stable';
        analysis: string[];
    };
    /**
     * Configure alert thresholds
     */
    configureAlert(metric: string, threshold: number, operator: 'gt' | 'lt' | 'eq', cooldown?: number): void;
    /**
     * Enable or disable an alert
     */
    toggleAlert(metric: string, enabled: boolean): void;
    /**
     * Get current alert status
     */
    getAlertStatus(): Array<{
        metric: string;
        threshold: number;
        operator: string;
        enabled: boolean;
        lastTriggered?: Date;
    }>;
    /**
     * Reset all metrics
     */
    reset(): void;
    /**
     * Export metrics data for external analysis
     */
    exportData(): {
        metrics: BatchMetrics;
        timeSeries: Record<string, MetricDataPoint[]>;
        performanceWindows: PerformanceWindow[];
        alerts: Array<AlertConfig>;
    };
    private recordStrategyPerformance;
    private recordOptimizationMetrics;
    private recordTimeSeriesData;
    private updatePerformanceWindow;
    private updateDerivedMetrics;
    private getTimeSeriesForRange;
    private calculateThroughputAtTime;
    private calculateSuccessRateAtTime;
    private calculateLatencyAtTime;
    private calculateWindowThroughput;
    private calculateWindowErrorRate;
    private calculateWindowLatency;
    private calculateTrend;
    private setupDefaultAlerts;
    private checkAlerts;
    private getMetricValue;
    private evaluateAlertCondition;
    private startMetricsCollection;
    private cleanupOldData;
}
export {};
//# sourceMappingURL=BatchMetrics.d.ts.map