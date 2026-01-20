"use strict";
/**
 * Queue Monitor
 *
 * Comprehensive monitoring and observability system for the queue:
 * - Real-time metrics collection and analysis
 * - Performance trend analysis and alerting
 * - Health check monitoring with automatic recovery
 * - Capacity planning and prediction
 * - Operational dashboards and reporting
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueMonitor = void 0;
const events_1 = require("events");
class QueueMonitor extends events_1.EventEmitter {
    constructor(queueManager, logger, config = {}) {
        super();
        // Data storage
        this.metricsHistory = [];
        this.alertHistory = [];
        this.eventHistory = [];
        this.activeAlerts = new Map();
        this.isMonitoring = false;
        // Performance analysis
        this.performanceBaseline = null;
        this.baselineCalculated = false;
        this.queueManager = queueManager;
        this.logger = logger;
        this.config = {
            metricsInterval: 30000, // 30 seconds
            healthCheckInterval: 60000, // 1 minute
            alertThresholds: {
                queueUtilization: 0.85,
                errorRate: 0.1,
                averageWaitTime: 60000, // 1 minute
                processingTime: 30000, // 30 seconds
                throughputDrop: 0.5 // 50% drop
            },
            retentionPeriod: 86400000, // 24 hours
            enablePredictiveAlerts: true,
            ...config
        };
        // Listen to queue events
        this.queueManager.on('request.enqueued', (event) => this.recordEvent('request.enqueued', event));
        this.queueManager.on('request.completed', (event) => this.recordEvent('request.completed', event));
        this.queueManager.on('request.failed', (event) => this.recordEvent('request.failed', event));
        this.queueManager.on('batch.created', (event) => this.recordEvent('batch.created', event));
        this.queueManager.on('queue.full', (event) => this.recordEvent('queue.full', event));
        this.logger.info('QueueMonitor initialized');
    }
    /**
     * Initialize monitoring
     */
    async initialize() {
        await this.startMonitoring();
        this.logger.info('QueueMonitor monitoring started');
    }
    /**
     * Start monitoring processes
     */
    async startMonitoring() {
        if (this.isMonitoring) {
            return;
        }
        this.isMonitoring = true;
        // Start metrics collection
        this.metricsInterval = setInterval(async () => {
            await this.collectMetrics();
        }, this.config.metricsInterval);
        // Start health checks
        this.healthCheckInterval = setInterval(async () => {
            await this.performHealthCheck();
        }, this.config.healthCheckInterval);
        // Initial data collection
        await this.collectMetrics();
        this.emit('monitoringStarted');
    }
    /**
     * Stop monitoring processes
     */
    stopMonitoring() {
        if (!this.isMonitoring) {
            return;
        }
        this.isMonitoring = false;
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
            this.metricsInterval = undefined;
        }
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = undefined;
        }
        this.emit('monitoringStopped');
    }
    /**
     * Get current metrics
     */
    async getCurrentMetrics() {
        return await this.queueManager.getMetrics();
    }
    /**
     * Get current health status
     */
    async getCurrentHealth() {
        return await this.queueManager.getHealth();
    }
    /**
     * Get metrics history
     */
    getMetricsHistory(timeframe) {
        if (!timeframe) {
            return [...this.metricsHistory];
        }
        const cutoff = new Date(Date.now() - timeframe);
        return this.metricsHistory.filter(snapshot => snapshot.timestamp >= cutoff);
    }
    /**
     * Get active alerts
     */
    getActiveAlerts() {
        return Array.from(this.activeAlerts.values());
    }
    /**
     * Get alert history
     */
    getAlertHistory(timeframe) {
        if (!timeframe) {
            return [...this.alertHistory];
        }
        const cutoff = new Date(Date.now() - timeframe);
        return this.alertHistory.filter(alert => alert.timestamp >= cutoff);
    }
    /**
     * Analyze performance trends
     */
    analyzePerformanceTrends(timeframe = 3600000) {
        const recentSnapshots = this.getMetricsHistory(timeframe);
        if (recentSnapshots.length < 10) {
            return []; // Not enough data for trend analysis
        }
        const trends = [];
        // Analyze key metrics
        const metricsToAnalyze = [
            'queuedRequests',
            'averageProcessingTime',
            'averageQueueTime',
            'throughput',
            'errorRate',
            'queueUtilization'
        ];
        for (const metric of metricsToAnalyze) {
            const trend = this.calculateTrend(recentSnapshots, metric);
            if (trend) {
                trends.push(trend);
            }
        }
        return trends;
    }
    /**
     * Predict capacity requirements
     */
    predictCapacity(forecastMinutes = 60) {
        const recentSnapshots = this.getMetricsHistory(3600000); // Last hour
        if (recentSnapshots.length < 5) {
            return {
                currentUtilization: 0,
                predictedUtilization: 0,
                timeToCapacity: null,
                recommendedActions: ['Insufficient data for prediction'],
                confidence: 0
            };
        }
        const currentSnapshot = recentSnapshots[recentSnapshots.length - 1];
        const currentUtilization = currentSnapshot.metrics.queueUtilization;
        // Simple linear trend prediction
        const utilizationTrend = this.calculateTrend(recentSnapshots, 'queueUtilization');
        if (!utilizationTrend) {
            return {
                currentUtilization,
                predictedUtilization: currentUtilization,
                timeToCapacity: null,
                recommendedActions: ['Unable to calculate trend'],
                confidence: 0
            };
        }
        const changePerMinute = utilizationTrend.change / (utilizationTrend.timeframe / 60000);
        const predictedUtilization = currentUtilization + (changePerMinute * forecastMinutes);
        // Calculate time to capacity (100% utilization)
        let timeToCapacity = null;
        if (changePerMinute > 0 && currentUtilization < 1) {
            timeToCapacity = (1 - currentUtilization) / changePerMinute;
        }
        // Generate recommendations
        const recommendedActions = [];
        if (predictedUtilization > 0.9) {
            recommendedActions.push('Scale up queue capacity');
            recommendedActions.push('Optimize request processing');
            recommendedActions.push('Enable load shedding');
        }
        if (predictedUtilization > 0.8) {
            recommendedActions.push('Monitor queue closely');
            recommendedActions.push('Prepare for capacity increase');
        }
        if (timeToCapacity && timeToCapacity < 30) {
            recommendedActions.push('URGENT: Capacity limit in < 30 minutes');
        }
        return {
            currentUtilization,
            predictedUtilization: Math.max(0, Math.min(1, predictedUtilization)),
            timeToCapacity,
            recommendedActions,
            confidence: Math.min(utilizationTrend.confidence, 0.9)
        };
    }
    /**
     * Generate monitoring report
     */
    generateReport(timeframe = 3600000) {
        const recentSnapshots = this.getMetricsHistory(timeframe);
        const recentAlerts = this.getAlertHistory(timeframe);
        const trends = this.analyzePerformanceTrends(timeframe);
        const capacity = this.predictCapacity();
        const currentSnapshot = recentSnapshots[recentSnapshots.length - 1];
        const currentMetrics = currentSnapshot?.metrics || {};
        const currentHealth = currentSnapshot?.health || {};
        // Generate summary statistics
        const summary = {
            timeframe: timeframe / 60000, // Convert to minutes
            totalSnapshots: recentSnapshots.length,
            averageUtilization: this.calculateAverage(recentSnapshots, 'queueUtilization'),
            peakUtilization: this.calculateMax(recentSnapshots, 'queueUtilization'),
            averageErrorRate: this.calculateAverage(recentSnapshots, 'errorRate'),
            totalAlerts: recentAlerts.length,
            activeAlerts: this.activeAlerts.size
        };
        // Generate recommendations
        const recommendations = this.generateRecommendations(currentMetrics, currentHealth, trends, capacity);
        return {
            summary,
            metrics: currentMetrics,
            health: currentHealth,
            trends,
            capacity,
            alerts: recentAlerts,
            recommendations
        };
    }
    /**
     * Shutdown monitoring
     */
    async shutdown() {
        this.stopMonitoring();
        // Clean up resources
        this.metricsHistory.length = 0;
        this.alertHistory.length = 0;
        this.eventHistory.length = 0;
        this.activeAlerts.clear();
        this.removeAllListeners();
        this.logger.info('QueueMonitor shutdown complete');
    }
    /**
     * Collect metrics snapshot
     */
    async collectMetrics() {
        try {
            const metrics = await this.getCurrentMetrics();
            const health = await this.getCurrentHealth();
            const snapshot = {
                timestamp: new Date(),
                metrics,
                health
            };
            this.metricsHistory.push(snapshot);
            // Clean up old data
            this.cleanupOldData();
            // Calculate baseline if needed
            if (!this.baselineCalculated && this.metricsHistory.length >= 20) {
                this.calculatePerformanceBaseline();
            }
            // Check for alert conditions
            await this.checkAlertConditions(metrics, health);
            this.emit('metricsCollected', snapshot);
        }
        catch (error) {
            this.logger.error('Failed to collect metrics', error);
        }
    }
    /**
     * Perform health check
     */
    async performHealthCheck() {
        try {
            const health = await this.getCurrentHealth();
            // Check component health
            for (const [component, status] of Object.entries(health.components)) {
                if (status === 'offline') {
                    await this.createAlert('critical', 'component_offline', `Component ${component} is offline`);
                }
                else if (status === 'degraded') {
                    await this.createAlert('warning', 'component_degraded', `Component ${component} is degraded`);
                }
            }
            // Check overall health
            if (health.status === 'critical' || health.status === 'offline') {
                await this.createAlert('critical', 'system_critical', `System health is ${health.status}`);
            }
            else if (health.status === 'degraded') {
                await this.createAlert('warning', 'system_degraded', 'System performance is degraded');
            }
            this.emit('healthCheckCompleted', health);
        }
        catch (error) {
            this.logger.error('Health check failed', error);
            await this.createAlert('error', 'health_check_failed', 'Health check monitoring failed');
        }
    }
    /**
     * Check alert conditions
     */
    async checkAlertConditions(metrics, health) {
        const thresholds = this.config.alertThresholds;
        // Queue utilization alert
        if (metrics.queueUtilization > thresholds.queueUtilization) {
            await this.createAlert('warning', 'high_queue_utilization', `Queue utilization is ${(metrics.queueUtilization * 100).toFixed(1)}%`, { utilization: metrics.queueUtilization });
        }
        // Error rate alert
        if (metrics.errorRate > thresholds.errorRate) {
            await this.createAlert('error', 'high_error_rate', `Error rate is ${(metrics.errorRate * 100).toFixed(2)}%`, { errorRate: metrics.errorRate });
        }
        // Average wait time alert
        if (metrics.averageQueueTime > thresholds.averageWaitTime) {
            await this.createAlert('warning', 'high_wait_time', `Average wait time is ${(metrics.averageQueueTime / 1000).toFixed(1)} seconds`, { waitTime: metrics.averageQueueTime });
        }
        // Processing time alert
        if (metrics.averageProcessingTime > thresholds.processingTime) {
            await this.createAlert('warning', 'slow_processing', `Average processing time is ${(metrics.averageProcessingTime / 1000).toFixed(1)} seconds`, { processingTime: metrics.averageProcessingTime });
        }
        // Throughput drop alert (if we have baseline)
        if (this.performanceBaseline && this.config.enablePredictiveAlerts) {
            const throughputDrop = (this.performanceBaseline.throughput - metrics.throughput) / this.performanceBaseline.throughput;
            if (throughputDrop > thresholds.throughputDrop) {
                await this.createAlert('warning', 'throughput_drop', `Throughput dropped by ${(throughputDrop * 100).toFixed(1)}%`, { throughputDrop, baseline: this.performanceBaseline.throughput, current: metrics.throughput });
            }
        }
    }
    /**
     * Create an alert
     */
    async createAlert(severity, type, message, metadata) {
        // Check if alert already exists
        const alertKey = `${type}_${severity}`;
        if (this.activeAlerts.has(alertKey)) {
            return; // Don't create duplicate alerts
        }
        const alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            severity,
            type,
            message,
            timestamp: new Date(),
            metadata
        };
        this.activeAlerts.set(alertKey, alert);
        this.alertHistory.push(alert);
        this.logger[severity === 'critical' ? 'error' : severity === 'error' ? 'error' : 'warn'](`Queue alert: ${message}`, { alertId: alert.id, type, metadata });
        this.emit('alert', alert);
        // Auto-resolve non-critical alerts after some time
        if (severity !== 'critical') {
            setTimeout(() => {
                this.resolveAlert(alertKey);
            }, 300000); // 5 minutes
        }
    }
    /**
     * Resolve an alert
     */
    resolveAlert(alertKey) {
        const alert = this.activeAlerts.get(alertKey);
        if (alert) {
            this.activeAlerts.delete(alertKey);
            this.emit('alertResolved', alert);
        }
    }
    /**
     * Record an event
     */
    recordEvent(type, data) {
        const event = {
            type,
            timestamp: new Date(),
            data,
            metadata: {
                source: 'QueueMonitor'
            }
        };
        this.eventHistory.push(event);
        // Keep event history reasonable
        if (this.eventHistory.length > 10000) {
            this.eventHistory.splice(0, this.eventHistory.length - 10000);
        }
        this.emit('event', event);
    }
    /**
     * Calculate trend for a metric
     */
    calculateTrend(snapshots, metric) {
        if (snapshots.length < 5) {
            return null;
        }
        // Extract metric values
        const values = snapshots.map(snapshot => {
            const value = snapshot.metrics[metric];
            return typeof value === 'number' ? value : 0;
        });
        // Simple linear regression
        const n = values.length;
        const x = Array.from({ length: n }, (_, i) => i);
        const xSum = x.reduce((sum, val) => sum + val, 0);
        const ySum = values.reduce((sum, val) => sum + val, 0);
        const xySum = x.reduce((sum, val, i) => sum + val * values[i], 0);
        const xSquaredSum = x.reduce((sum, val) => sum + val * val, 0);
        const slope = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum);
        const intercept = (ySum - slope * xSum) / n;
        // Calculate R-squared for confidence
        const yMean = ySum / n;
        const ssRes = values.reduce((sum, val, i) => {
            const predicted = slope * x[i] + intercept;
            return sum + Math.pow(val - predicted, 2);
        }, 0);
        const ssTot = values.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
        const rSquared = 1 - (ssRes / ssTot);
        // Determine direction and magnitude
        const firstValue = values[0];
        const lastValue = values[n - 1];
        const change = lastValue - firstValue;
        const timeframe = snapshots[n - 1].timestamp.getTime() - snapshots[0].timestamp.getTime();
        let direction;
        if (Math.abs(change) < Math.abs(firstValue) * 0.05) {
            direction = 'stable';
        }
        else if (change > 0) {
            direction = 'increasing';
        }
        else {
            direction = 'decreasing';
        }
        return {
            metric,
            direction,
            change,
            confidence: Math.max(0, Math.min(1, rSquared)),
            timeframe
        };
    }
    /**
     * Calculate average for a metric across snapshots
     */
    calculateAverage(snapshots, metric) {
        if (snapshots.length === 0) {
            return 0;
        }
        const sum = snapshots.reduce((total, snapshot) => {
            const value = snapshot.metrics[metric];
            return total + (typeof value === 'number' ? value : 0);
        }, 0);
        return sum / snapshots.length;
    }
    /**
     * Calculate maximum for a metric across snapshots
     */
    calculateMax(snapshots, metric) {
        if (snapshots.length === 0) {
            return 0;
        }
        return Math.max(...snapshots.map(snapshot => {
            const value = snapshot.metrics[metric];
            return typeof value === 'number' ? value : 0;
        }));
    }
    /**
     * Calculate performance baseline
     */
    calculatePerformanceBaseline() {
        if (this.metricsHistory.length < 20) {
            return;
        }
        // Use first 20 snapshots as baseline (assuming system starts in good state)
        const baselineSnapshots = this.metricsHistory.slice(0, 20);
        this.performanceBaseline = {
            totalRequests: this.calculateAverage(baselineSnapshots, 'totalRequests'),
            successfulRequests: this.calculateAverage(baselineSnapshots, 'successfulRequests'),
            failedRequests: this.calculateAverage(baselineSnapshots, 'failedRequests'),
            queuedRequests: this.calculateAverage(baselineSnapshots, 'queuedRequests'),
            processingRequests: this.calculateAverage(baselineSnapshots, 'processingRequests'),
            averageProcessingTime: this.calculateAverage(baselineSnapshots, 'averageProcessingTime'),
            averageQueueTime: this.calculateAverage(baselineSnapshots, 'averageQueueTime'),
            queueUtilization: this.calculateAverage(baselineSnapshots, 'queueUtilization'),
            throughput: this.calculateAverage(baselineSnapshots, 'throughput'),
            errorRate: this.calculateAverage(baselineSnapshots, 'errorRate'),
            batchStats: {
                totalBatches: this.calculateAverage(baselineSnapshots, 'batchStats.totalBatches'),
                averageBatchSize: this.calculateAverage(baselineSnapshots, 'batchStats.averageBatchSize'),
                averageBatchTime: this.calculateAverage(baselineSnapshots, 'batchStats.averageBatchTime')
            },
            priorityDistribution: new Map(),
            statusDistribution: new Map(),
            lastUpdated: new Date()
        };
        this.baselineCalculated = true;
        this.logger.info('Performance baseline calculated', { baseline: this.performanceBaseline });
    }
    /**
     * Generate recommendations based on current state
     */
    generateRecommendations(metrics, health, trends, capacity) {
        const recommendations = [];
        // Based on metrics
        if (metrics.queueUtilization > 0.8) {
            recommendations.push('Consider increasing queue capacity or processing power');
        }
        if (metrics.errorRate > 0.05) {
            recommendations.push('Investigate and address error causes');
        }
        if (metrics.averageQueueTime > 30000) {
            recommendations.push('Optimize request processing or increase throughput');
        }
        // Based on trends
        const utilizationTrend = trends.find(t => t.metric === 'queueUtilization');
        if (utilizationTrend && utilizationTrend.direction === 'increasing' && utilizationTrend.confidence > 0.7) {
            recommendations.push('Queue utilization is trending up - monitor closely');
        }
        const errorTrend = trends.find(t => t.metric === 'errorRate');
        if (errorTrend && errorTrend.direction === 'increasing' && errorTrend.confidence > 0.6) {
            recommendations.push('Error rate is increasing - investigate system issues');
        }
        // Based on capacity prediction
        if (capacity.timeToCapacity && capacity.timeToCapacity < 60) {
            recommendations.push('URGENT: Queue approaching capacity - immediate action required');
        }
        // Based on health
        if (health.status === 'degraded') {
            recommendations.push('System is degraded - check component health');
        }
        if (recommendations.length === 0) {
            recommendations.push('System is operating normally');
        }
        return recommendations;
    }
    /**
     * Clean up old data to prevent memory leaks
     */
    cleanupOldData() {
        const cutoff = new Date(Date.now() - this.config.retentionPeriod);
        // Clean metrics history
        this.metricsHistory = this.metricsHistory.filter(snapshot => snapshot.timestamp >= cutoff);
        // Clean alert history
        this.alertHistory = this.alertHistory.filter(alert => alert.timestamp >= cutoff);
        // Clean event history
        this.eventHistory = this.eventHistory.filter(event => event.timestamp >= cutoff);
    }
}
exports.QueueMonitor = QueueMonitor;
//# sourceMappingURL=QueueMonitor.js.map