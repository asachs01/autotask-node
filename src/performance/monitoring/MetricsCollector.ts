import { EventEmitter } from 'events';
import winston from 'winston';
import {
  PerformanceConfig,
  PerformanceMetrics,
  RequestMetrics,
  PerformanceAlert
} from '../types/PerformanceTypes';

/**
 * Metrics collection and aggregation system
 * 
 * Collects, aggregates, and analyzes performance metrics
 * with intelligent trend detection and alerting.
 */
export class MetricsCollector extends EventEmitter {
  private requestSamples: RequestMetrics[] = [];
  private metricsHistory: PerformanceMetrics[] = [];
  private endpointStats = new Map<string, {
    count: number;
    totalTime: number;
    errors: number;
    sizes: { request: number; response: number };
    lastUpdated: number;
  }>();
  private alerts: PerformanceAlert[] = [];

  private isCollecting = false;
  private startTime = Date.now();

  constructor(
    private logger: winston.Logger,
    private config: Required<PerformanceConfig>
  ) {
    super();
  }

  /**
   * Start metrics collection
   */
  start(): void {
    if (this.isCollecting) return;
    
    this.isCollecting = true;
    this.startTime = Date.now();
    this.logger.info('Metrics collection started');
  }

  /**
   * Stop metrics collection
   */
  stop(): void {
    this.isCollecting = false;
    this.logger.info('Metrics collection stopped');
  }

  /**
   * Record a request for metrics
   */
  recordRequest(request: RequestMetrics): void {
    if (!this.isCollecting) return;

    // Add to samples with size limit
    this.requestSamples.push(request);
    if (this.requestSamples.length > this.config.maxSamples) {
      this.requestSamples.shift();
    }

    // Update endpoint statistics
    this.updateEndpointStats(request);

    // Check for alerts
    this.checkForAlerts(request);
  }

  /**
   * Get current aggregated metrics
   */
  getMetrics(): PerformanceMetrics {
    if (this.requestSamples.length === 0) {
      return this.getEmptyMetrics();
    }

    const now = Date.now();
    const elapsedSeconds = (now - this.startTime) / 1000;
    
    const completedRequests = this.requestSamples.filter(r => r.responseTime !== undefined);
    const successfulRequests = completedRequests.filter(r => r.success === true);
    const failedRequests = completedRequests.filter(r => r.success === false);
    
    const responseTimes = completedRequests
      .map(r => r.responseTime!)
      .filter(t => t > 0);

    const totalRequests = completedRequests.length;
    const successCount = successfulRequests.length;
    const errorCount = failedRequests.length;

    const metrics: PerformanceMetrics = {
      totalRequests,
      successfulRequests: successCount,
      failedRequests: errorCount,
      averageResponseTime: responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0,
      minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
      maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      throughput: elapsedSeconds > 0 ? totalRequests / elapsedSeconds : 0,
      errorRate: totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0,
      memoryUsage: 0, // Will be filled by PerformanceMonitor
      peakMemoryUsage: 0, // Will be filled by PerformanceMonitor
      cpuUsage: 0, // Will be filled by PerformanceMonitor
      activeConnections: 0, // Will be filled by PerformanceMonitor
      poolEfficiency: 0, // Will be filled by PerformanceMonitor
      cacheHitRate: 0, // Will be filled by PerformanceMonitor
      timestamp: now
    };

    // Store metrics history
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > this.config.maxSamples) {
      this.metricsHistory.shift();
    }

