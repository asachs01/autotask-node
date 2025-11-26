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
export const DEFAULT_MEMORY_CONFIG: MemoryTrackerConfig = {
  sampleInterval: 1000, // 1 second
  maxSamples: 300, // 5 minutes at 1s intervals
  enableGCMonitoring: true,
  leakThreshold: 1, // 1MB per minute
  alertThreshold: 500 * 1024 * 1024, // 500MB
};

/**
 * Memory usage tracker
 */
export class MemoryTracker extends EventEmitter {
  private config: MemoryTrackerConfig;
  private logger: winston.Logger;
  private samples: MemorySnapshot[] = [];
  private peakSnapshot?: MemorySnapshot;
  private startTime = Date.now();
  private sampleTimer?: ReturnType<typeof setInterval>;
  private isTracking = false;
  private gcStats = {
    count: 0,
    totalTime: 0,
    maxTime: 0,
    samples: [] as number[],
  };

  constructor(
    logger: winston.Logger,
    config: Partial<MemoryTrackerConfig> = {}
  ) {
    super();
    this.config = { ...DEFAULT_MEMORY_CONFIG, ...config };
    this.logger = logger;
  }

  /**
   * Start memory tracking
   */
  start(): void {
    if (this.isTracking) {
      return;
    }

    this.isTracking = true;
    this.startTime = Date.now();
    this.samples = [];
    this.peakSnapshot = undefined;
    this.gcStats = {
      count: 0,
      totalTime: 0,
      maxTime: 0,
      samples: [],
    };

    // Take initial snapshot
    this.takeSample();

    // Start periodic sampling
    this.sampleTimer = setInterval(() => {
      this.takeSample();
    }, this.config.sampleInterval);

    // Setup GC monitoring if enabled
    if (this.config.enableGCMonitoring) {
      this.setupGCMonitoring();
    }

    this.logger.info('Memory tracking started', {
      sampleInterval: this.config.sampleInterval,
      maxSamples: this.config.maxSamples,
    });
  }

  /**
   * Stop memory tracking
   */
  stop(): void {
    if (!this.isTracking) {
      return;
    }

    this.isTracking = false;

    if (this.sampleTimer) {
      clearInterval(this.sampleTimer);
      this.sampleTimer = undefined;
    }

    this.logger.info('Memory tracking stopped', {
      totalSamples: this.samples.length,
      duration: Date.now() - this.startTime,
    });
  }

  /**
   * Get current memory statistics
   */
  getStats(): MemoryStats {
    const current = this.getCurrentSnapshot();
    const peak = this.peakSnapshot || current;

    // Calculate averages
    const totalSamples = this.samples.length;
    const average =
      totalSamples > 0
        ? {
            heapUsed:
              this.samples.reduce((sum, s) => sum + s.heapUsed, 0) /
              totalSamples,
            heapTotal:
              this.samples.reduce((sum, s) => sum + s.heapTotal, 0) /
              totalSamples,
            rss: this.samples.reduce((sum, s) => sum + s.rss, 0) / totalSamples,
          }
        : {
            heapUsed: 0,
            heapTotal: 0,
            rss: 0,
          };

    // Calculate growth rate
    const growthRate = this.calculateGrowthRate();

    // Calculate GC stats
    const gcStats = {
      count: this.gcStats.count,
      totalTime: this.gcStats.totalTime,
      averageTime:
        this.gcStats.count > 0
          ? this.gcStats.totalTime / this.gcStats.count
          : 0,
      maxTime: this.gcStats.maxTime,
    };

    // Detect memory leak indicators
    const leakIndicators = this.detectMemoryLeak();

    return {
      current,
      peak,
      average,
      growthRate,
      gcStats,
      leakIndicators,
      duration: Date.now() - this.startTime,
    };
  }

  /**
   * Get memory snapshots
   */
  getSnapshots(): MemorySnapshot[] {
    return [...this.samples];
  }

  /**
   * Get current memory usage
   */
  getCurrentMemory(): MemorySnapshot {
    return this.getCurrentSnapshot();
  }

  /**
   * Get peak memory usage in bytes
   */
  getPeakMemoryUsage(): number {
    return this.peakSnapshot ? this.peakSnapshot.heapUsed : 0;
  }

  /**
   * Get memory history as MemoryMetrics array
   * Converts MemorySnapshot to MemoryMetrics format for compatibility
   */
  getMemoryHistory(): MemoryMetrics[] {
    return this.samples.map(snapshot => this.snapshotToMetrics(snapshot));
  }

  /**
   * Convert a MemorySnapshot to MemoryMetrics format
   */
  private snapshotToMetrics(snapshot: MemorySnapshot): MemoryMetrics {
    return {
      heapUsed: snapshot.heapUsed / (1024 * 1024), // Convert to MB
      heapTotal: snapshot.heapTotal / (1024 * 1024), // Convert to MB
      external: snapshot.external / (1024 * 1024), // Convert to MB
      rss: snapshot.rss / (1024 * 1024), // Convert to MB
      activeHandles: (process as any)._getActiveHandles?.()?.length ?? 0,
      activeRequests: (process as any)._getActiveRequests?.()?.length ?? 0,
      gcCount: this.gcStats.count,
      lastGcDuration:
        this.gcStats.samples.length > 0
          ? this.gcStats.samples[this.gcStats.samples.length - 1]
          : undefined,
    };
  }

