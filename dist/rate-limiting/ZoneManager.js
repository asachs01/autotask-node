"use strict";
/**
 * Autotask Zone Management System
 *
 * Provides intelligent zone management for Autotask APIs with:
 * - Automatic zone detection and health monitoring
 * - Load balancing across multiple zones
 * - Failover and recovery mechanisms
 * - Performance optimization per zone
 * - Circuit breaker patterns for zone failures
 *
 * Features:
 * - Multi-zone load balancing with weighted routing
 * - Health checks and automatic failover
 * - Zone-specific performance metrics and optimization
 * - Geographic proximity-based routing (when available)
 * - Backup zone configuration and management
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZoneManager = void 0;
const events_1 = require("events");
const axios_1 = __importDefault(require("axios"));
/**
 * Comprehensive zone management for Autotask APIs
 */
class ZoneManager extends events_1.EventEmitter {
    constructor(logger, loadBalancingStrategy) {
        super();
        this.zones = new Map();
        // Zone routing state
        this.lastSelectedZone = null;
        this.roundRobinIndex = 0;
        // Circuit breaker configuration
        this.circuitBreakerThreshold = 0.5; // 50% failure rate
        this.circuitBreakerWindow = 60000; // 1 minute
        this.circuitBreakerRecovery = 30000; // 30 seconds
        this.logger = logger;
        this.loadBalancingStrategy = loadBalancingStrategy || { type: 'weighted_response_time' };
        this.startHealthChecks();
        this.startMetricsCollection();
        this.logger.info('ZoneManager initialized', {
            loadBalancingStrategy: this.loadBalancingStrategy.type
        });
    }
    /**
     * Add a zone configuration
     */
    addZone(config) {
        if (this.zones.has(config.zoneId)) {
            this.logger.warn('Zone already exists, updating configuration', { zoneId: config.zoneId });
        }
        const axiosInstance = axios_1.default.create({
            baseURL: config.apiUrl,
            timeout: 30000,
            maxContentLength: 50 * 1024 * 1024,
            maxBodyLength: 10 * 1024 * 1024
        });
        const zoneInfo = {
            config,
            health: {
                isHealthy: true,
                lastHealthCheck: new Date(),
                responseTime: 0,
                errorRate: 0,
                consecutiveFailures: 0,
                uptime: 100
            },
            metrics: {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                averageResponseTime: 0,
                currentLoad: 0,
                throughput: 0,
                lastRequestTime: null,
                queueLength: 0
            },
            axiosInstance,
            activeRequests: new Set(),
            circuitBreakerOpen: false
        };
        this.zones.set(config.zoneId, zoneInfo);
        this.emit('zoneAdded', { zoneId: config.zoneId, config });
        this.logger.info('Zone added to manager', {
            zoneId: config.zoneId,
            name: config.name,
            apiUrl: config.apiUrl,
            priority: config.priority
        });
        // Perform initial health check
        this.performHealthCheck(config.zoneId);
    }
    /**
     * Remove a zone
     */
    removeZone(zoneId) {
        const zone = this.zones.get(zoneId);
        if (!zone) {
            return false;
        }
        // Wait for active requests to complete or timeout
        if (zone.activeRequests.size > 0) {
            this.logger.warn('Removing zone with active requests', {
                zoneId,
                activeRequests: zone.activeRequests.size
            });
        }
        this.zones.delete(zoneId);
        this.emit('zoneRemoved', { zoneId });
        this.logger.info('Zone removed from manager', { zoneId });
        return true;
    }
    /**
     * Select the best available zone for a request
     */
    selectZone(criteria = { requireHealthy: true, excludeBackup: true }) {
        const availableZones = this.getAvailableZones(criteria);
        if (availableZones.length === 0) {
            this.logger.error('No available zones found', { criteria, totalZones: this.zones.size });
            return null;
        }
        let selectedZone;
        switch (this.loadBalancingStrategy.type) {
            case 'round_robin':
                selectedZone = this.selectRoundRobin(availableZones);
                break;
            case 'least_connections':
                selectedZone = this.selectLeastConnections(availableZones);
                break;
            case 'weighted_response_time':
                selectedZone = this.selectWeightedResponseTime(availableZones);
                break;
            case 'geographic':
                selectedZone = this.selectGeographic(availableZones, criteria.preferredRegion);
                break;
            case 'custom':
                if (this.loadBalancingStrategy.customSelector) {
                    selectedZone = this.loadBalancingStrategy.customSelector(availableZones, criteria);
                }
                else {
                    selectedZone = this.selectWeightedResponseTime(availableZones);
                }
                break;
            default:
                selectedZone = this.selectWeightedResponseTime(availableZones);
        }
        this.lastSelectedZone = selectedZone.config.zoneId;
        this.emit('zoneSelected', {
            zoneId: selectedZone.config.zoneId,
            strategy: this.loadBalancingStrategy.type,
            criteria
        });
        return selectedZone;
    }
    /**
     * Get zone by ID
     */
    getZone(zoneId) {
        return this.zones.get(zoneId) || null;
    }
    /**
     * Get all zones
     */
    getAllZones() {
        return Array.from(this.zones.values());
    }
    /**
     * Get healthy zones
     */
    getHealthyZones() {
        return Array.from(this.zones.values()).filter(zone => zone.health.isHealthy && !zone.circuitBreakerOpen);
    }
    /**
     * Auto-detect zone for a username (using Autotask's zone detection API)
     */
    async autoDetectZone(username) {
        try {
            this.logger.info('Auto-detecting zone for username', { username });
            const response = await axios_1.default.get(`https://webservices.autotask.net/ATServicesRest/V1.0/zoneInformation?user=${encodeURIComponent(username)}`, { timeout: 10000 });
            const zoneUrl = response.data.url;
            const zoneId = this.extractZoneIdFromUrl(zoneUrl);
            const config = {
                zoneId,
                name: `Auto-detected Zone ${zoneId}`,
                apiUrl: zoneUrl + 'v1.0/',
                isBackup: false,
                priority: 8,
                maxConcurrentRequests: 10,
                healthCheckEndpoint: '/CompanyCategories?$select=id&$top=1',
                healthCheckInterval: 30000
            };
            this.logger.info('Zone auto-detected successfully', {
                username,
                zoneId,
                apiUrl: config.apiUrl
            });
            return config;
        }
        catch (error) {
            this.logger.error('Failed to auto-detect zone', { username, error });
            return null;
        }
    }
    /**
     * Record request start for load tracking
     */
    recordRequestStart(zoneId, requestId) {
        const zone = this.zones.get(zoneId);
        if (zone) {
            zone.activeRequests.add(requestId);
            zone.metrics.totalRequests++;
            zone.metrics.currentLoad = zone.activeRequests.size / zone.config.maxConcurrentRequests;
            zone.metrics.lastRequestTime = new Date();
        }
    }
    /**
     * Record request completion
     */
    recordRequestComplete(zoneId, requestId, success, responseTime) {
        const zone = this.zones.get(zoneId);
        if (zone) {
            zone.activeRequests.delete(requestId);
            zone.metrics.currentLoad = zone.activeRequests.size / zone.config.maxConcurrentRequests;
            if (success) {
                zone.metrics.successfulRequests++;
                zone.health.consecutiveFailures = 0;
            }
            else {
                zone.metrics.failedRequests++;
                zone.health.consecutiveFailures++;
            }
            // Update average response time
            zone.metrics.averageResponseTime =
                (zone.metrics.averageResponseTime * 0.9) + (responseTime * 0.1);
            // Update error rate
            zone.health.errorRate = zone.metrics.failedRequests / zone.metrics.totalRequests;
            // Check circuit breaker conditions
            this.checkCircuitBreaker(zone);
            this.emit('requestCompleted', {
                zoneId,
                requestId,
                success,
                responseTime,
                currentLoad: zone.metrics.currentLoad
            });
        }
    }
    /**
     * Get zone statistics
     */
    getZoneStatistics() {
        const stats = {};
        for (const [zoneId, zone] of this.zones.entries()) {
            stats[zoneId] = {
                config: {
                    name: zone.config.name,
                    region: zone.config.region,
                    priority: zone.config.priority,
                    isBackup: zone.config.isBackup
                },
                health: {
                    isHealthy: zone.health.isHealthy,
                    uptime: zone.health.uptime,
                    responseTime: zone.health.responseTime,
                    errorRate: zone.health.errorRate,
                    lastHealthCheck: zone.health.lastHealthCheck
                },
                metrics: {
                    totalRequests: zone.metrics.totalRequests,
                    successRate: zone.metrics.totalRequests > 0 ?
                        (zone.metrics.successfulRequests / zone.metrics.totalRequests) * 100 : 0,
                    averageResponseTime: zone.metrics.averageResponseTime,
                    currentLoad: zone.metrics.currentLoad,
                    throughput: zone.metrics.throughput
                },
                circuitBreaker: {
                    isOpen: zone.circuitBreakerOpen,
                    openUntil: zone.circuitBreakerOpenUntil
                }
            };
        }
        return stats;
    }
    /**
     * Update zone configuration
     */
    updateZoneConfig(zoneId, updates) {
        const zone = this.zones.get(zoneId);
        if (!zone) {
            return false;
        }
        Object.assign(zone.config, updates);
        this.emit('zoneConfigUpdated', { zoneId, updates });
        this.logger.info('Zone configuration updated', { zoneId, updates });
        return true;
    }
    /**
     * Force zone health check
     */
    async forceHealthCheck(zoneId) {
        if (zoneId) {
            await this.performHealthCheck(zoneId);
        }
        else {
            const promises = Array.from(this.zones.keys()).map(id => this.performHealthCheck(id));
            await Promise.all(promises);
        }
    }
    /**
     * Get available zones based on criteria
     */
    getAvailableZones(criteria) {
        let availableZones = Array.from(this.zones.values());
        // Filter by health requirement
        if (criteria.requireHealthy) {
            availableZones = availableZones.filter(zone => zone.health.isHealthy && !zone.circuitBreakerOpen);
        }
        // Filter backup zones if requested
        if (criteria.excludeBackup) {
            availableZones = availableZones.filter(zone => !zone.config.isBackup);
        }
        // Filter by response time
        if (criteria.maxResponseTime) {
            availableZones = availableZones.filter(zone => zone.health.responseTime <= criteria.maxResponseTime);
        }
        // Filter by uptime
        if (criteria.minUptime) {
            availableZones = availableZones.filter(zone => zone.health.uptime >= criteria.minUptime);
        }
        // Filter by region if specified
        if (criteria.preferredRegion) {
            const regionZones = availableZones.filter(zone => zone.config.region === criteria.preferredRegion);
            if (regionZones.length > 0) {
                availableZones = regionZones;
            }
        }
        return availableZones;
    }
    /**
     * Round robin selection
     */
    selectRoundRobin(zones) {
        const zone = zones[this.roundRobinIndex % zones.length];
        this.roundRobinIndex = (this.roundRobinIndex + 1) % zones.length;
        return zone;
    }
    /**
     * Least connections selection
     */
    selectLeastConnections(zones) {
        return zones.reduce((best, current) => current.activeRequests.size < best.activeRequests.size ? current : best);
    }
    /**
     * Weighted response time selection
     */
    selectWeightedResponseTime(zones) {
        // Calculate weighted score based on response time, priority, and load
        return zones.reduce((best, current) => {
            const currentScore = this.calculateZoneScore(current);
            const bestScore = this.calculateZoneScore(best);
            return currentScore > bestScore ? current : best;
        });
    }
    /**
     * Geographic selection
     */
    selectGeographic(zones, preferredRegion) {
        if (preferredRegion) {
            const regionZones = zones.filter(zone => zone.config.region === preferredRegion);
            if (regionZones.length > 0) {
                return this.selectWeightedResponseTime(regionZones);
            }
        }
        return this.selectWeightedResponseTime(zones);
    }
    /**
     * Calculate zone selection score
     */
    calculateZoneScore(zone) {
        const responseTimeFactor = zone.health.responseTime > 0 ?
            1000 / zone.health.responseTime : 10; // Higher is better
        const priorityFactor = zone.config.priority;
        const loadFactor = 1 - zone.metrics.currentLoad; // Lower load is better
        const uptimeFactor = zone.health.uptime / 100;
        return responseTimeFactor * priorityFactor * loadFactor * uptimeFactor;
    }
    /**
     * Perform health check on a zone
     */
    async performHealthCheck(zoneId) {
        const zone = this.zones.get(zoneId);
        if (!zone) {
            return;
        }
        const startTime = Date.now();
        try {
            await zone.axiosInstance.get(zone.config.healthCheckEndpoint, {
                timeout: 5000
            });
            const responseTime = Date.now() - startTime;
            zone.health.isHealthy = true;
            zone.health.lastHealthCheck = new Date();
            zone.health.responseTime = responseTime;
            zone.health.consecutiveFailures = 0;
            // Close circuit breaker if it was open
            if (zone.circuitBreakerOpen) {
                zone.circuitBreakerOpen = false;
                zone.circuitBreakerOpenUntil = undefined;
                this.emit('circuitBreakerClosed', { zoneId });
            }
            this.emit('healthCheckSuccess', { zoneId, responseTime });
        }
        catch (error) {
            zone.health.isHealthy = false;
            zone.health.lastHealthCheck = new Date();
            zone.health.consecutiveFailures++;
            zone.health.lastError = error;
            this.emit('healthCheckFailed', { zoneId, error: error });
            this.logger.warn('Zone health check failed', {
                zoneId,
                error: error.message,
                consecutiveFailures: zone.health.consecutiveFailures
            });
        }
    }
    /**
     * Check circuit breaker conditions
     */
    checkCircuitBreaker(zone) {
        if (zone.circuitBreakerOpen) {
            // Check if recovery time has passed
            if (zone.circuitBreakerOpenUntil && new Date() > zone.circuitBreakerOpenUntil) {
                zone.circuitBreakerOpen = false;
                zone.circuitBreakerOpenUntil = undefined;
                this.emit('circuitBreakerClosed', { zoneId: zone.config.zoneId });
            }
            return;
        }
        // Check if circuit breaker should be triggered
        if (zone.health.errorRate > this.circuitBreakerThreshold &&
            zone.metrics.totalRequests > 10) {
            zone.circuitBreakerOpen = true;
            zone.circuitBreakerOpenUntil = new Date(Date.now() + this.circuitBreakerRecovery);
            this.emit('circuitBreakerOpened', {
                zoneId: zone.config.zoneId,
                errorRate: zone.health.errorRate
            });
            this.logger.warn('Zone circuit breaker opened', {
                zoneId: zone.config.zoneId,
                errorRate: zone.health.errorRate,
                openUntil: zone.circuitBreakerOpenUntil
            });
        }
    }
    /**
     * Extract zone ID from Autotask URL
     */
    extractZoneIdFromUrl(url) {
        const match = url.match(/webservices(\d+)\.autotask\.net/);
        return match ? match[1] : 'unknown';
    }
    /**
     * Start health check monitoring
     */
    startHealthChecks() {
        this.healthCheckInterval = setInterval(() => {
            for (const zoneId of this.zones.keys()) {
                this.performHealthCheck(zoneId);
            }
        }, 30000); // Check every 30 seconds
    }
    /**
     * Start metrics collection
     */
    startMetricsCollection() {
        this.metricsInterval = setInterval(() => {
            for (const zone of this.zones.values()) {
                // Update throughput (requests per second over last minute)
                if (zone.metrics.lastRequestTime) {
                    const timeDiff = (Date.now() - zone.metrics.lastRequestTime.getTime()) / 1000;
                    zone.metrics.throughput = timeDiff > 0 ?
                        zone.metrics.totalRequests / timeDiff : 0;
                }
                // Update uptime based on health checks
                const healthyChecks = zone.health.consecutiveFailures === 0 ? 1 : 0;
                zone.health.uptime = (zone.health.uptime * 0.95) + (healthyChecks * 5);
                zone.health.uptime = Math.min(100, Math.max(0, zone.health.uptime));
            }
            this.emit('metricsUpdated', this.getZoneStatistics());
        }, 60000); // Update every minute
    }
    /**
     * Cleanup and shutdown
     */
    destroy() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
        this.zones.clear();
        this.removeAllListeners();
        this.logger.info('ZoneManager destroyed');
    }
}
exports.ZoneManager = ZoneManager;
//# sourceMappingURL=ZoneManager.js.map