/**
 * Cache Metrics Collection and Analysis System
 *
 * Comprehensive metrics collection for cache performance monitoring,
 * with real-time statistics, trends analysis, and alerting capabilities.
 */
import { EventEmitter } from 'events';
import { CacheMetrics, EntityCacheMetrics } from './types';
/**
 * Metric event types for monitoring
 */
export declare enum MetricEvent {
    CACHE_HIT = "cache_hit",
    CACHE_MISS = "cache_miss",
    CACHE_SET = "cache_set",
    CACHE_DELETE = "cache_delete",
    CACHE_EVICTION = "cache_eviction",
    CACHE_ERROR = "cache_error",
    METRIC_THRESHOLD_EXCEEDED = "metric_threshold_exceeded"
}
/**
 * Metric data point
 */
export interface MetricDataPoint {
    /** Timestamp of the metric */
    timestamp: number;
    /** Metric type */
    type: MetricEvent;
    /** Entity type */
    entityType: string;
    /** Operation duration in milliseconds */
    duration: number;
    /** Cache key */
    key: string;
    /** Additional metadata */
    metadata?: Record<string, any>;
}
/**
 * Threshold configuration for alerts
 */
export interface MetricThreshold {
    /** Metric name */
    metric: string;
    /** Threshold value */
    value: number;
    /** Comparison operator */
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    /** Threshold description */
    description: string;
    /** Whether the threshold is enabled */
    enabled: boolean;
}
/**
 * Time window for metrics aggregation
 */
export interface TimeWindow {
    /** Window duration in milliseconds */
    duration: number;
    /** Window start timestamp */
    start: number;
    /** Window end timestamp */
    end: number;
}
/**
 * Historical metrics data
 */
export interface HistoricalMetrics {
    /** Time window */
    window: TimeWindow;
    /** Metrics snapshot */
    metrics: CacheMetrics;
    /** Number of operations in this window */
    operationCount: number;
}
/**
 * Cache metrics collector and analyzer
 */
export declare class CacheMetricsCollector extends EventEmitter {
    private metrics;
    private entityMetrics;
    private dataPoints;
    private thresholds;
    private historicalData;
    private readonly maxDataPoints;
    private readonly maxHistoricalWindows;
    private metricsTimer?;
    constructor(maxDataPoints?: number, maxHistoricalWindows?: number);
    /**
     * Record a cache hit
     */
    recordHit(entityType: string, key: string, duration: number, metadata?: Record<string, any>): void;
    /**
     * Record a cache miss
     */
    recordMiss(entityType: string, key: string, duration: number, metadata?: Record<string, any>): void;
    /**
     * Record a cache set operation
     */
    recordSet(entityType: string, key: string, size: number, ttl: number, metadata?: Record<string, any>): void;
    /**
     * Record a cache delete operation
     */
    recordDelete(entityType: string, key: string, size?: number, metadata?: Record<string, any>): void;
    /**
     * Record a cache eviction
     */
    recordEviction(entityType: string, key: string, reason: string, size?: number): void;
    /**
     * Record a cache error
     */
    recordError(entityType: string, operation: string, error: Error, metadata?: Record<string, any>): void;
    /**
     * Get current metrics snapshot
     */
    getMetrics(): CacheMetrics;
    /**
     * Get metrics for a specific entity type
     */
    getEntityMetrics(entityType: string): EntityCacheMetrics | undefined;
    /**
     * Get historical metrics
     */
    getHistoricalMetrics(hours?: number): HistoricalMetrics[];
    /**
     * Get metrics summary over time period
     */
    getMetricsSummary(startTime: number, endTime: number): {
        totalHits: number;
        totalMisses: number;
        avgHitRate: number;
        avgResponseTime: number;
        totalOperations: number;
    };
    /**
     * Add metric threshold for alerting
     */
    addThreshold(threshold: MetricThreshold): void;
    /**
     * Remove metric threshold
     */
    removeThreshold(metric: string): boolean;
    /**
     * Get all configured thresholds
     */
    getThresholds(): MetricThreshold[];
    /**
     * Reset all metrics
     */
    reset(): void;
    /**
     * Export metrics data
     */
    exportMetrics(): {
        metrics: CacheMetrics;
        dataPoints: MetricDataPoint[];
        historicalData: HistoricalMetrics[];
        thresholds: MetricThreshold[];
    };
    /**
     * Start metrics aggregation timer
     */
    private startMetricsAggregation;
    /**
     * Stop metrics collection
     */
    shutdown(): void;
    /**
     * Record a data point and maintain buffer size
     */
    private recordDataPoint;
    /**
     * Update entity-specific metrics
     */
    private updateEntityMetric;
    /**
     * Update entity memory usage
     */
    private updateEntityMemoryUsage;
    /**
     * Update entity TTL average
     */
    private updateEntityTtl;
    /**
     * Update overall hit rate
     */
    private updateHitRate;
    /**
     * Update average response time
     */
    private updateAverageResponseTime;
    /**
     * Update operations per second
     */
    private updateOperationsPerSecond;
    /**
     * Aggregate hourly metrics for historical tracking
     */
    private aggregateHourlyMetrics;
    /**
     * Check metric thresholds and emit events
     */
    private checkThresholds;
    /**
     * Check if threshold condition is met
     */
    private checkThresholdCondition;
    /**
     * Initialize default threshold configurations
     */
    private initializeDefaultThresholds;
    /**
     * Create empty metrics object
     */
    private createEmptyMetrics;
}
//# sourceMappingURL=CacheMetrics.d.ts.map