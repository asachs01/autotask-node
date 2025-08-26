import { EventEmitter } from 'events';
import winston from 'winston';
import {
  PerformanceConfig,
  PerformanceMetrics,
  RequestMetrics,
  MemoryMetrics,
  PerformanceAlert,
  PerformanceThresholds,
  PerformanceReport,
  PerformanceProfile
} from '../types/PerformanceTypes';
import { MetricsCollector } from './MetricsCollector';
import { MemoryTracker } from './MemoryTracker';
import { ConnectionPoolMonitor } from './ConnectionPoolMonitor';

/**
 * Enterprise-grade performance monitoring system
 * 
 * Provides comprehensive real-time monitoring of API performance,
 * memory usage, connection pools, and system resources with
 * intelligent alerting and detailed reporting capabilities.
 */
export class PerformanceMonitor extends EventEmitter {
  private readonly config: Required<PerformanceConfig>;
  private readonly metricsCollector: MetricsCollector;
  private readonly memoryTracker: MemoryTracker;
  private readonly connectionPoolMonitor: ConnectionPoolMonitor;
  
  private isMonitoring = false;
  private monitoringInterval?: ReturnType<typeof setTimeout>;
  private currentProfile?: PerformanceProfile;
  private profiles = new Map<string, PerformanceProfile>();
  
  private thresholds: PerformanceThresholds = {
    maxResponseTime: 5000, // 5 seconds
    maxErrorRate: 5, // 5%
    maxMemoryUsage: 512, // 512 MB
    maxCpuUsage: 80, // 80%
    minThroughput: 1, // 1 req/s
    minPoolEfficiency: 70 // 70%
  };

  constructor(
    private logger: winston.Logger,
    config: PerformanceConfig = {}
  ) {
    super();

    this.config = {
      enableRealTimeMetrics: true,
      metricsInterval: 5000, // 5 seconds
      maxSamples: 1000,
      enableMemoryLeakDetection: true,
      memoryWarningThreshold: 256, // 256 MB
      enableProfiling: false,
      enableRequestTracking: true,
      ...config
    };

    this.metricsCollector = new MetricsCollector(logger, this.config);
    this.memoryTracker = new MemoryTracker(logger, this.config);
    this.connectionPoolMonitor = new ConnectionPoolMonitor(logger);

    this.setupEventHandlers();
  }

  /**
   * Start performance monitoring
   */
  start(): void {
    if (this.isMonitoring) {
      this.logger.warn('Performance monitoring is already running');
      return;
    }

    this.logger.info('Starting performance monitoring system');
    this.isMonitoring = true;

    // Start sub-components
    this.metricsCollector.start();
    this.memoryTracker.start();
    this.connectionPoolMonitor.start();

    // Start periodic metrics collection
    if (this.config.enableRealTimeMetrics) {
      this.startMetricsCollection();
    }

    this.emit('started');
  }

  /**
   * Stop performance monitoring
   */
  stop(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.logger.info('Stopping performance monitoring system');
    this.isMonitoring = false;

    // Stop periodic collection
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    // Stop sub-components
    this.metricsCollector.stop();
    this.memoryTracker.stop();
    this.connectionPoolMonitor.stop();

    // Finalize any active profile
    if (this.currentProfile) {
      this.stopProfiling();
    }

    this.emit('stopped');
  }

