/**
 * Queue Monitor
 *
 * Comprehensive monitoring and observability system for the queue:
 * - Real-time metrics collection and analysis
 * - Performance trend analysis and alerting
 * - Health check monitoring with automatic recovery
 * - Capacity planning and prediction
 * - Operational dashboards and reporting
 */
import { EventEmitter } from 'events';
import winston from 'winston';
import { QueueMetrics, QueueHealth, QueueAlert } from '../types/QueueTypes';
export interface MonitoringConfig {
    metricsInterval: number;
    healthCheckInterval: number;
    alertThresholds: {
        queueUtilization: number;
        errorRate: number;
        averageWaitTime: number;
        processingTime: number;
        throughputDrop: number;
    };
    retentionPeriod: number;
    enablePredictiveAlerts: boolean;
}
export interface MetricsSnapshot {
    timestamp: Date;
    metrics: QueueMetrics;
    health: QueueHealth;
}
export interface PerformanceTrend {
    metric: string;
    direction: 'increasing' | 'decreasing' | 'stable';
    change: number;
    confidence: number;
    timeframe: number;
}
export interface CapacityPrediction {
    currentUtilization: number;
    predictedUtilization: number;
    timeToCapacity: number | null;
    recommendedActions: string[];
    confidence: number;
}
export declare class QueueMonitor extends EventEmitter {
    private config;
    private logger;
    private queueManager;
    private metricsHistory;
    private alertHistory;
    private eventHistory;
    private activeAlerts;
    private metricsInterval?;
    private healthCheckInterval?;
    private isMonitoring;
    private performanceBaseline;
    private baselineCalculated;
    constructor(queueManager: any, logger: winston.Logger, config?: Partial<MonitoringConfig>);
    /**
     * Initialize monitoring
     */
    initialize(): Promise<void>;
    /**
     * Start monitoring processes
     */
    startMonitoring(): Promise<void>;
    /**
     * Stop monitoring processes
     */
    stopMonitoring(): void;
    /**
     * Get current metrics
     */
    getCurrentMetrics(): Promise<QueueMetrics>;
    /**
     * Get current health status
     */
    getCurrentHealth(): Promise<QueueHealth>;
    /**
     * Get metrics history
     */
    getMetricsHistory(timeframe?: number): MetricsSnapshot[];
    /**
     * Get active alerts
     */
    getActiveAlerts(): QueueAlert[];
    /**
     * Get alert history
     */
    getAlertHistory(timeframe?: number): QueueAlert[];
    /**
     * Analyze performance trends
     */
    analyzePerformanceTrends(timeframe?: number): PerformanceTrend[];
    /**
     * Predict capacity requirements
     */
    predictCapacity(forecastMinutes?: number): CapacityPrediction;
    /**
     * Generate monitoring report
     */
    generateReport(timeframe?: number): {
        summary: any;
        metrics: QueueMetrics;
        health: QueueHealth;
        trends: PerformanceTrend[];
        capacity: CapacityPrediction;
        alerts: QueueAlert[];
        recommendations: string[];
    };
    /**
     * Shutdown monitoring
     */
    shutdown(): Promise<void>;
    /**
     * Collect metrics snapshot
     */
    private collectMetrics;
    /**
     * Perform health check
     */
    private performHealthCheck;
    /**
     * Check alert conditions
     */
    private checkAlertConditions;
    /**
     * Create an alert
     */
    private createAlert;
    /**
     * Resolve an alert
     */
    private resolveAlert;
    /**
     * Record an event
     */
    private recordEvent;
    /**
     * Calculate trend for a metric
     */
    private calculateTrend;
    /**
     * Calculate average for a metric across snapshots
     */
    private calculateAverage;
    /**
     * Calculate maximum for a metric across snapshots
     */
    private calculateMax;
    /**
     * Calculate performance baseline
     */
    private calculatePerformanceBaseline;
    /**
     * Generate recommendations based on current state
     */
    private generateRecommendations;
    /**
     * Clean up old data to prevent memory leaks
     */
    private cleanupOldData;
}
//# sourceMappingURL=QueueMonitor.d.ts.map