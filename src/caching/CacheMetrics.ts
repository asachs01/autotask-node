/**
 * Cache Metrics Collection and Analysis System
 * 
 * Comprehensive metrics collection for cache performance monitoring,
 * with real-time statistics, trends analysis, and alerting capabilities.
 */

import { EventEmitter } from 'events';
import { CacheMetrics, EntityCacheMetrics } from './types';

/**
 * Metric event types for monitoring
 */
export enum MetricEvent {
  CACHE_HIT = 'cache_hit',
  CACHE_MISS = 'cache_miss',
  CACHE_SET = 'cache_set',
  CACHE_DELETE = 'cache_delete',
  CACHE_EVICTION = 'cache_eviction',
  CACHE_ERROR = 'cache_error',
  METRIC_THRESHOLD_EXCEEDED = 'metric_threshold_exceeded'
}

/**
 * Metric data point
 */
export interface MetricDataPoint {
  /** Timestamp of the metric */
  timestamp: number;
  /** Metric type */
  type: MetricEvent;
  /** Entity type */
  entityType: string;
  /** Operation duration in milliseconds */
  duration: number;
  /** Cache key */
  key: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Threshold configuration for alerts
 */
export interface MetricThreshold {
  /** Metric name */
  metric: string;
  /** Threshold value */
  value: number;
  /** Comparison operator */
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  /** Threshold description */
  description: string;
  /** Whether the threshold is enabled */
  enabled: boolean;
}

/**
 * Time window for metrics aggregation
 */
export interface TimeWindow {
  /** Window duration in milliseconds */
  duration: number;
  /** Window start timestamp */
  start: number;
  /** Window end timestamp */
  end: number;
}

/**
 * Historical metrics data
 */
export interface HistoricalMetrics {
  /** Time window */
  window: TimeWindow;
  /** Metrics snapshot */
  metrics: CacheMetrics;
  /** Number of operations in this window */
  operationCount: number;
}

/**
 * Cache metrics collector and analyzer
 */
export class CacheMetricsCollector extends EventEmitter {
  private metrics: CacheMetrics;
  private entityMetrics: Map<string, EntityCacheMetrics>;
  private dataPoints: MetricDataPoint[] = [];
  private thresholds: MetricThreshold[] = [];
  private historicalData: HistoricalMetrics[] = [];
  private readonly maxDataPoints: number;
  private readonly maxHistoricalWindows: number;
  private metricsTimer?: NodeJS.Timeout;

  constructor(
    maxDataPoints: number = 10000,
    maxHistoricalWindows: number = 24 * 7 // 7 days of hourly data
  ) {
    super();
    
    this.maxDataPoints = maxDataPoints;
    this.maxHistoricalWindows = maxHistoricalWindows;
    this.entityMetrics = new Map();
    
    this.metrics = this.createEmptyMetrics();
    this.initializeDefaultThresholds();
    this.startMetricsAggregation();
  }

  /**
   * Record a cache hit
   */
  recordHit(entityType: string, key: string, duration: number, metadata?: Record<string, any>): void {
    this.recordDataPoint({
      timestamp: Date.now(),
      type: MetricEvent.CACHE_HIT,
      entityType,
      key,
      duration,
      metadata
    });

    this.metrics.hits++;
    this.updateEntityMetric(entityType, 'hits');
    this.updateHitRate();
    this.updateAverageResponseTime(duration);
  }

  /**
   * Record a cache miss
   */
  recordMiss(entityType: string, key: string, duration: number, metadata?: Record<string, any>): void {
    this.recordDataPoint({
      timestamp: Date.now(),
      type: MetricEvent.CACHE_MISS,
      entityType,
      key,
      duration,
      metadata
    });

    this.metrics.misses++;
    this.updateEntityMetric(entityType, 'misses');
    this.updateHitRate();
    this.updateAverageResponseTime(duration);
  }

