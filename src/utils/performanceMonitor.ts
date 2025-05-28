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
export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private recentTimings: RequestTiming[] = [];
  private readonly maxTimingsHistory = 1000;

  constructor(private logger: winston.Logger) {
    this.metrics = this.initializeMetrics();
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      requestCount: 0,
      successCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      totalResponseTime: 0,
      requestsPerSecond: 0,
      errorRate: 0,
      lastRequestTime: 0,
      startTime: Date.now(),
    };
  }

  /**
   * Record a request timing
   */
  recordRequest(timing: RequestTiming): void {
    this.metrics.requestCount++;
    this.metrics.lastRequestTime = timing.endTime;
    this.metrics.totalResponseTime += timing.duration;

    if (timing.success) {
      this.metrics.successCount++;
    } else {
      this.metrics.errorCount++;
    }

    // Update min/max response times
    if (timing.duration < this.metrics.minResponseTime) {
      this.metrics.minResponseTime = timing.duration;
    }
    if (timing.duration > this.metrics.maxResponseTime) {
      this.metrics.maxResponseTime = timing.duration;
    }

    // Calculate average response time
    this.metrics.averageResponseTime =
      this.metrics.totalResponseTime / this.metrics.requestCount;

    // Calculate error rate
    this.metrics.errorRate =
      (this.metrics.errorCount / this.metrics.requestCount) * 100;

    // Calculate requests per second
    const elapsedSeconds = (Date.now() - this.metrics.startTime) / 1000;
    this.metrics.requestsPerSecond = this.metrics.requestCount / elapsedSeconds;

    // Store timing for detailed analysis
    this.recentTimings.push(timing);
    if (this.recentTimings.length > this.maxTimingsHistory) {
      this.recentTimings.shift();
    }

    // Log performance warnings
    this.checkPerformanceThresholds(timing);
  }

  /**
   * Check for performance issues and log warnings
   */
  private checkPerformanceThresholds(timing: RequestTiming): void {
    // Slow request warning (>5 seconds)
    if (timing.duration > 5000) {
      this.logger.warn('Slow request detected', {
        endpoint: timing.endpoint,
        method: timing.method,
        duration: timing.duration,
        statusCode: timing.statusCode,
      });
    }

    // High error rate warning (>10%)
    if (this.metrics.errorRate > 10 && this.metrics.requestCount > 10) {
      this.logger.warn('High error rate detected', {
        errorRate: this.metrics.errorRate.toFixed(2),
        errorCount: this.metrics.errorCount,
        totalRequests: this.metrics.requestCount,
      });
    }

    // Low requests per second warning (<0.1 RPS for sustained period)
    if (this.metrics.requestsPerSecond < 0.1 && this.metrics.requestCount > 5) {
      this.logger.warn('Low request throughput detected', {
        requestsPerSecond: this.metrics.requestsPerSecond.toFixed(3),
        totalRequests: this.metrics.requestCount,
      });
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

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
    endpointStats: Record<
      string,
      {
        count: number;
        averageTime: number;
        errorCount: number;
        errorRate: number;
      }
    >;
  } {
    const sortedDurations = this.recentTimings
      .map(t => t.duration)
      .sort((a, b) => a - b);

    const percentiles = {
      p50: this.getPercentile(sortedDurations, 50),
      p90: this.getPercentile(sortedDurations, 90),
      p95: this.getPercentile(sortedDurations, 95),
      p99: this.getPercentile(sortedDurations, 99),
    };

    const endpointStats: Record<string, any> = {};
    this.recentTimings.forEach(timing => {
      const key = `${timing.method} ${timing.endpoint}`;
      if (!endpointStats[key]) {
        endpointStats[key] = {
          count: 0,
          totalTime: 0,
          errorCount: 0,
        };
      }
      endpointStats[key].count++;
      endpointStats[key].totalTime += timing.duration;
      if (!timing.success) {
        endpointStats[key].errorCount++;
      }
    });

    // Calculate averages and error rates for endpoints
    Object.keys(endpointStats).forEach(key => {
      const stats = endpointStats[key];
      stats.averageTime = stats.totalTime / stats.count;
      stats.errorRate = (stats.errorCount / stats.count) * 100;
      delete stats.totalTime; // Remove intermediate calculation
    });

    return {
      metrics: this.getMetrics(),
      recentTimings: [...this.recentTimings],
      percentiles,
      endpointStats,
    };
  }

  /**
   * Calculate percentile from sorted array
   */
  private getPercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;

    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))];
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = this.initializeMetrics();
    this.recentTimings = [];
    this.logger.info('Performance metrics reset');
  }

  /**
   * Log current performance summary
   */
  logSummary(): void {
    const report = this.getDetailedReport();

    this.logger.info('Performance Summary', {
      totalRequests: report.metrics.requestCount,
      successRate: (
        (report.metrics.successCount / report.metrics.requestCount) *
        100
      ).toFixed(2),
      errorRate: report.metrics.errorRate.toFixed(2),
      averageResponseTime: report.metrics.averageResponseTime.toFixed(2),
      requestsPerSecond: report.metrics.requestsPerSecond.toFixed(2),
      percentiles: {
        p50: report.percentiles.p50.toFixed(2),
        p95: report.percentiles.p95.toFixed(2),
        p99: report.percentiles.p99.toFixed(2),
      },
    });
  }

  /**
   * Start a request timer
   */
  startTimer(endpoint: string, method: string): () => void {
    const startTime = Date.now();

    return (statusCode?: number, error?: string) => {
      const endTime = Date.now();
      const duration = endTime - startTime;

      this.recordRequest({
        startTime,
        endTime,
        duration,
        endpoint,
        method,
        statusCode,
        success: !error && (statusCode ? statusCode < 400 : true),
        error,
      });
    };
  }
}
