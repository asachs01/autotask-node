"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedAutotaskClient = void 0;
const axios_1 = __importDefault(require("axios"));
const winston_1 = __importDefault(require("winston"));
const types_1 = require("../types");
const http = __importStar(require("http"));
const https = __importStar(require("https"));
// Import sub-clients (same as original)
const sub_clients_1 = require("./sub-clients");
// Import the comprehensive reliability system
const rate_limiting_1 = require("../rate-limiting");
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
class EnhancedAutotaskClient {
    constructor(config, axiosInstance, reliabilitySystem) {
        // Sub-clients (enhanced with reliability features)
        this.subClients = new Map();
        this.isFullyInitialized = false;
        // Enhanced features
        this.primaryZone = null;
        // Backward compatibility cache
        this._directEntityCache = new Map();
        this.config = config;
        this.axios = axiosInstance;
        this.logger = reliabilitySystem.logger;
        // Initialize reliability system components
        this.rateLimiter = reliabilitySystem.rateLimiter;
        this.retryPatterns = reliabilitySystem.retryPatterns;
        this.zoneManager = reliabilitySystem.zoneManager;
        this.errorHandler = reliabilitySystem.errorHandler;
        this.reliabilityManager = reliabilitySystem.reliabilityManager;
        // Initialize sub-clients with enhanced capabilities
        this.core = new sub_clients_1.CoreClient(this.axios, this.logger);
        this.contractsClient = new sub_clients_1.ContractClient(this.axios, this.logger);
        this.financial = new sub_clients_1.FinancialClient(this.axios, this.logger);
        this.configuration = new sub_clients_1.ConfigurationClient(this.axios, this.logger);
        this.timeTracking = new sub_clients_1.TimeTrackingClient(this.axios, this.logger);
        this.knowledge = new sub_clients_1.KnowledgeClient(this.axios, this.logger);
        this.inventory = new sub_clients_1.InventoryClient(this.axios, this.logger);
        this.reports = new sub_clients_1.ReportsClient(this.axios, this.logger);
        // Register sub-clients
        this.subClients.set('core', this.core);
        this.subClients.set('contracts', this.contractsClient);
        this.subClients.set('financial', this.financial);
        this.subClients.set('configuration', this.configuration);
        this.subClients.set('timeTracking', this.timeTracking);
        this.subClients.set('knowledge', this.knowledge);
        this.subClients.set('inventory', this.inventory);
        this.subClients.set('reports', this.reports);
        // Setup enhanced request interceptors
        this.setupEnhancedInterceptors();
        // Start health monitoring
        this.startHealthMonitoring();
        this.logger.info('EnhancedAutotaskClient initialized successfully', {
            environment: config.environment,
            zonesConfigured: config.zones?.length || 0,
            autoZoneDetection: config.enableAutoZoneDetection,
        });
    }
    /**
     * Creates a new EnhancedAutotaskClient with comprehensive reliability features
     *
     * @param config - Enhanced configuration including reliability settings
     * @returns Promise<EnhancedAutotaskClient> - Fully configured enhanced client
     */
    static async create(config) {
        const logger = config.logger ||
            winston_1.default.createLogger({
                level: config.environment === 'production' ? 'info' : 'debug',
                format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
                transports: [
                    new winston_1.default.transports.Console({
                        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
                        stderrLevels: [
                            'error',
                            'warn',
                            'info',
                            'http',
                            'verbose',
                            'debug',
                            'silly',
                        ],
                    }),
                ],
            });
        // Validate required configuration
        if (!config.username || !config.integrationCode || !config.secret) {
            const envConfig = {
                username: process.env.AUTOTASK_USERNAME,
                integrationCode: process.env.AUTOTASK_INTEGRATION_CODE,
                secret: process.env.AUTOTASK_SECRET,
                apiUrl: process.env.AUTOTASK_API_URL,
            };
            if (!envConfig.username ||
                !envConfig.integrationCode ||
                !envConfig.secret) {
                throw new types_1.ConfigurationError('Missing required configuration: username, integrationCode, and secret are required');
            }
            Object.assign(config, envConfig);
        }
        // Create reliability system based on environment
        const reliabilitySystem = config.environment === 'production'
            ? (0, rate_limiting_1.createProductionReliabilitySystem)(config.reliabilityConfig || {}, logger)
            : (0, rate_limiting_1.createDevelopmentReliabilitySystem)(config.reliabilityConfig || {}, logger);
        // Handle zone detection and configuration
        let primaryZoneConfig = null;
        if (config.enableAutoZoneDetection !== false && config.username) {
            try {
                logger.info('Auto-detecting Autotask zone', {
                    username: config.username,
                });
                primaryZoneConfig = await reliabilitySystem.zoneManager.autoDetectZone(config.username);
                if (primaryZoneConfig) {
                    reliabilitySystem.zoneManager.addZone(primaryZoneConfig);
                    reliabilitySystem.rateLimiter.registerZone(primaryZoneConfig.zoneId, primaryZoneConfig.apiUrl);
                    config.apiUrl = primaryZoneConfig.apiUrl;
                    logger.info('Primary zone auto-detected and configured', {
                        zoneId: primaryZoneConfig.zoneId,
                        apiUrl: primaryZoneConfig.apiUrl,
                    });
                }
            }
            catch (error) {
                logger.warn('Auto zone detection failed, falling back to manual configuration', { error });
            }
        }
        // Configure additional zones
        if (config.zones && config.zones.length > 0) {
            for (const zoneConfig of config.zones) {
                reliabilitySystem.zoneManager.addZone(zoneConfig);
                reliabilitySystem.rateLimiter.registerZone(zoneConfig.zoneId, zoneConfig.apiUrl);
                if (zoneConfig.priority >= 9 ||
                    (!primaryZoneConfig && !zoneConfig.isBackup)) {
                    config.apiUrl = zoneConfig.apiUrl;
                    primaryZoneConfig = zoneConfig;
                }
            }
            logger.info('Additional zones configured', {
                count: config.zones.length,
            });
        }
        // Ensure we have an API URL
        if (!config.apiUrl) {
            throw new types_1.ConfigurationError('No API URL configured. Enable auto zone detection or provide zone configurations.');
        }
        // Create enhanced axios instance with reliability features
        const performanceConfig = {
            timeout: 30000,
            maxConcurrentRequests: 10,
            enableConnectionPooling: true,
            maxContentLength: 50 * 1024 * 1024, // 50MB
            maxBodyLength: 10 * 1024 * 1024, // 10MB
            enableCompression: true,
            requestsPerSecond: 5,
            keepAliveTimeout: 30000,
            ...config.performanceConfig,
        };
        // Setup connection pooling
        const httpAgent = new http.Agent({
            keepAlive: performanceConfig.enableConnectionPooling,
            keepAliveMsecs: performanceConfig.keepAliveTimeout,
            maxSockets: performanceConfig.maxConcurrentRequests,
        });
        const httpsAgent = new https.Agent({
            keepAlive: performanceConfig.enableConnectionPooling,
            keepAliveMsecs: performanceConfig.keepAliveTimeout,
            maxSockets: performanceConfig.maxConcurrentRequests,
        });
        const axiosInstance = axios_1.default.create({
            baseURL: config.apiUrl,
            timeout: performanceConfig.timeout,
            maxContentLength: performanceConfig.maxContentLength,
            maxBodyLength: performanceConfig.maxBodyLength,
            decompress: performanceConfig.enableCompression,
            httpAgent,
            httpsAgent,
            headers: {
                'Content-Type': 'application/json',
                ApiIntegrationCode: config.integrationCode,
                UserName: config.username,
                Secret: config.secret,
            },
        });
        // Test connection with reliability features
        try {
            logger.info('Testing enhanced API connection...');
            const testZone = primaryZoneConfig?.zoneId || 'primary';
            await reliabilitySystem.reliabilityManager.executeRequest(() => axiosInstance.get('/CompanyCategories?$select=id&$top=1'), '/CompanyCategories', 'GET', testZone);
            logger.info('Enhanced API connection test successful');
        }
        catch (error) {
            throw new types_1.ConfigurationError('Failed to connect to Autotask API with enhanced reliability features', 'connection', error);
        }
        const client = new EnhancedAutotaskClient(config, axiosInstance, reliabilitySystem);
        client.primaryZone = primaryZoneConfig?.zoneId || 'primary';
        return client;
    }
    /**
     * Get current system health status
     */
    getSystemHealth() {
        return this.reliabilityManager.getSystemHealth();
    }
    /**
     * Get comprehensive reliability metrics
     */
    getReliabilityMetrics() {
        return this.reliabilityManager.getMetrics();
    }
    /**
     * Get zone statistics and health
     */
    getZoneStatistics() {
        return this.zoneManager.getZoneStatistics();
    }
    /**
     * Get rate limiting metrics
     */
    getRateLimitMetrics() {
        return this.rateLimiter.getMetrics();
    }
    /**
     * Get retry pattern metrics
     */
    getRetryMetrics() {
        return this.retryPatterns.getMetrics();
    }
    /**
     * Force health check on all zones
     */
    async performHealthCheck() {
        await this.zoneManager.forceHealthCheck();
    }
    /**
     * Add a new zone configuration at runtime
     */
    addZone(zoneConfig) {
        this.zoneManager.addZone(zoneConfig);
        this.rateLimiter.registerZone(zoneConfig.zoneId, zoneConfig.apiUrl);
        this.logger.info('Zone added at runtime', {
            zoneId: zoneConfig.zoneId,
            name: zoneConfig.name,
            priority: zoneConfig.priority,
        });
    }
    /**
     * Remove a zone configuration
     */
    removeZone(zoneId) {
        const removed = this.zoneManager.removeZone(zoneId);
        if (removed) {
            this.logger.info('Zone removed', { zoneId });
        }
        return removed;
    }
    /**
     * Enable or disable graceful degradation mode
     */
    setDegradedMode(enabled, reason) {
        this.reliabilityManager.setDegradedMode(enabled, reason);
    }
    /**
     * Clear request queues (emergency operation)
     */
    clearQueues() {
        return this.reliabilityManager.clearQueue(true);
    }
    /**
     * Get queue statistics
     */
    getQueueStatistics() {
        return this.reliabilityManager.getQueueStatistics();
    }
    /**
     * Execute request with enhanced reliability features
     */
    async executeEnhancedRequest(requestFn, endpoint, method = 'GET', options = {}) {
        const zone = options.zone || this.primaryZone || 'primary';
        return this.reliabilityManager.queueRequest(endpoint, method, zone, () => this.reliabilityManager.executeRequest(requestFn, endpoint, method, zone, options.metadata), {
            priority: options.priority || 5,
            timeout: options.timeout || 30000,
            retryable: options.retryable !== false,
            metadata: options.metadata,
        });
    }
    /**
     * Test connection with enhanced diagnostics
     */
    async testEnhancedConnection() {
        const startTime = Date.now();
        try {
            // Test connection through reliability system
            await this.executeEnhancedRequest(() => this.axios.get('/CompanyCategories?$select=id&$top=1'), '/CompanyCategories', 'GET', { priority: 10 } // High priority for health check
            );
            const responseTime = Date.now() - startTime;
            const zoneConnections = this.zoneManager.getZoneStatistics();
            const systemHealth = this.getSystemHealth();
            return {
                success: true,
                zones: zoneConnections,
                systemHealth,
                responseTime,
            };
        }
        catch (error) {
            this.logger.error('Enhanced connection test failed', error);
            return {
                success: false,
                zones: {},
                systemHealth: this.getSystemHealth(),
                responseTime: Date.now() - startTime,
            };
        }
    }
    /**
     * Initialize all sub-clients with enhanced capabilities
     */
    async initializeAllSubClients() {
        if (this.isFullyInitialized) {
            return;
        }
        this.logger.info('Initializing all sub-clients with enhanced reliability...');
        const initPromises = Array.from(this.subClients.values()).map(subClient => subClient.initialize());
        await Promise.all(initPromises);
        this.isFullyInitialized = true;
        this.logger.info('All enhanced sub-clients initialized successfully');
    }
    /**
     * Get comprehensive configuration details
     */
    getEnhancedConfig() {
        return {
            auth: {
                username: this.config.username,
                integrationCode: this.config.integrationCode,
                secret: '[REDACTED]',
                apiUrl: this.config.apiUrl,
            },
            environment: this.config.environment || 'development',
            zones: this.zoneManager.getAllZones().map(zone => zone.config),
            systemHealth: this.getSystemHealth(),
            reliabilityMetrics: this.getReliabilityMetrics(),
        };
    }
    /**
     * Setup enhanced request interceptors with reliability features
     */
    setupEnhancedInterceptors() {
        // Request interceptor with enhanced reliability
        this.axios.interceptors.request.use(async (config) => {
            // Add request tracking
            const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            config.metadata = {
                requestId,
                startTime: Date.now(),
                zone: this.primaryZone || 'primary',
            };
            return config;
        }, error => {
            this.logger.error('Request interceptor error:', error);
            return Promise.reject(error);
        });
        // Response interceptor with enhanced error handling
        this.axios.interceptors.response.use(response => {
            const duration = Date.now() - (response.config.metadata?.startTime || 0);
            const zone = response.config.metadata?.zone || 'primary';
            const requestId = response.config.metadata?.requestId;
            // Record successful response
            if (requestId) {
                this.zoneManager.recordRequestComplete(zone, requestId, true, duration);
            }
            response.metadata = {
                ...response.config.metadata,
                duration,
                success: true,
            };
            return response;
        }, async (error) => {
            const duration = Date.now() - (error.config?.metadata?.startTime || 0);
            const zone = error.config?.metadata?.zone || 'primary';
            const requestId = error.config?.metadata?.requestId;
            // Record failed response
            if (requestId) {
                this.zoneManager.recordRequestComplete(zone, requestId, false, duration);
            }
            // Handle error through enhanced error handler
            if (error.config?.metadata) {
                const handledError = await this.errorHandler.handleError(error, {
                    endpoint: error.config.url || 'unknown',
                    method: error.config.method || 'GET',
                    requestId: requestId || 'unknown',
                    zone,
                    timestamp: new Date(error.config.metadata.startTime || Date.now()),
                });
                return Promise.reject(handledError);
            }
            return Promise.reject(error);
        });
    }
    /**
     * Start enhanced health monitoring
     */
    startHealthMonitoring() {
        this.healthCheckInterval = setInterval(() => {
            const systemHealth = this.getSystemHealth();
            if (systemHealth.overall === 'CRITICAL' ||
                systemHealth.overall === 'UNAVAILABLE') {
                this.logger.error('System health is critical', systemHealth);
            }
            else if (systemHealth.overall === 'DEGRADED') {
                this.logger.warn('System health is degraded', systemHealth);
            }
            // Log metrics periodically
            const metrics = this.getReliabilityMetrics();
            if (metrics.totalRequests % 1000 === 0 && metrics.totalRequests > 0) {
                this.logger.info('Enhanced client performance summary', {
                    totalRequests: metrics.totalRequests,
                    availability: `${metrics.availability.toFixed(2)}%`,
                    averageQueueTime: `${metrics.averageQueueTime}ms`,
                    systemHealth: systemHealth.overall,
                });
            }
        }, 60000); // Check every minute
    }
    /**
     * Cleanup and shutdown enhanced client
     */
    async destroy() {
        this.logger.info('Destroying enhanced Autotask client...');
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        // Destroy reliability system components
        this.rateLimiter.destroy();
        this.retryPatterns.destroy();
        this.zoneManager.destroy();
        this.errorHandler.destroy();
        this.reliabilityManager.destroy();
        // Clear caches
        this._directEntityCache.clear();
        this.subClients.clear();
        this.logger.info('Enhanced Autotask client destroyed successfully');
    }
    // =============================================================================
    // BACKWARD COMPATIBILITY SECTION
    // =============================================================================
    // All the same backward compatibility properties as the original client
    // These now benefit from enhanced reliability features automatically
    getEntityFromSubClient(subClientName, entityName) {
        const cacheKey = `${subClientName}.${entityName}`;
        if (this._directEntityCache.has(cacheKey)) {
            return this._directEntityCache.get(cacheKey);
        }
        const subClient = this[subClientName];
        if (subClient && subClient[entityName]) {
            this._directEntityCache.set(cacheKey, subClient[entityName]);
            return subClient[entityName];
        }
        return undefined;
    }
    // Core entities - direct access with enhanced reliability
    get companies() {
        return this.getEntityFromSubClient('core', 'companies');
    }
    get contacts() {
        return this.getEntityFromSubClient('core', 'contacts');
    }
    get tickets() {
        return this.getEntityFromSubClient('core', 'tickets');
    }
    get projects() {
        return this.getEntityFromSubClient('core', 'projects');
    }
    get tasks() {
        return this.getEntityFromSubClient('core', 'tasks');
    }
    get opportunities() {
        return this.getEntityFromSubClient('core', 'opportunities');
    }
    get resources() {
        return this.getEntityFromSubClient('core', 'resources');
    }
}
exports.EnhancedAutotaskClient = EnhancedAutotaskClient;
//# sourceMappingURL=EnhancedAutotaskClient.js.map