  /**
   * Record a cache set operation
   */
  recordSet(entityType: string, key: string, size: number, ttl: number, metadata?: Record<string, any>): void {
    this.recordDataPoint({
      timestamp: Date.now(),
      type: MetricEvent.CACHE_SET,
      entityType,
      key,
      duration: 0,
      metadata: { size, ttl, ...metadata }
    });

    this.metrics.entryCount++;
    this.metrics.memoryUsage += size;
    this.updateEntityMemoryUsage(entityType, size);
    this.updateEntityTtl(entityType, ttl);
  }

  /**
   * Record a cache delete operation
   */
  recordDelete(entityType: string, key: string, size?: number, metadata?: Record<string, any>): void {
    this.recordDataPoint({
      timestamp: Date.now(),
      type: MetricEvent.CACHE_DELETE,
      entityType,
      key,
      duration: 0,
      metadata: { size, ...metadata }
    });

    if (this.metrics.entryCount > 0) {
      this.metrics.entryCount--;
    }
    
    if (size && size > 0) {
      this.metrics.memoryUsage = Math.max(0, this.metrics.memoryUsage - size);
      this.updateEntityMemoryUsage(entityType, -size);
    }
  }

  /**
   * Record a cache eviction
   */
  recordEviction(entityType: string, key: string, reason: string, size?: number): void {
    this.recordDataPoint({
      timestamp: Date.now(),
      type: MetricEvent.CACHE_EVICTION,
      entityType,
      key,
      duration: 0,
      metadata: { reason, size }
    });

    this.metrics.evictions++;
    
    if (size && size > 0) {
      this.metrics.memoryUsage = Math.max(0, this.metrics.memoryUsage - size);
      this.updateEntityMemoryUsage(entityType, -size);
    }
  }

  /**
   * Record a cache error
   */
  recordError(entityType: string, operation: string, error: Error, metadata?: Record<string, any>): void {
    this.recordDataPoint({
      timestamp: Date.now(),
      type: MetricEvent.CACHE_ERROR,
      entityType,
      key: '',
      duration: 0,
      metadata: {
        operation,
        error: error.message,
        stack: error.stack,
        ...metadata
      }
    });

    this.metrics.errors++;
  }

  /**
   * Get current metrics snapshot
   */
  getMetrics(): CacheMetrics {
    this.updateOperationsPerSecond();
    return {
      ...this.metrics,
      byEntityType: new Map(this.entityMetrics),
      lastUpdated: Date.now()
    };
  }

  /**
   * Get metrics for a specific entity type
   */
  getEntityMetrics(entityType: string): EntityCacheMetrics | undefined {
    return this.entityMetrics.get(entityType);
  }

  /**
   * Get historical metrics
   */
  getHistoricalMetrics(hours: number = 24): HistoricalMetrics[] {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return this.historicalData.filter(data => data.window.end >= cutoff);
  }

  /**
   * Get metrics summary over time period
   */
  getMetricsSummary(startTime: number, endTime: number): {
    totalHits: number;
    totalMisses: number;
    avgHitRate: number;
    avgResponseTime: number;
    totalOperations: number;
  } {
    const relevantData = this.dataPoints.filter(
      dp => dp.timestamp >= startTime && dp.timestamp <= endTime
    );

    const hits = relevantData.filter(dp => dp.type === MetricEvent.CACHE_HIT).length;
    const misses = relevantData.filter(dp => dp.type === MetricEvent.CACHE_MISS).length;
    const total = hits + misses;
    const avgHitRate = total > 0 ? (hits / total) * 100 : 0;
    
    const responseTimes = relevantData
      .filter(dp => [MetricEvent.CACHE_HIT, MetricEvent.CACHE_MISS].includes(dp.type))
      .map(dp => dp.duration);
    
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    return {
      totalHits: hits,
      totalMisses: misses,
      avgHitRate,
      avgResponseTime,
      totalOperations: total
    };
  }

  /**
   * Add metric threshold for alerting
   */
  addThreshold(threshold: MetricThreshold): void {
    const existingIndex = this.thresholds.findIndex(t => t.metric === threshold.metric);
    if (existingIndex >= 0) {
      this.thresholds[existingIndex] = threshold;
    } else {
      this.thresholds.push(threshold);
    }
  }

