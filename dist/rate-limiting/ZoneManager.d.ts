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
import { EventEmitter } from 'events';
import winston from 'winston';
import { AxiosInstance } from 'axios';
export interface ZoneConfiguration {
    zoneId: string;
    name: string;
    apiUrl: string;
    region?: string;
    isBackup: boolean;
    priority: number;
    maxConcurrentRequests: number;
    healthCheckEndpoint: string;
    healthCheckInterval: number;
}
export interface ZoneHealth {
    isHealthy: boolean;
    lastHealthCheck: Date;
    responseTime: number;
    errorRate: number;
    consecutiveFailures: number;
    lastError?: Error;
    uptime: number;
}
export interface ZoneMetrics {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    currentLoad: number;
    throughput: number;
    lastRequestTime: Date | null;
    queueLength: number;
}
export interface LoadBalancingStrategy {
    type: 'round_robin' | 'least_connections' | 'weighted_response_time' | 'geographic' | 'custom';
    customSelector?: (zones: ZoneInfo[], request: any) => ZoneInfo;
}
export interface ZoneInfo {
    config: ZoneConfiguration;
    health: ZoneHealth;
    metrics: ZoneMetrics;
    axiosInstance: AxiosInstance;
    activeRequests: Set<string>;
    circuitBreakerOpen: boolean;
    circuitBreakerOpenUntil?: Date;
}
export interface ZoneSelectionCriteria {
    preferredRegion?: string;
    requireHealthy: boolean;
    excludeBackup: boolean;
    maxResponseTime?: number;
    minUptime?: number;
}
/**
 * Comprehensive zone management for Autotask APIs
 */
export declare class ZoneManager extends EventEmitter {
    private logger;
    private zones;
    private loadBalancingStrategy;
    private healthCheckInterval?;
    private metricsInterval?;
    private lastSelectedZone;
    private roundRobinIndex;
    private circuitBreakerThreshold;
    private circuitBreakerWindow;
    private circuitBreakerRecovery;
    constructor(logger: winston.Logger, loadBalancingStrategy?: LoadBalancingStrategy);
    /**
     * Add a zone configuration
     */
    addZone(config: ZoneConfiguration): void;
    /**
     * Remove a zone
     */
    removeZone(zoneId: string): boolean;
    /**
     * Select the best available zone for a request
     */
    selectZone(criteria?: ZoneSelectionCriteria): ZoneInfo | null;
    /**
     * Get zone by ID
     */
    getZone(zoneId: string): ZoneInfo | null;
    /**
     * Get all zones
     */
    getAllZones(): ZoneInfo[];
    /**
     * Get healthy zones
     */
    getHealthyZones(): ZoneInfo[];
    /**
     * Auto-detect zone for a username (using Autotask's zone detection API)
     */
    autoDetectZone(username: string): Promise<ZoneConfiguration | null>;
    /**
     * Record request start for load tracking
     */
    recordRequestStart(zoneId: string, requestId: string): void;
    /**
     * Record request completion
     */
    recordRequestComplete(zoneId: string, requestId: string, success: boolean, responseTime: number): void;
    /**
     * Get zone statistics
     */
    getZoneStatistics(): Record<string, any>;
    /**
     * Update zone configuration
     */
    updateZoneConfig(zoneId: string, updates: Partial<ZoneConfiguration>): boolean;
    /**
     * Force zone health check
     */
    forceHealthCheck(zoneId?: string): Promise<void>;
    /**
     * Get available zones based on criteria
     */
    private getAvailableZones;
    /**
     * Round robin selection
     */
    private selectRoundRobin;
    /**
     * Least connections selection
     */
    private selectLeastConnections;
    /**
     * Weighted response time selection
     */
    private selectWeightedResponseTime;
    /**
     * Geographic selection
     */
    private selectGeographic;
    /**
     * Calculate zone selection score
     */
    private calculateZoneScore;
    /**
     * Perform health check on a zone
     */
    private performHealthCheck;
    /**
     * Check circuit breaker conditions
     */
    private checkCircuitBreaker;
    /**
     * Extract zone ID from Autotask URL
     */
    private extractZoneIdFromUrl;
    /**
     * Start health check monitoring
     */
    private startHealthChecks;
    /**
     * Start metrics collection
     */
    private startMetricsCollection;
    /**
     * Cleanup and shutdown
     */
    destroy(): void;
}
//# sourceMappingURL=ZoneManager.d.ts.map