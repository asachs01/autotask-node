"use strict";
/**
 * Cache Metrics Collection and Analysis System
 *
 * Comprehensive metrics collection for cache performance monitoring,
 * with real-time statistics, trends analysis, and alerting capabilities.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheMetricsCollector = exports.MetricEvent = void 0;
const events_1 = require("events");
/**
 * Metric event types for monitoring
 */
var MetricEvent;
(function (MetricEvent) {
    MetricEvent["CACHE_HIT"] = "cache_hit";
    MetricEvent["CACHE_MISS"] = "cache_miss";
    MetricEvent["CACHE_SET"] = "cache_set";
    MetricEvent["CACHE_DELETE"] = "cache_delete";
    MetricEvent["CACHE_EVICTION"] = "cache_eviction";
    MetricEvent["CACHE_ERROR"] = "cache_error";
    MetricEvent["METRIC_THRESHOLD_EXCEEDED"] = "metric_threshold_exceeded";
})(MetricEvent || (exports.MetricEvent = MetricEvent = {}));
/**
 * Cache metrics collector and analyzer
 */
class CacheMetricsCollector extends events_1.EventEmitter {
    constructor(maxDataPoints = 10000, maxHistoricalWindows = 24 * 7 // 7 days of hourly data
    ) {
        super();
        this.dataPoints = [];
        this.thresholds = [];
        this.historicalData = [];
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
    recordHit(entityType, key, duration, metadata) {
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
    recordMiss(entityType, key, duration, metadata) {
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
    recordSet(entityType, key, size, ttl, metadata) {
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
    recordDelete(entityType, key, size, metadata) {
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
    recordEviction(entityType, key, reason, size) {
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
    recordError(entityType, operation, error, metadata) {
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
    getMetrics() {
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
    getEntityMetrics(entityType) {
        return this.entityMetrics.get(entityType);
    }
    /**
     * Get historical metrics
     */
    getHistoricalMetrics(hours = 24) {
        const cutoff = Date.now() - (hours * 60 * 60 * 1000);
        return this.historicalData.filter(data => data.window.end >= cutoff);
    }
    /**
     * Get metrics summary over time period
     */
    getMetricsSummary(startTime, endTime) {
        const relevantData = this.dataPoints.filter(dp => dp.timestamp >= startTime && dp.timestamp <= endTime);
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
    addThreshold(threshold) {
        const existingIndex = this.thresholds.findIndex(t => t.metric === threshold.metric);
        if (existingIndex >= 0) {
            this.thresholds[existingIndex] = threshold;
        }
        else {
            this.thresholds.push(threshold);
        }
    }
    /**
     * Remove metric threshold
     */
    removeThreshold(metric) {
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
    getThresholds() {
        return [...this.thresholds];
    }
    /**
     * Reset all metrics
     */
    reset() {
        this.metrics = this.createEmptyMetrics();
        this.entityMetrics.clear();
        this.dataPoints = [];
        this.historicalData = [];
    }
    /**
     * Export metrics data
     */
    exportMetrics() {
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
    startMetricsAggregation() {
        // Aggregate metrics every hour
        this.metricsTimer = setInterval(() => {
            this.aggregateHourlyMetrics();
        }, 60 * 60 * 1000);
    }
    /**
     * Stop metrics collection
     */
    shutdown() {
        if (this.metricsTimer) {
            clearInterval(this.metricsTimer);
            this.metricsTimer = undefined;
        }
    }
    /**
     * Record a data point and maintain buffer size
     */
    recordDataPoint(dataPoint) {
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
    updateEntityMetric(entityType, metricType) {
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
    updateEntityMemoryUsage(entityType, sizeDelta) {
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
        }
        else if (sizeDelta < 0 && entityMetric.entryCount > 0) {
            entityMetric.entryCount--;
        }
    }
    /**
     * Update entity TTL average
     */
    updateEntityTtl(entityType, ttl) {
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
    updateHitRate() {
        const total = this.metrics.hits + this.metrics.misses;
        this.metrics.hitRate = total > 0 ? (this.metrics.hits / total) * 100 : 0;
    }
    /**
     * Update average response time
     */
    updateAverageResponseTime(duration) {
        const recentDataPoints = this.dataPoints
            .filter(dp => [MetricEvent.CACHE_HIT, MetricEvent.CACHE_MISS].includes(dp.type) &&
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
    updateOperationsPerSecond() {
        const oneSecondAgo = Date.now() - 1000;
        const recentOperations = this.dataPoints.filter(dp => dp.timestamp > oneSecondAgo);
        this.metrics.operationsPerSecond = recentOperations.length;
    }
    /**
     * Aggregate hourly metrics for historical tracking
     */
    aggregateHourlyMetrics() {
        const now = Date.now();
        const hourStart = now - (now % (60 * 60 * 1000));
        const hourEnd = hourStart + (60 * 60 * 1000);
        const hourlyDataPoints = this.dataPoints.filter(dp => dp.timestamp >= hourStart && dp.timestamp < hourEnd);
        if (hourlyDataPoints.length === 0) {
            return;
        }
        const snapshot = this.getMetrics();
        const historicalMetric = {
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
    checkThresholds() {
        const currentMetrics = this.getMetrics();
        for (const threshold of this.thresholds.filter(t => t.enabled)) {
            let currentValue;
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
    checkThresholdCondition(current, operator, threshold) {
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
    initializeDefaultThresholds() {
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
    createEmptyMetrics() {
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
exports.CacheMetricsCollector = CacheMetricsCollector;
//# sourceMappingURL=CacheMetrics.js.map