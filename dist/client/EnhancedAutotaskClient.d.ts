/**
 * Enhanced AutotaskClient with Enterprise Reliability Features
 *
 * This enhanced client integrates the comprehensive reliability system
 * providing enterprise-grade features for production Autotask environments:
 *
 * - Advanced rate limiting with zone-aware throttling
 * - Intelligent retry patterns with circuit breakers
 * - Multi-zone management with automatic failover
 * - Comprehensive error handling and recovery
 * - Production reliability with queue management
 * - Health monitoring and performance optimization
 */
import winston from 'winston';
import { AutotaskAuth, PerformanceConfig } from '../types';
import { CoreClient, ContractClient, FinancialClient, ConfigurationClient, TimeTrackingClient, KnowledgeClient, InventoryClient, ReportsClient } from './sub-clients';
import { ReliabilitySystemConfig, SystemHealth, ReliabilityMetrics, ZoneConfiguration } from '../rate-limiting';
export interface EnhancedAutotaskConfig extends AutotaskAuth {
    reliabilityConfig?: ReliabilitySystemConfig;
    environment?: 'production' | 'development' | 'test';
    performanceConfig?: PerformanceConfig;
    zones?: ZoneConfiguration[];
    enableAutoZoneDetection?: boolean;
    logger?: winston.Logger;
}
/**
 * Enhanced AutotaskClient with comprehensive reliability features
 *
 * Provides all the functionality of the original AutotaskClient plus:
 * - Enterprise-grade reliability and resilience
 * - Multi-zone management and failover
 * - Advanced monitoring and health checks
 * - Intelligent request routing and optimization
 * - Production-ready error handling and recovery
 *
 * @example
 * ```typescript
 * const client = await EnhancedAutotaskClient.create({
 *   username: 'your_username',
 *   integrationCode: 'your_integration_code',
 *   secret: 'your_secret',
 *   environment: 'production',
 *   enableAutoZoneDetection: true,
 *   zones: [
 *     {
 *       zoneId: 'primary',
 *       name: 'Primary Zone',
 *       apiUrl: 'https://webservices1.autotask.net/ATServicesRest/v1.0/',
 *       isBackup: false,
 *       priority: 10
 *     }
 *   ]
 * });
 *
 * // Use with enhanced reliability
 * const tickets = await client.core.tickets.list({
 *   filter: 'status eq Open',
 *   reliabilityOptions: { priority: 8, timeout: 30000 }
 * });
 *
 * // Monitor system health
 * const health = client.getSystemHealth();
 * const metrics = client.getReliabilityMetrics();
 * ```
 */
export declare class EnhancedAutotaskClient {
    private axios;
    private config;
    private logger;
    private rateLimiter;
    private retryPatterns;
    private zoneManager;
    private errorHandler;
    private reliabilityManager;
    private subClients;
    private isFullyInitialized;
    readonly core: CoreClient;
    readonly contractsClient: ContractClient;
    readonly financial: FinancialClient;
    readonly configuration: ConfigurationClient;
    readonly timeTracking: TimeTrackingClient;
    readonly knowledge: KnowledgeClient;
    readonly inventory: InventoryClient;
    readonly reports: ReportsClient;
    private primaryZone;
    private healthCheckInterval?;
    private _directEntityCache;
    private constructor();
    /**
     * Creates a new EnhancedAutotaskClient with comprehensive reliability features
     *
     * @param config - Enhanced configuration including reliability settings
     * @returns Promise<EnhancedAutotaskClient> - Fully configured enhanced client
     */
    static create(config: EnhancedAutotaskConfig): Promise<EnhancedAutotaskClient>;
    /**
     * Get current system health status
     */
    getSystemHealth(): SystemHealth;
    /**
     * Get comprehensive reliability metrics
     */
    getReliabilityMetrics(): ReliabilityMetrics;
    /**
     * Get zone statistics and health
     */
    getZoneStatistics(): Record<string, any>;
    /**
     * Get rate limiting metrics
     */
    getRateLimitMetrics(): import("../rate-limiting").RateLimitMetrics;
    /**
     * Get retry pattern metrics
     */
    getRetryMetrics(): import("../rate-limiting").RetryMetrics;
    /**
     * Force health check on all zones
     */
    performHealthCheck(): Promise<void>;
    /**
     * Add a new zone configuration at runtime
     */
    addZone(zoneConfig: ZoneConfiguration): void;
    /**
     * Remove a zone configuration
     */
    removeZone(zoneId: string): boolean;
    /**
     * Enable or disable graceful degradation mode
     */
    setDegradedMode(enabled: boolean, reason?: string): void;
    /**
     * Clear request queues (emergency operation)
     */
    clearQueues(): number;
    /**
     * Get queue statistics
     */
    getQueueStatistics(): Record<string, any>;
    /**
     * Execute request with enhanced reliability features
     */
    executeEnhancedRequest<T>(requestFn: () => Promise<T>, endpoint: string, method?: string, options?: {
        priority?: number;
        timeout?: number;
        zone?: string;
        retryable?: boolean;
        metadata?: Record<string, any>;
    }): Promise<T>;
    /**
     * Test connection with enhanced diagnostics
     */
    testEnhancedConnection(): Promise<{
        success: boolean;
        zones: Record<string, boolean>;
        systemHealth: SystemHealth;
        responseTime: number;
    }>;
    /**
     * Initialize all sub-clients with enhanced capabilities
     */
    initializeAllSubClients(): Promise<void>;
    /**
     * Get comprehensive configuration details
     */
    getEnhancedConfig(): Readonly<{
        auth: AutotaskAuth;
        environment: string;
        zones: ZoneConfiguration[];
        systemHealth: SystemHealth;
        reliabilityMetrics: ReliabilityMetrics;
    }>;
    /**
     * Setup enhanced request interceptors with reliability features
     */
    private setupEnhancedInterceptors;
    /**
     * Start enhanced health monitoring
     */
    private startHealthMonitoring;
    /**
     * Cleanup and shutdown enhanced client
     */
    destroy(): Promise<void>;
    private getEntityFromSubClient;
    get companies(): any;
    get contacts(): any;
    get tickets(): any;
    get projects(): any;
    get tasks(): any;
    get opportunities(): any;
    get resources(): any;
}
//# sourceMappingURL=EnhancedAutotaskClient.d.ts.map