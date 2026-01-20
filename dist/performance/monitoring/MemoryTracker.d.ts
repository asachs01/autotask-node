/**
 * Memory Usage Tracker
 *
 * Monitors memory usage patterns, detects leaks, and provides
 * detailed memory profiling for performance analysis.
 */
import { EventEmitter } from 'events';
import winston from 'winston';
import { MemoryMetrics } from '../types/PerformanceTypes';
/**
 * Memory snapshot data
 */
export interface MemorySnapshot {
    /** Timestamp of snapshot */
    timestamp: number;
    /** Heap used in bytes */
    heapUsed: number;
    /** Total heap size in bytes */
    heapTotal: number;
    /** Resident set size in bytes */
    rss: number;
    /** External memory in bytes */
    external: number;
    /** Array buffers in bytes */
    arrayBuffers: number;
}
/**
 * Memory tracking statistics
 */
export interface MemoryStats {
    /** Current memory usage */
    current: MemorySnapshot;
    /** Peak memory usage */
    peak: MemorySnapshot;
    /** Average memory usage */
    average: {
        heapUsed: number;
        heapTotal: number;
        rss: number;
    };
    /** Memory growth rate (bytes per minute) */
    growthRate: number;
    /** Garbage collection statistics */
    gcStats: {
        count: number;
        totalTime: number;
        averageTime: number;
        maxTime: number;
    };
    /** Memory leak indicators */
    leakIndicators: {
        suspected: boolean;
        growthTrend: 'stable' | 'growing' | 'declining';
        confidence: number;
    };
    /** Tracking duration in milliseconds */
    duration: number;
}
/**
 * Memory tracker configuration
 */
export interface MemoryTrackerConfig {
    /** Sampling interval in milliseconds */
    sampleInterval: number;
    /** Maximum number of samples to keep */
    maxSamples: number;
    /** Enable GC monitoring */
    enableGCMonitoring: boolean;
    /** Memory leak detection threshold (MB/minute) */
    leakThreshold: number;
    /** Alert on high memory usage (bytes) */
    alertThreshold: number;
}
/**
 * Default memory tracker configuration
 */
export declare const DEFAULT_MEMORY_CONFIG: MemoryTrackerConfig;
/**
 * Memory usage tracker
 */
export declare class MemoryTracker extends EventEmitter {
    private config;
    private logger;
    private samples;
    private peakSnapshot?;
    private startTime;
    private sampleTimer?;
    private isTracking;
    private gcStats;
    constructor(logger: winston.Logger, config?: Partial<MemoryTrackerConfig>);
    /**
     * Start memory tracking
     */
    start(): void;
    /**
     * Stop memory tracking
     */
    stop(): void;
    /**
     * Get current memory statistics
     */
    getStats(): MemoryStats;
    /**
     * Get memory snapshots
     */
    getSnapshots(): MemorySnapshot[];
    /**
     * Get current memory usage
     */
    getCurrentMemory(): MemorySnapshot;
    /**
     * Get peak memory usage in bytes
     */
    getPeakMemoryUsage(): number;
    /**
     * Get memory history as MemoryMetrics array
     * Converts MemorySnapshot to MemoryMetrics format for compatibility
     */
    getMemoryHistory(): MemoryMetrics[];
    /**
     * Convert a MemorySnapshot to MemoryMetrics format
     */
    private snapshotToMetrics;
    /**
     * Force garbage collection (if available)
     */
    forceGC(): boolean;
    /**
     * Get memory usage summary
     */
    getSummary(): {
        current: string;
        peak: string;
        average: string;
        growthRate: string;
        leakDetected: boolean;
    };
    /**
     * Reset tracking statistics
     */
    reset(): void;
    /**
     * Take a memory sample
     */
    private takeSample;
    /**
     * Get current memory snapshot
     */
    private getCurrentSnapshot;
    /**
     * Calculate memory growth rate (bytes per minute)
     */
    private calculateGrowthRate;
    /**
     * Detect memory leak indicators
     */
    private detectMemoryLeak;
    /**
     * Setup GC monitoring
     */
    private setupGCMonitoring;
    /**
     * Format bytes to human readable string
     */
    private formatBytes;
}
//# sourceMappingURL=MemoryTracker.d.ts.map