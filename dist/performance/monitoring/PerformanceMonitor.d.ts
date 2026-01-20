import { EventEmitter } from 'events';
import winston from 'winston';
import { PerformanceConfig, PerformanceMetrics, RequestMetrics, PerformanceThresholds, PerformanceReport, PerformanceProfile } from '../types/PerformanceTypes';
/**
 * Enterprise-grade performance monitoring system
 *
 * Provides comprehensive real-time monitoring of API performance,
 * memory usage, connection pools, and system resources with
 * intelligent alerting and detailed reporting capabilities.
 */
export declare class PerformanceMonitor extends EventEmitter {
    private logger;
    private readonly config;
    private readonly metricsCollector;
    private readonly memoryTracker;
    private readonly connectionPoolMonitor;
    private isMonitoring;
    private monitoringInterval?;
    private currentProfile?;
    private profiles;
    private thresholds;
    constructor(logger: winston.Logger, config?: PerformanceConfig);
    /**
     * Start performance monitoring
     */
    start(): void;
    /**
     * Stop performance monitoring
     */
    stop(): void;
    /**
     * Record a request for monitoring
     */
    recordRequest(request: RequestMetrics): void;
    /**
     * Get current performance metrics
     */
    getCurrentMetrics(): PerformanceMetrics;
    /**
     * Generate comprehensive performance report
     */
    generateReport(periodStart?: number, periodEnd?: number): PerformanceReport;
    /**
     * Start performance profiling
     */
    startProfiling(name: string): string;
    /**
     * Stop performance profiling
     */
    stopProfiling(): PerformanceProfile | null;
    /**
     * Add a marker to the current profile
     */
    addProfileMarker(name: string, data?: any): void;
    /**
     * Get stored performance profile
     */
    getProfile(profileId: string): PerformanceProfile | undefined;
    /**
     * Get all stored profiles
     */
    getAllProfiles(): PerformanceProfile[];
    /**
     * Update performance thresholds
     */
    updateThresholds(newThresholds: Partial<PerformanceThresholds>): void;
    /**
     * Get current performance thresholds
     */
    getThresholds(): PerformanceThresholds;
    /**
     * Clear all stored data
     */
    reset(): void;
    private setupEventHandlers;
    private startMetricsCollection;
    private checkPerformanceThresholds;
    private getCpuUsage;
    private getCacheHitRate;
    private generateRecommendations;
    private identifyTopPerformers;
    private identifyBottlenecks;
}
//# sourceMappingURL=PerformanceMonitor.d.ts.map