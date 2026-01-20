import { EventEmitter } from 'events';
import winston from 'winston';
import { ConnectionPoolMetrics } from '../types/PerformanceTypes';
/**
 * Connection pool monitoring and optimization system
 *
 * Monitors HTTP/HTTPS connection pools, tracks efficiency,
 * and provides insights for connection optimization.
 */
export declare class ConnectionPoolMonitor extends EventEmitter {
    private logger;
    private poolMetrics;
    private isMonitoring;
    private monitoringInterval?;
    private connectionEvents;
    constructor(logger: winston.Logger);
    /**
     * Start connection pool monitoring
     */
    start(): void;
    /**
     * Stop connection pool monitoring
     */
    stop(): void;
    /**
     * Get current connection pool metrics
     */
    getMetrics(): ConnectionPoolMetrics;
    /**
     * Get connection pool metrics history
     */
    getMetricsHistory(): ConnectionPoolMetrics[];
    /**
     * Get connection efficiency analysis
     */
    getEfficiencyAnalysis(): {
        overall: number;
        trends: {
            efficiency: Array<{
                timestamp: number;
                value: number;
            }>;
            acquisitionTime: Array<{
                timestamp: number;
                value: number;
            }>;
            poolUtilization: Array<{
                timestamp: number;
                value: number;
            }>;
        };
        recommendations: string[];
        alerts: Array<{
            type: string;
            message: string;
            severity: 'low' | 'medium' | 'high';
            timestamp: number;
        }>;
    };
    /**
     * Record connection acquisition timing
     */
    recordConnectionAcquisition(poolName: string, acquisitionTime: number): void;
    /**
     * Record connection creation
     */
    recordConnectionCreated(poolName: string): void;
    /**
     * Record connection destruction
     */
    recordConnectionDestroyed(poolName: string): void;
    /**
     * Get optimization recommendations
     */
    getOptimizationRecommendations(): {
        poolSize: {
            current: number;
            recommended: number;
            reason: string;
        };
        keepAlive: {
            current: boolean;
            recommended: boolean;
            reason: string;
        };
        timeout: {
            current: number;
            recommended: number;
            reason: string;
        };
    };
    /**
     * Reset monitoring data
     */
    reset(): void;
    private setupConnectionTracking;
    private sampleConnectionPools;
    private getCurrentPoolMetrics;
    private calculateOptimalPoolSize;
    private getPoolSizeRecommendationReason;
    private calculateOptimalTimeout;
    private getTimeoutRecommendationReason;
    private getEmptyMetrics;
}
//# sourceMappingURL=ConnectionPoolMonitor.d.ts.map