  /**
   * Remove metric threshold
   */
  removeThreshold(metric: string): boolean {
    const index = this.thresholds.findIndex(t => t.metric === metric);
    if (index >= 0) {
      this.thresholds.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get all configured thresholds
   */
  getThresholds(): MetricThreshold[] {
    return [...this.thresholds];
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = this.createEmptyMetrics();
    this.entityMetrics.clear();
    this.dataPoints = [];
    this.historicalData = [];
  }

  /**
   * Export metrics data
   */
  exportMetrics(): {
    metrics: CacheMetrics;
    dataPoints: MetricDataPoint[];
    historicalData: HistoricalMetrics[];
    thresholds: MetricThreshold[];
  } {
    return {
      metrics: this.getMetrics(),
      dataPoints: [...this.dataPoints],
      historicalData: [...this.historicalData],
      thresholds: [...this.thresholds]
    };
  }

  /**
   * Start metrics aggregation timer
   */
  private startMetricsAggregation(): void {
    // Aggregate metrics every hour
    this.metricsTimer = setInterval(() => {
      this.aggregateHourlyMetrics();
    }, 60 * 60 * 1000);
  }

  /**
   * Stop metrics collection
   */
  shutdown(): void {
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = undefined;
    }
  }

  /**
   * Record a data point and maintain buffer size
   */
  private recordDataPoint(dataPoint: MetricDataPoint): void {
    this.dataPoints.push(dataPoint);
    
    // Maintain buffer size
    if (this.dataPoints.length > this.maxDataPoints) {
      this.dataPoints.shift();
    }

    // Check thresholds
    this.checkThresholds();
  }

  /**
   * Update entity-specific metrics
   */
  private updateEntityMetric(entityType: string, metricType: 'hits' | 'misses'): void {
    let entityMetric = this.entityMetrics.get(entityType);
    
    if (!entityMetric) {
      entityMetric = {
        entityType,
        hits: 0,
        misses: 0,
        hitRate: 0,
        entryCount: 0,
        memoryUsage: 0,
        avgTtl: 0,
        lastAccessed: Date.now()
      };
      this.entityMetrics.set(entityType, entityMetric);
    }

    entityMetric[metricType]++;
    entityMetric.lastAccessed = Date.now();
    
    const total = entityMetric.hits + entityMetric.misses;
    entityMetric.hitRate = total > 0 ? (entityMetric.hits / total) * 100 : 0;
  }

  /**
   * Update entity memory usage
   */
  private updateEntityMemoryUsage(entityType: string, sizeDelta: number): void {
    let entityMetric = this.entityMetrics.get(entityType);
    
    if (!entityMetric) {
      entityMetric = {
        entityType,
        hits: 0,
        misses: 0,
        hitRate: 0,
        entryCount: 0,
        memoryUsage: 0,
        avgTtl: 0,
        lastAccessed: Date.now()
      };
      this.entityMetrics.set(entityType, entityMetric);
    }

    entityMetric.memoryUsage = Math.max(0, entityMetric.memoryUsage + sizeDelta);
    
    if (sizeDelta > 0) {
      entityMetric.entryCount++;
    } else if (sizeDelta < 0 && entityMetric.entryCount > 0) {
      entityMetric.entryCount--;
    }
  }

  /**
   * Update entity TTL average
   */
  private updateEntityTtl(entityType: string, ttl: number): void {
    const entityMetric = this.entityMetrics.get(entityType);
    if (entityMetric && ttl > 0) {
      // Simple moving average approximation
      const count = entityMetric.entryCount || 1;
      entityMetric.avgTtl = ((entityMetric.avgTtl * (count - 1)) + ttl) / count;
    }
  }

  /**
   * Update overall hit rate
   */
  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;
  }

  /**
   * Update average response time
   */
  private updateAverageResponseTime(duration: number): void {
    const recentDataPoints = this.dataPoints
      .filter(dp => 
        [MetricEvent.CACHE_HIT, MetricEvent.CACHE_MISS].includes(dp.type) &&
        dp.timestamp > Date.now() - 60000 // Last minute
      );

    if (recentDataPoints.length > 0) {
      const totalTime = recentDataPoints.reduce((sum, dp) => sum + dp.duration, 0);
      this.metrics.avgResponseTime = totalTime / recentDataPoints.length;
    }
  }

