"use strict";
/**
 * Batch Metrics Implementation
 *
 * Comprehensive metrics collection and analysis for batch operations:
 * - Real-time performance monitoring
 * - Historical trend analysis
 * - Alerting and threshold monitoring
 * - Detailed reporting and insights
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchMetricsCollector = void 0;
const events_1 = require("events");
/**
 * BatchMetricsCollector manages comprehensive metrics for batch operations
 */
class BatchMetricsCollector extends events_1.EventEmitter {
    constructor(windowSize = 300000, // 5 minutes
    maxDataPoints = 1000, logger) {
        super();
        // Core metrics
        this.metrics = {
            totalBatches: 0,
            totalRequests: 0,
            successRate: 0,
            averageBatchSize: 0,
            averageProcessingTime: 0,
            averageWaitTime: 0,
            throughput: 0,
            errorRate: 0,
            deduplicationRate: 0,
            coalescingRate: 0,
            strategyPerformance: new Map(),
            endpointPerformance: new Map(),
            timeSeries: []
        };
        // Time-series data storage
        this.timeSeriesData = new Map();
        // Performance windows for trend analysis
        this.performanceWindows = [];
        // Strategy-specific metrics
        this.strategyMetrics = new Map();
        // Endpoint-specific metrics
        this.endpointMetrics = new Map();
        // Alert configuration
        this.alerts = new Map();
        this.lastSnapshotTime = Date.now();
        // Deduplication and coalescing tracking
        this.totalOriginalRequests = 0;
        this.totalDeduplicatedRequests = 0;
        this.totalCoalescedRequests = 0;
        this.windowSize = windowSize;
        this.maxDataPoints = maxDataPoints;
        this.logger = logger;
        // Set up default alerts
        this.setupDefaultAlerts();
        // Start periodic metrics update
        this.startMetricsCollection();
    }
    /**
     * Record a batch completion event
     */
    recordBatchCompletion(result) {
        const { batchId, success, results, metadata } = result;
        try {
            // Update core counters
            this.metrics.totalBatches++;
            this.metrics.totalRequests += results.length;
            // Update success metrics
            const successfulRequests = results.filter(r => r.success).length;
            const currentSuccessfulTotal = this.metrics.successRate * this.metrics.totalRequests;
            const newSuccessfulTotal = currentSuccessfulTotal + successfulRequests;
            this.metrics.successRate = newSuccessfulTotal / this.metrics.totalRequests;
            // Update error rate
            this.metrics.errorRate = 1 - this.metrics.successRate;
            // Update average batch size
            const totalBatchSizeSum = this.metrics.averageBatchSize * (this.metrics.totalBatches - 1);
            this.metrics.averageBatchSize = (totalBatchSizeSum + results.length) / this.metrics.totalBatches;
            // Update average processing time
            const totalProcessingTimeSum = this.metrics.averageProcessingTime * (this.metrics.totalBatches - 1);
            this.metrics.averageProcessingTime = (totalProcessingTimeSum + metadata.processingTime) / this.metrics.totalBatches;
            // Record strategy performance
            if (metadata.strategy) {
                this.recordStrategyPerformance(metadata.strategy, results.length, metadata.processingTime, success);
            }
            // Record optimization metrics
            if (metadata.optimizations) {
                this.recordOptimizationMetrics(metadata.optimizations, results.length);
            }
            // Record time-series data
            this.recordTimeSeriesData('batch_completions', 1, { batchId, success });
            this.recordTimeSeriesData('processing_time', metadata.processingTime, { batchId });
            this.recordTimeSeriesData('batch_size', results.length, { batchId });
            this.recordTimeSeriesData('success_rate', successfulRequests / results.length, { batchId });
            // Update performance window
            this.updatePerformanceWindow(result);
            this.logger.debug('Batch metrics recorded', {
                batchId,
                totalBatches: this.metrics.totalBatches,
                successRate: this.metrics.successRate.toFixed(3),
                avgProcessingTime: this.metrics.averageProcessingTime.toFixed(2)
            });
            // Check alerts
            this.checkAlerts();
        }
        catch (error) {
            this.logger.error('Failed to record batch metrics', {
                batchId,
                error: error instanceof Error ? error.message : error
            });
        }
    }
    /**
     * Record endpoint-specific performance
     */
    recordEndpointPerformance(endpoint, batchSize, processingTime, success) {
        if (!this.endpointMetrics.has(endpoint)) {
            this.endpointMetrics.set(endpoint, {
                totalBatches: 0,
                totalTime: 0,
                successfulBatches: 0,
                totalRequests: 0,
                totalBatchSize: 0
            });
        }
        const metrics = this.endpointMetrics.get(endpoint);
        metrics.totalBatches++;
        metrics.totalTime += processingTime;
        metrics.totalRequests += batchSize;
        metrics.totalBatchSize += batchSize;
        if (success) {
            metrics.successfulBatches++;
        }
        // Update main metrics
        this.metrics.endpointPerformance.set(endpoint, {
            totalBatches: metrics.totalBatches,
            averageTime: metrics.totalTime / metrics.totalBatches,
            successRate: metrics.successfulBatches / metrics.totalBatches,
            averageBatchSize: metrics.totalBatchSize / metrics.totalBatches
        });
    }
    /**
     * Record wait time for batches
     */
    recordWaitTime(waitTime) {
        // Update average wait time using exponential moving average
        const alpha = 0.1;
        this.metrics.averageWaitTime = alpha * waitTime + (1 - alpha) * this.metrics.averageWaitTime;
        this.recordTimeSeriesData('wait_time', waitTime);
    }
    /**
     * Get current metrics snapshot
     */
    getMetrics() {
        this.updateDerivedMetrics();
        return {
            ...this.metrics,
            strategyPerformance: new Map(this.metrics.strategyPerformance),
            endpointPerformance: new Map(this.metrics.endpointPerformance),
            timeSeries: [...this.metrics.timeSeries]
        };
    }
    /**
     * Get metrics for a specific time range
     */
    getMetricsForTimeRange(startTime, endTime) {
        const relevantWindows = this.performanceWindows.filter(w => w.startTime >= startTime && w.endTime <= endTime);
        if (relevantWindows.length === 0) {
            return {
                totalBatches: 0,
                totalRequests: 0,
                successRate: 0,
                timeSeries: []
            };
        }
        const totalBatches = relevantWindows.reduce((sum, w) => sum + w.totalBatches, 0);
        const totalRequests = relevantWindows.reduce((sum, w) => sum + w.totalRequests, 0);
        const successfulRequests = relevantWindows.reduce((sum, w) => sum + w.successfulRequests, 0);
        const totalProcessingTime = relevantWindows.reduce((sum, w) => sum + w.totalProcessingTime, 0);
        const successRate = totalRequests > 0 ? successfulRequests / totalRequests : 0;
        const averageProcessingTime = totalBatches > 0 ? totalProcessingTime / totalBatches : 0;
        // Get time series data for the range
        const timeSeries = this.getTimeSeriesForRange('batch_completions', startTime, endTime)
            .map(dp => ({
            timestamp: dp.timestamp,
            throughput: this.calculateThroughputAtTime(dp.timestamp),
            errorRate: 1 - this.calculateSuccessRateAtTime(dp.timestamp),
            averageLatency: this.calculateLatencyAtTime(dp.timestamp)
        }));
        return {
            totalBatches,
            totalRequests,
            successRate,
            averageProcessingTime,
            timeSeries
        };
    }
    /**
     * Get performance trends
     */
    getPerformanceTrends(windowCount = 10) {
        const recentWindows = this.performanceWindows.slice(-windowCount);
        if (recentWindows.length < 3) {
            return {
                throughputTrend: 'stable',
                errorRateTrend: 'stable',
                latencyTrend: 'stable',
                analysis: ['Insufficient data for trend analysis']
            };
        }
        // Calculate trends
        const throughputs = recentWindows.map(w => this.calculateWindowThroughput(w));
        const errorRates = recentWindows.map(w => this.calculateWindowErrorRate(w));
        const latencies = recentWindows.map(w => this.calculateWindowLatency(w));
        const throughputTrend = this.calculateTrend(throughputs);
        const errorRateTrend = this.calculateTrend(errorRates);
        const latencyTrend = this.calculateTrend(latencies);
        const analysis = [];
        if (throughputTrend === 'decreasing') {
            analysis.push('Throughput is declining - investigate system capacity');
        }
        if (errorRateTrend === 'increasing') {
            analysis.push('Error rate is increasing - review batch strategies');
        }
        if (latencyTrend === 'increasing') {
            analysis.push('Latency is increasing - check system performance');
        }
        if (analysis.length === 0) {
            analysis.push('Performance metrics are stable');
        }
        return {
            throughputTrend,
            errorRateTrend,
            latencyTrend,
            analysis
        };
    }
    /**
     * Configure alert thresholds
     */
    configureAlert(metric, threshold, operator, cooldown = 300000 // 5 minutes
    ) {
        this.alerts.set(metric, {
            metric,
            threshold,
            operator,
            enabled: true,
            cooldown
        });
        this.logger.info('Alert configured', { metric, threshold, operator, cooldown });
    }
    /**
     * Enable or disable an alert
     */
    toggleAlert(metric, enabled) {
        const alert = this.alerts.get(metric);
        if (alert) {
            alert.enabled = enabled;
            this.logger.info('Alert toggled', { metric, enabled });
        }
    }
    /**
     * Get current alert status
     */
    getAlertStatus() {
        return Array.from(this.alerts.values()).map(alert => ({
            metric: alert.metric,
            threshold: alert.threshold,
            operator: alert.operator,
            enabled: alert.enabled,
            lastTriggered: alert.lastTriggered
        }));
    }
    /**
     * Reset all metrics
     */
    reset() {
        this.metrics = {
            totalBatches: 0,
            totalRequests: 0,
            successRate: 0,
            averageBatchSize: 0,
            averageProcessingTime: 0,
            averageWaitTime: 0,
            throughput: 0,
            errorRate: 0,
            deduplicationRate: 0,
            coalescingRate: 0,
            strategyPerformance: new Map(),
            endpointPerformance: new Map(),
            timeSeries: []
        };
        this.timeSeriesData.clear();
        this.performanceWindows.length = 0;
        this.strategyMetrics.clear();
        this.endpointMetrics.clear();
        this.totalOriginalRequests = 0;
        this.totalDeduplicatedRequests = 0;
        this.totalCoalescedRequests = 0;
        this.logger.info('Metrics reset');
    }
    /**
     * Export metrics data for external analysis
     */
    exportData() {
        return {
            metrics: this.getMetrics(),
            timeSeries: Object.fromEntries(this.timeSeriesData),
            performanceWindows: [...this.performanceWindows],
            alerts: Array.from(this.alerts.values())
        };
    }
    // Private helper methods
    recordStrategyPerformance(strategy, requestCount, processingTime, success) {
        if (!this.strategyMetrics.has(strategy)) {
            this.strategyMetrics.set(strategy, {
                totalBatches: 0,
                totalTime: 0,
                successfulBatches: 0,
                totalRequests: 0
            });
        }
        const metrics = this.strategyMetrics.get(strategy);
        metrics.totalBatches++;
        metrics.totalTime += processingTime;
        metrics.totalRequests += requestCount;
        if (success) {
            metrics.successfulBatches++;
        }
        // Update main metrics
        this.metrics.strategyPerformance.set(strategy, {
            totalBatches: metrics.totalBatches,
            averageTime: metrics.totalTime / metrics.totalBatches,
            successRate: metrics.successfulBatches / metrics.totalBatches
        });
    }
    recordOptimizationMetrics(optimizations, batchSize) {
        this.totalOriginalRequests += batchSize;
        if (optimizations.includes('deduplication')) {
            this.totalDeduplicatedRequests += Math.floor(batchSize * 0.1); // Estimate
        }
        if (optimizations.includes('coalescing')) {
            this.totalCoalescedRequests += Math.floor(batchSize * 0.05); // Estimate
        }
        // Update rates
        this.metrics.deduplicationRate = this.totalOriginalRequests > 0 ?
            this.totalDeduplicatedRequests / this.totalOriginalRequests : 0;
        this.metrics.coalescingRate = this.totalOriginalRequests > 0 ?
            this.totalCoalescedRequests / this.totalOriginalRequests : 0;
    }
    recordTimeSeriesData(metric, value, metadata) {
        if (!this.timeSeriesData.has(metric)) {
            this.timeSeriesData.set(metric, []);
        }
        const dataPoints = this.timeSeriesData.get(metric);
        dataPoints.push({
            timestamp: new Date(),
            value,
            metadata
        });
        // Keep only recent data points
        if (dataPoints.length > this.maxDataPoints) {
            dataPoints.splice(0, dataPoints.length - this.maxDataPoints);
        }
    }
    updatePerformanceWindow(result) {
        const now = Date.now();
        // Create new window if needed
        if (this.performanceWindows.length === 0 ||
            now - this.performanceWindows[this.performanceWindows.length - 1].startTime.getTime() > this.windowSize) {
            this.performanceWindows.push({
                startTime: new Date(now),
                endTime: new Date(now + this.windowSize),
                totalBatches: 0,
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                totalProcessingTime: 0,
                totalWaitTime: 0
            });
        }
        // Update current window
        const currentWindow = this.performanceWindows[this.performanceWindows.length - 1];
        currentWindow.totalBatches++;
        currentWindow.totalRequests += result.results.length;
        currentWindow.successfulRequests += result.results.filter(r => r.success).length;
        currentWindow.failedRequests += result.results.filter(r => !r.success).length;
        currentWindow.totalProcessingTime += result.metadata.processingTime;
        // Keep only recent windows
        const cutoff = now - (this.windowSize * 100); // Keep 100 windows
        const validWindows = this.performanceWindows.filter(w => w.startTime.getTime() > cutoff);
        this.performanceWindows.length = 0;
        this.performanceWindows.push(...validWindows);
    }
    updateDerivedMetrics() {
        // Update throughput
        const recentDataPoints = this.getTimeSeriesForRange('batch_completions', new Date(Date.now() - this.windowSize), new Date());
        if (recentDataPoints.length > 0) {
            const totalRequests = recentDataPoints.reduce((sum, dp) => sum + (dp.metadata?.batchSize || 0), 0);
            const timeSpanSeconds = this.windowSize / 1000;
            this.metrics.throughput = totalRequests / timeSpanSeconds;
        }
        // Update time series snapshot
        const now = new Date();
        this.metrics.timeSeries.push({
            timestamp: now,
            throughput: this.metrics.throughput,
            errorRate: this.metrics.errorRate,
            averageLatency: this.metrics.averageProcessingTime
        });
        // Keep time series data manageable
        if (this.metrics.timeSeries.length > 100) {
            this.metrics.timeSeries.splice(0, this.metrics.timeSeries.length - 100);
        }
    }
    getTimeSeriesForRange(metric, startTime, endTime) {
        const dataPoints = this.timeSeriesData.get(metric) || [];
        return dataPoints.filter(dp => dp.timestamp >= startTime && dp.timestamp <= endTime);
    }
    calculateThroughputAtTime(timestamp) {
        const windowStart = new Date(timestamp.getTime() - this.windowSize);
        const dataPoints = this.getTimeSeriesForRange('batch_completions', windowStart, timestamp);
        if (dataPoints.length === 0)
            return 0;
        const totalRequests = dataPoints.reduce((sum, dp) => sum + (dp.metadata?.batchSize || 0), 0);
        return totalRequests / (this.windowSize / 1000);
    }
    calculateSuccessRateAtTime(timestamp) {
        const windowStart = new Date(timestamp.getTime() - this.windowSize);
        const dataPoints = this.getTimeSeriesForRange('success_rate', windowStart, timestamp);
        if (dataPoints.length === 0)
            return 0;
        return dataPoints.reduce((sum, dp) => sum + dp.value, 0) / dataPoints.length;
    }
    calculateLatencyAtTime(timestamp) {
        const windowStart = new Date(timestamp.getTime() - this.windowSize);
        const dataPoints = this.getTimeSeriesForRange('processing_time', windowStart, timestamp);
        if (dataPoints.length === 0)
            return 0;
        return dataPoints.reduce((sum, dp) => sum + dp.value, 0) / dataPoints.length;
    }
    calculateWindowThroughput(window) {
        const timeSpanSeconds = (window.endTime.getTime() - window.startTime.getTime()) / 1000;
        return timeSpanSeconds > 0 ? window.totalRequests / timeSpanSeconds : 0;
    }
    calculateWindowErrorRate(window) {
        return window.totalRequests > 0 ? window.failedRequests / window.totalRequests : 0;
    }
    calculateWindowLatency(window) {
        return window.totalBatches > 0 ? window.totalProcessingTime / window.totalBatches : 0;
    }
    calculateTrend(values) {
        if (values.length < 3)
            return 'stable';
        const recent = values.slice(-3);
        const first = recent[0];
        const last = recent[recent.length - 1];
        const change = (last - first) / first;
        if (Math.abs(change) < 0.05)
            return 'stable'; // Less than 5% change
        return change > 0 ? 'increasing' : 'decreasing';
    }
    setupDefaultAlerts() {
        // Error rate alert
        this.configureAlert('errorRate', 0.1, 'gt', 300000); // > 10% error rate
        // Throughput alert
        this.configureAlert('throughput', 1, 'lt', 300000); // < 1 request/second
        // Processing time alert
        this.configureAlert('averageProcessingTime', 10000, 'gt', 300000); // > 10 seconds
        // Success rate alert
        this.configureAlert('successRate', 0.8, 'lt', 300000); // < 80% success rate
    }
    checkAlerts() {
        const now = Date.now();
        for (const alert of this.alerts.values()) {
            if (!alert.enabled)
                continue;
            // Check cooldown
            if (alert.lastTriggered && now - alert.lastTriggered.getTime() < alert.cooldown) {
                continue;
            }
            const currentValue = this.getMetricValue(alert.metric);
            const shouldTrigger = this.evaluateAlertCondition(currentValue, alert.threshold, alert.operator);
            if (shouldTrigger) {
                alert.lastTriggered = new Date();
                this.emit('alert', {
                    metric: alert.metric,
                    currentValue,
                    threshold: alert.threshold,
                    operator: alert.operator,
                    timestamp: new Date()
                });
                this.logger.warn('Alert triggered', {
                    metric: alert.metric,
                    currentValue,
                    threshold: alert.threshold,
                    operator: alert.operator
                });
            }
        }
    }
    getMetricValue(metric) {
        switch (metric) {
            case 'errorRate': return this.metrics.errorRate;
            case 'throughput': return this.metrics.throughput;
            case 'averageProcessingTime': return this.metrics.averageProcessingTime;
            case 'successRate': return this.metrics.successRate;
            case 'averageBatchSize': return this.metrics.averageBatchSize;
            case 'averageWaitTime': return this.metrics.averageWaitTime;
            default: return 0;
        }
    }
    evaluateAlertCondition(value, threshold, operator) {
        switch (operator) {
            case 'gt': return value > threshold;
            case 'lt': return value < threshold;
            case 'eq': return Math.abs(value - threshold) < 0.001; // Small epsilon for float comparison
            default: return false;
        }
    }
    startMetricsCollection() {
        // Update derived metrics every 30 seconds
        setInterval(() => {
            this.updateDerivedMetrics();
        }, 30000);
        // Clean up old data every 5 minutes
        setInterval(() => {
            this.cleanupOldData();
        }, 300000);
    }
    cleanupOldData() {
        const cutoff = new Date(Date.now() - this.windowSize * 10); // Keep 10 windows worth
        // Clean time series data
        for (const [metric, dataPoints] of this.timeSeriesData) {
            const validPoints = dataPoints.filter(dp => dp.timestamp > cutoff);
            this.timeSeriesData.set(metric, validPoints);
        }
    }
}
exports.BatchMetricsCollector = BatchMetricsCollector;
//# sourceMappingURL=BatchMetrics.js.map