    return metrics;
  }

  /**
   * Get metrics for specific endpoints
   */
  getEndpointMetrics(): Record<string, PerformanceMetrics> {
    const endpointMetrics: Record<string, PerformanceMetrics> = {};
    const now = Date.now();

    for (const [endpoint, stats] of this.endpointStats.entries()) {
      const endpointRequests = this.requestSamples.filter(r => 
        `${r.method} ${r.endpoint}` === endpoint
      );

      if (endpointRequests.length === 0) continue;

      const completedRequests = endpointRequests.filter(r => r.responseTime !== undefined);
      const responseTimes = completedRequests
        .map(r => r.responseTime!)
        .filter(t => t > 0);

      const elapsedSeconds = (now - this.startTime) / 1000;
      const successCount = completedRequests.filter(r => r.success === true).length;
      const totalRequests = completedRequests.length;

      endpointMetrics[endpoint] = {
        totalRequests,
        successfulRequests: successCount,
        failedRequests: totalRequests - successCount,
        averageResponseTime: responseTimes.length > 0 
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
          : 0,
        minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
        maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
        throughput: elapsedSeconds > 0 ? totalRequests / elapsedSeconds : 0,
        errorRate: totalRequests > 0 ? ((totalRequests - successCount) / totalRequests) * 100 : 0,
        memoryUsage: 0,
        peakMemoryUsage: 0,
        cpuUsage: 0,
        activeConnections: 0,
        poolEfficiency: 0,
        cacheHitRate: 0,
        timestamp: now
      };
    }

    return endpointMetrics;
  }

  /**
   * Get performance trends over time
   */
  getTrends(startTime: number, endTime: number): {
    responseTime: Array<{ timestamp: number; value: number }>;
    throughput: Array<{ timestamp: number; value: number }>;
    errorRate: Array<{ timestamp: number; value: number }>;
    memoryUsage: Array<{ timestamp: number; value: number }>;
  } {
    const filteredMetrics = this.metricsHistory.filter(m => 
      m.timestamp >= startTime && m.timestamp <= endTime
    );

    return {
      responseTime: filteredMetrics.map(m => ({
        timestamp: m.timestamp,
        value: m.averageResponseTime
      })),
      throughput: filteredMetrics.map(m => ({
        timestamp: m.timestamp,
        value: m.throughput
      })),
      errorRate: filteredMetrics.map(m => ({
        timestamp: m.timestamp,
        value: m.errorRate
      })),
      memoryUsage: filteredMetrics.map(m => ({
        timestamp: m.timestamp,
        value: m.memoryUsage
      }))
    };
  }

  /**
   * Get alerts for a time period
   */
  getAlerts(startTime: number, endTime: number): PerformanceAlert[] {
    return this.alerts.filter(alert => 
      alert.timestamp >= startTime && alert.timestamp <= endTime
    );
  }

  /**
   * Get recent request samples
   */
  getRecentRequests(limit: number = 100): RequestMetrics[] {
    return this.requestSamples.slice(-limit);
  }

  /**
   * Calculate performance percentiles
   */
  getPercentiles(): {
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
  } {
    const responseTimes = this.requestSamples
      .map(r => r.responseTime)
      .filter(t => t !== undefined && t > 0)
      .sort((a, b) => a! - b!);

    if (responseTimes.length === 0) {
      return { p50: 0, p75: 0, p90: 0, p95: 0, p99: 0 };
    }

    return {
      p50: this.calculatePercentile(responseTimes, 50),
      p75: this.calculatePercentile(responseTimes, 75),
      p90: this.calculatePercentile(responseTimes, 90),
      p95: this.calculatePercentile(responseTimes, 95),
      p99: this.calculatePercentile(responseTimes, 99)
    };
  }

  /**
   * Reset all collected metrics
   */
  reset(): void {
    this.requestSamples = [];
    this.metricsHistory = [];
    this.endpointStats.clear();
    this.alerts = [];
    this.startTime = Date.now();
    this.logger.info('Metrics collector reset');
  }

  private updateEndpointStats(request: RequestMetrics): void {
    const key = `${request.method} ${request.endpoint}`;
    const stats = this.endpointStats.get(key) || {
      count: 0,
      totalTime: 0,
      errors: 0,
      sizes: { request: 0, response: 0 },
      lastUpdated: Date.now()
    };

    stats.count++;
    stats.lastUpdated = Date.now();

    if (request.responseTime !== undefined) {
      stats.totalTime += request.responseTime;
    }

    if (request.success === false) {
      stats.errors++;
    }

    if (request.requestSize) {
      stats.sizes.request += request.requestSize;
    }

    if (request.responseSize) {
      stats.sizes.response += request.responseSize;
    }

    this.endpointStats.set(key, stats);
  }

  private checkForAlerts(request: RequestMetrics): void {
    // High response time alert
    if (request.responseTime && request.responseTime > 10000) {
      const alert: PerformanceAlert = {
        type: 'latency',
        severity: 'high',
        message: `Extremely slow request: ${request.endpoint}`,
        currentValue: request.responseTime,
        threshold: 10000,
        timestamp: Date.now(),
        context: {
          endpoint: request.endpoint,
          method: request.method,
          requestId: request.requestId
        }
      };

      this.alerts.push(alert);
      this.emit('alert', alert);
    }

    // Check for error patterns
    const recentErrors = this.requestSamples
      .slice(-10)
      .filter(r => r.success === false);

    if (recentErrors.length >= 5) {
      const alert: PerformanceAlert = {
        type: 'error_rate',
        severity: 'medium',
        message: 'High error rate detected in recent requests',
        currentValue: (recentErrors.length / 10) * 100,
        threshold: 50,
        timestamp: Date.now(),
        context: {
          recentErrors: recentErrors.length,
          totalRecent: 10
        }
      };

      this.alerts.push(alert);
      this.emit('alert', alert);
    }

    // Limit alerts history
    if (this.alerts.length > this.config.maxSamples) {
      this.alerts = this.alerts.slice(-this.config.maxSamples / 2);
    }
  }

  private calculatePercentile(sortedArray: (number | undefined)[], percentile: number): number {
    if (sortedArray.length === 0) return 0;

    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))] || 0;
  }

  private getEmptyMetrics(): PerformanceMetrics {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      throughput: 0,
      errorRate: 0,
      memoryUsage: 0,
      peakMemoryUsage: 0,
      cpuUsage: 0,
      activeConnections: 0,
      poolEfficiency: 0,
      cacheHitRate: 0,
      timestamp: Date.now()
    };
  }
}