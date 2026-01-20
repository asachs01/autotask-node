import winston from 'winston';
/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
    requestCount: number;
    successCount: number;
    errorCount: number;
    averageResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    totalResponseTime: number;
    requestsPerSecond: number;
    errorRate: number;
    lastRequestTime: number;
    startTime: number;
}
/**
 * Request timing information
 */
export interface RequestTiming {
    startTime: number;
    endTime: number;
    duration: number;
    endpoint: string;
    method: string;
    statusCode?: number;
    success: boolean;
    error?: string;
}
/**
 * Performance monitor for tracking API request metrics
 */
export declare class PerformanceMonitor {
    private logger;
    private metrics;
    private recentTimings;
    private readonly maxTimingsHistory;
    constructor(logger: winston.Logger);
    private initializeMetrics;
    /**
     * Record a request timing
     */
    recordRequest(timing: RequestTiming): void;
    /**
     * Check for performance issues and log warnings
     */
    private checkPerformanceThresholds;
    /**
     * Get current performance metrics
     */
    getMetrics(): PerformanceMetrics;
    /**
     * Get detailed performance report
     */
    getDetailedReport(): {
        metrics: PerformanceMetrics;
        recentTimings: RequestTiming[];
        percentiles: {
            p50: number;
            p90: number;
            p95: number;
            p99: number;
        };
        endpointStats: Record<string, {
            count: number;
            averageTime: number;
            errorCount: number;
            errorRate: number;
        }>;
    };
    /**
     * Calculate percentile from sorted array
     */
    private getPercentile;
    /**
     * Reset all metrics
     */
    reset(): void;
    /**
     * Log current performance summary
     */
    logSummary(): void;
    /**
     * Start a request timer
     */
    startTimer(endpoint: string, method: string): () => void;
}
//# sourceMappingURL=performanceMonitor.d.ts.map