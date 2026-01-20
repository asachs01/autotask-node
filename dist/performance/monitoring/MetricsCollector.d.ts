import { EventEmitter } from 'events';
import winston from 'winston';
import { PerformanceConfig, PerformanceMetrics, RequestMetrics, PerformanceAlert } from '../types/PerformanceTypes';
/**
 * Metrics collection and aggregation system
 *
 * Collects, aggregates, and analyzes performance metrics
 * with intelligent trend detection and alerting.
 */
export declare class MetricsCollector extends EventEmitter {
    private logger;
    private config;
    private requestSamples;
    private metricsHistory;
    private endpointStats;
    private alerts;
    private isCollecting;
    private startTime;
    constructor(logger: winston.Logger, config: Required<PerformanceConfig>);
    /**
     * Start metrics collection
     */
    start(): void;
    /**
     * Stop metrics collection
     */
    stop(): void;
    /**
     * Record a request for metrics
     */
    recordRequest(request: RequestMetrics): void;
    /**
     * Get current aggregated metrics
     */
    getMetrics(): PerformanceMetrics;
    /**
     * Get metrics for specific endpoints
     */
    getEndpointMetrics(): Record<string, PerformanceMetrics>;
    /**
     * Get performance trends over time
     */
    getTrends(startTime: number, endTime: number): {
        responseTime: Array<{
            timestamp: number;
            value: number;
        }>;
        throughput: Array<{
            timestamp: number;
            value: number;
        }>;
        errorRate: Array<{
            timestamp: number;
            value: number;
        }>;
        memoryUsage: Array<{
            timestamp: number;
            value: number;
        }>;
    };
    /**
     * Get alerts for a time period
     */
    getAlerts(startTime: number, endTime: number): PerformanceAlert[];
    /**
     * Get recent request samples
     */
    getRecentRequests(limit?: number): RequestMetrics[];
    /**
     * Calculate performance percentiles
     */
    getPercentiles(): {
        p50: number;
        p75: number;
        p90: number;
        p95: number;
        p99: number;
    };
    /**
     * Reset all collected metrics
     */
    reset(): void;
    private updateEndpointStats;
    private checkForAlerts;
    private calculatePercentile;
    private getEmptyMetrics;
}
//# sourceMappingURL=MetricsCollector.d.ts.map