  /**
   * Force garbage collection (if available)
   */
  forceGC(): boolean {
    if (global.gc) {
      const before = process.memoryUsage().heapUsed;
      const startTime = Date.now();

      global.gc();

      const after = process.memoryUsage().heapUsed;
      const gcTime = Date.now() - startTime;
      const freed = before - after;

      this.logger.info('Manual GC triggered', {
        freedMemory: freed,
        gcTime,
        before: this.formatBytes(before),
        after: this.formatBytes(after),
      });

      return true;
    }

    this.logger.warn('GC not available - run with --expose-gc flag');
    return false;
  }

  /**
   * Get memory usage summary
   */
  getSummary(): {
    current: string;
    peak: string;
    average: string;
    growthRate: string;
    leakDetected: boolean;
  } {
    const stats = this.getStats();

    return {
      current: this.formatBytes(stats.current.heapUsed),
      peak: this.formatBytes(stats.peak.heapUsed),
      average: this.formatBytes(stats.average.heapUsed),
      growthRate: `${(stats.growthRate / (1024 * 1024)).toFixed(2)} MB/min`,
      leakDetected: stats.leakIndicators.suspected,
    };
  }

  /**
   * Reset tracking statistics
   */
  reset(): void {
    this.samples = [];
    this.peakSnapshot = undefined;
    this.startTime = Date.now();
    this.gcStats = {
      count: 0,
      totalTime: 0,
      maxTime: 0,
      samples: [],
    };

    this.logger.info('Memory tracker reset');
  }

  /**
   * Take a memory sample
   */
  private takeSample(): void {
    const snapshot = this.getCurrentSnapshot();

    // Update peak if necessary
    if (!this.peakSnapshot || snapshot.heapUsed > this.peakSnapshot.heapUsed) {
      this.peakSnapshot = snapshot;
    }

    // Add to samples with size limit
    this.samples.push(snapshot);
    if (this.samples.length > this.config.maxSamples) {
      this.samples.shift();
    }

    // Check for high memory usage
    if (snapshot.heapUsed > this.config.alertThreshold) {
      this.emit('high_memory', {
        current: snapshot.heapUsed,
        threshold: this.config.alertThreshold,
        formatted: this.formatBytes(snapshot.heapUsed),
      });
    }

    // Check for memory leak
    const leakIndicators = this.detectMemoryLeak();
    if (leakIndicators.suspected && leakIndicators.confidence > 0.8) {
      this.emit('memory_leak_suspected', leakIndicators);
    }
  }

  /**
   * Get current memory snapshot
   */
  private getCurrentSnapshot(): MemorySnapshot {
    const mem = process.memoryUsage();

    return {
      timestamp: Date.now(),
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      rss: mem.rss,
      external: mem.external,
      arrayBuffers: mem.arrayBuffers || 0,
    };
  }

  /**
   * Calculate memory growth rate (bytes per minute)
   */
  private calculateGrowthRate(): number {
    if (this.samples.length < 2) {
      return 0;
    }

    const first = this.samples[0];
    const last = this.samples[this.samples.length - 1];
    const timeDiff = (last.timestamp - first.timestamp) / 60000; // Convert to minutes

    if (timeDiff === 0) {
      return 0;
    }

    return (last.heapUsed - first.heapUsed) / timeDiff;
  }

  /**
   * Detect memory leak indicators
   */
  private detectMemoryLeak(): {
    suspected: boolean;
    growthTrend: 'stable' | 'growing' | 'declining';
    confidence: number;
  } {
    if (this.samples.length < 10) {
      return {
        suspected: false,
        growthTrend: 'stable',
        confidence: 0,
      };
    }

    const growthRate = this.calculateGrowthRate();
    const growthRateMB = growthRate / (1024 * 1024);

    // Analyze trend
    const recentSamples = this.samples.slice(-20);
    const midPoint = Math.floor(recentSamples.length / 2);
    const firstHalf = recentSamples.slice(0, midPoint);
    const secondHalf = recentSamples.slice(midPoint);

    const avgFirst =
      firstHalf.reduce((sum, s) => sum + s.heapUsed, 0) / firstHalf.length;
    const avgSecond =
      secondHalf.reduce((sum, s) => sum + s.heapUsed, 0) / secondHalf.length;

    const trendDiff = avgSecond - avgFirst;
    const trendPercent = (trendDiff / avgFirst) * 100;

    let growthTrend: 'stable' | 'growing' | 'declining';
    if (trendPercent > 5) {
      growthTrend = 'growing';
    } else if (trendPercent < -5) {
      growthTrend = 'declining';
    } else {
      growthTrend = 'stable';
    }

    // Calculate confidence
    const confidence = Math.min(
      Math.abs(growthRateMB) / this.config.leakThreshold,
      1.0
    );

    const suspected =
      growthTrend === 'growing' && growthRateMB > this.config.leakThreshold;

    return {
      suspected,
      growthTrend,
      confidence,
    };
  }

  /**
   * Setup GC monitoring
   */
  private setupGCMonitoring(): void {
    // Note: GC monitoring requires --expose-gc flag
    // This is a placeholder for GC event handling
    // In production, use performance hooks or external monitoring

    if (typeof global.gc !== 'function') {
      this.logger.warn('GC monitoring unavailable - run with --expose-gc');
      return;
    }

    this.logger.info('GC monitoring enabled', {
      note: 'GC statistics will be tracked when global.gc() is called',
    });
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }

    return `${value.toFixed(2)} ${units[unitIndex]}`;
  }
}