  /**
   * Update operations per second
   */
  private updateOperationsPerSecond(): void {
    const oneSecondAgo = Date.now() - 1000;
    const recentOperations = this.dataPoints.filter(dp => dp.timestamp > oneSecondAgo);
    this.metrics.operationsPerSecond = recentOperations.length;
  }

  /**
   * Aggregate hourly metrics for historical tracking
   */
  private aggregateHourlyMetrics(): void {
    const now = Date.now();
    const hourStart = now - (now % (60 * 60 * 1000));
    const hourEnd = hourStart + (60 * 60 * 1000);

    const hourlyDataPoints = this.dataPoints.filter(
      dp => dp.timestamp >= hourStart && dp.timestamp < hourEnd
    );

    if (hourlyDataPoints.length === 0) {
      return;
    }

    const snapshot = this.getMetrics();
    const historicalMetric: HistoricalMetrics = {
      window: {
        duration: 60 * 60 * 1000,
        start: hourStart,
        end: hourEnd
      },
      metrics: snapshot,
      operationCount: hourlyDataPoints.length
    };

    this.historicalData.push(historicalMetric);

    // Maintain historical data size
    if (this.historicalData.length > this.maxHistoricalWindows) {
      this.historicalData.shift();
    }
  }

  /**
   * Check metric thresholds and emit events
   */
  private checkThresholds(): void {
    const currentMetrics = this.getMetrics();

    for (const threshold of this.thresholds.filter(t => t.enabled)) {
      let currentValue: number;
      
      switch (threshold.metric) {
        case 'hitRate':
          currentValue = currentMetrics.hitRate;
          break;
        case 'avgResponseTime':
          currentValue = currentMetrics.avgResponseTime;
          break;
        case 'memoryUsage':
          currentValue = currentMetrics.memoryUsage;
          break;
        case 'errorCount':
          currentValue = currentMetrics.errors;
          break;
        case 'operationsPerSecond':
          currentValue = currentMetrics.operationsPerSecond;
          break;
        default:
          continue;
      }

      const exceeded = this.checkThresholdCondition(currentValue, threshold.operator, threshold.value);
      
      if (exceeded) {
        this.emit(MetricEvent.METRIC_THRESHOLD_EXCEEDED, {
          threshold,
          currentValue,
          timestamp: Date.now()
        });
      }
    }
  }

  /**
   * Check if threshold condition is met
   */
  private checkThresholdCondition(current: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case 'gt':
        return current > threshold;
      case 'gte':
        return current >= threshold;
      case 'lt':
        return current < threshold;
      case 'lte':
        return current <= threshold;
      case 'eq':
        return current === threshold;
      default:
        return false;
    }
  }

  /**
   * Initialize default threshold configurations
   */
  private initializeDefaultThresholds(): void {
    this.thresholds = [
      {
        metric: 'hitRate',
        value: 50,
        operator: 'lt',
        description: 'Cache hit rate below 50%',
        enabled: true
      },
      {
        metric: 'avgResponseTime',
        value: 100,
        operator: 'gt',
        description: 'Average response time above 100ms',
        enabled: true
      },
      {
        metric: 'errorCount',
        value: 10,
        operator: 'gt',
        description: 'More than 10 errors',
        enabled: true
      },
      {
        metric: 'memoryUsage',
        value: 100 * 1024 * 1024, // 100MB
        operator: 'gt',
        description: 'Memory usage above 100MB',
        enabled: true
      }
    ];
  }

  /**
   * Create empty metrics object
   */
  private createEmptyMetrics(): CacheMetrics {
    return {
      hits: 0,
      misses: 0,
      hitRate: 0,
      avgResponseTime: 0,
      memoryUsage: 0,
      entryCount: 0,
      operationsPerSecond: 0,
      evictions: 0,
      errors: 0,
      byEntityType: new Map(),
      lastUpdated: Date.now()
    };
  }
}