  /**
   * Record a request for monitoring
   */
  recordRequest(request: RequestMetrics): void {
    this.metricsCollector.recordRequest(request);
    
    // Check for performance issues
    this.checkPerformanceThresholds(request);
    
    this.emit('request', request);
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics {
    const baseMetrics = this.metricsCollector.getMetrics();
    const memoryMetrics = this.memoryTracker.getCurrentMemory();
    const poolMetrics = this.connectionPoolMonitor.getMetrics();

    return {
      ...baseMetrics,
      memoryUsage: memoryMetrics.heapUsed,
      peakMemoryUsage: this.memoryTracker.getPeakMemoryUsage(),
      cpuUsage: this.getCpuUsage(),
      activeConnections: poolMetrics.activeConnections,
      poolEfficiency: poolMetrics.efficiency,
      cacheHitRate: this.getCacheHitRate(),
      timestamp: Date.now()
    };
  }

  /**
   * Generate comprehensive performance report
   */
  generateReport(periodStart?: number, periodEnd?: number): PerformanceReport {
    const end = periodEnd || Date.now();
    const start = periodStart || (end - 3600000); // Default: last hour

    const metrics = this.getCurrentMetrics();
    const endpointMetrics = this.metricsCollector.getEndpointMetrics();
    const trends = this.metricsCollector.getTrends(start, end);
    const alerts = this.metricsCollector.getAlerts(start, end);

    // Analyze performance to generate recommendations
    const recommendations = this.generateRecommendations(metrics, endpointMetrics);

    // Identify top performers and bottlenecks
    const topPerformers = this.identifyTopPerformers(endpointMetrics);
    const bottlenecks = this.identifyBottlenecks(endpointMetrics);

    return {
      timestamp: Date.now(),
      period: {
        start,
        end,
        duration: end - start
      },
      summary: metrics,
      endpoints: endpointMetrics,
      trends,
      alerts,
      topPerformers,
      bottlenecks,
      recommendations
    };
  }

  /**
   * Start performance profiling
   */
  startProfiling(name: string): string {
    if (this.currentProfile) {
      throw new Error('A profiling session is already active');
    }

    const profileId = `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentProfile = {
      id: profileId,
      name,
      startTime: Date.now(),
      markers: []
    };

    this.logger.info(`Started performance profiling: ${name}`, { profileId });

    // Start CPU profiling if available
    if (this.config.enableProfiling && (global as any).profiler) {
      (global as any).profiler.startProfiling(profileId);
    }

    this.emit('profile', this.currentProfile);
    return profileId;
  }

  /**
   * Stop performance profiling
   */
  stopProfiling(): PerformanceProfile | null {
    if (!this.currentProfile) {
      this.logger.warn('No active profiling session to stop');
      return null;
    }

    const profile = this.currentProfile;
    profile.endTime = Date.now();
    profile.duration = profile.endTime - profile.startTime;

    // Collect final metrics
    profile.memoryProfile = this.memoryTracker.getMemoryHistory();
    profile.requestSamples = this.metricsCollector.getRecentRequests();

    // Stop CPU profiling if available
    if (this.config.enableProfiling && (global as any).profiler) {
      profile.cpuProfile = (global as any).profiler.stopProfiling(profile.id);
    }

    this.profiles.set(profile.id, profile);
    this.currentProfile = undefined;

    this.logger.info(`Completed performance profiling: ${profile.name}`, {
      profileId: profile.id,
      duration: profile.duration
    });

    this.emit('profile', profile);
    return profile;
  }

  /**
   * Add a marker to the current profile
   */
  addProfileMarker(name: string, data?: any): void {
    if (!this.currentProfile) {
      return;
    }

    this.currentProfile.markers!.push({
      name,
      timestamp: Date.now(),
      data
    });
  }

  /**
   * Get stored performance profile
   */
  getProfile(profileId: string): PerformanceProfile | undefined {
    return this.profiles.get(profileId);
  }

  /**
   * Get all stored profiles
   */
  getAllProfiles(): PerformanceProfile[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Update performance thresholds
   */
  updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    this.logger.info('Updated performance thresholds', this.thresholds);
  }

  /**
   * Get current performance thresholds
   */
  getThresholds(): PerformanceThresholds {
    return { ...this.thresholds };
  }

  /**
   * Clear all stored data
   */
  reset(): void {
    this.metricsCollector.reset();
    this.memoryTracker.reset();
    this.connectionPoolMonitor.reset();
    this.profiles.clear();
    this.currentProfile = undefined;
    
    this.logger.info('Performance monitor reset');
  }

  private setupEventHandlers(): void {
    this.metricsCollector.on('alert', (alert: PerformanceAlert) => {
      this.emit('alert', alert);
    });

    this.memoryTracker.on('leak_detected', (data: any) => {
      const alert: PerformanceAlert = {
        type: 'memory',
        severity: 'high',
        message: 'Memory leak detected',
        currentValue: data.growthRate,
        threshold: this.thresholds.maxMemoryUsage!,
        timestamp: Date.now(),
        context: data
      };
      this.emit('alert', alert);
    });

    this.connectionPoolMonitor.on('efficiency_low', (data: any) => {
      const alert: PerformanceAlert = {
        type: 'throughput',
        severity: 'medium',
        message: 'Connection pool efficiency low',
        currentValue: data.efficiency,
        threshold: this.thresholds.minPoolEfficiency!,
        timestamp: Date.now(),
        context: data
      };
      this.emit('alert', alert);
    });
  }

  private startMetricsCollection(): void {
    this.monitoringInterval = setInterval(() => {
      if (!this.isMonitoring) return;

      const metrics = this.getCurrentMetrics();
      this.emit('metrics', metrics);

    }, this.config.metricsInterval);
  }

  private checkPerformanceThresholds(request: RequestMetrics): void {
    if (!request.responseTime || !request.success) {
      return;
    }

    // Check response time threshold
    if (request.responseTime > this.thresholds.maxResponseTime!) {
      const alert: PerformanceAlert = {
        type: 'latency',
        severity: request.responseTime > this.thresholds.maxResponseTime! * 2 ? 'critical' : 'high',
        message: `Slow request detected: ${request.endpoint}`,
        currentValue: request.responseTime,
        threshold: this.thresholds.maxResponseTime!,
        timestamp: Date.now(),
        context: {
          endpoint: request.endpoint,
          method: request.method,
          requestId: request.requestId
        }
      };
      this.emit('alert', alert);
    }
  }

  private getCpuUsage(): number {
    // Simplified CPU usage calculation
    // In production, you might want to use a more sophisticated method
    if (typeof process.cpuUsage === 'function') {
      const usage = process.cpuUsage();
      return (usage.user + usage.system) / 1000; // Convert to percentage approximation
    }
    return 0;
  }

  private getCacheHitRate(): number {
    // This would be implemented by the caching system
    // For now, return a placeholder value
    return 85; // 85% cache hit rate
  }

  private generateRecommendations(
    metrics: PerformanceMetrics,
    endpointMetrics: Record<string, PerformanceMetrics>
  ): string[] {
    const recommendations: string[] = [];

    // Memory recommendations
    if (metrics.memoryUsage > this.thresholds.maxMemoryUsage! * 0.8) {
      recommendations.push('Consider implementing more aggressive garbage collection or memory optimization');
    }

    // Throughput recommendations
    if (metrics.throughput < this.thresholds.minThroughput!) {
      recommendations.push('Low throughput detected - consider request batching or connection pooling optimization');
    }

    // Error rate recommendations
    if (metrics.errorRate > this.thresholds.maxErrorRate!) {
      recommendations.push('High error rate detected - review error handling and retry mechanisms');
    }

    // Connection pool recommendations
    if (metrics.poolEfficiency < this.thresholds.minPoolEfficiency!) {
      recommendations.push('Connection pool efficiency is low - consider adjusting pool size or connection timeout settings');
    }

    return recommendations;
  }

  private identifyTopPerformers(
    endpointMetrics: Record<string, PerformanceMetrics>
  ): Array<{ endpoint: string; metric: string; value: number }> {
    const performers: Array<{ endpoint: string; metric: string; value: number }> = [];

    for (const [endpoint, metrics] of Object.entries(endpointMetrics)) {
      if (metrics.throughput > 10) {
        performers.push({
          endpoint,
          metric: 'throughput',
          value: metrics.throughput
        });
      }
    }

    return performers.sort((a, b) => b.value - a.value).slice(0, 5);
  }

  private identifyBottlenecks(
    endpointMetrics: Record<string, PerformanceMetrics>
  ): Array<{ endpoint: string; metric: string; value: number }> {
    const bottlenecks: Array<{ endpoint: string; metric: string; value: number }> = [];

    for (const [endpoint, metrics] of Object.entries(endpointMetrics)) {
      if (metrics.averageResponseTime > this.thresholds.maxResponseTime!) {
        bottlenecks.push({
          endpoint,
          metric: 'response_time',
          value: metrics.averageResponseTime
        });
      }

      if (metrics.errorRate > this.thresholds.maxErrorRate!) {
        bottlenecks.push({
          endpoint,
          metric: 'error_rate',
          value: metrics.errorRate
        });
      }
    }

    return bottlenecks.sort((a, b) => b.value - a.value).slice(0, 5);
  }
}