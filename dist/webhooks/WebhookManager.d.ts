/**
 * Comprehensive webhook manager that orchestrates all webhook system components
 */
import winston from 'winston';
import { EventEmitter } from 'events';
import { SynchronizationEngine } from './patterns/SynchronizationPatterns';
import { WebhookSystemConfig, WebhookHandler, WebhookMiddleware, WebhookMetrics } from './types/WebhookTypes';
export interface WebhookManagerConfig extends WebhookSystemConfig {
    autoStart?: boolean;
    enableHealthCheck?: boolean;
    healthCheckInterval?: number;
}
export interface WebhookSystemMetrics {
    receiver: {
        isRunning: boolean;
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        averageResponseTime: number;
        lastRequestAt?: Date;
    };
    parser: {
        totalParsed: number;
        successfulParsed: number;
        failedParsed: number;
        averageParsingTime: number;
    };
    router: WebhookMetrics;
    delivery: {
        totalJobs: number;
        completedJobs: number;
        failedJobs: number;
        retryingJobs: number;
        deadLetterJobs: number;
        averageProcessingTime: number;
    };
    eventStore: {
        totalEvents: number;
        storageSize: number;
        memoryEvents: number;
        redisEvents: number;
    };
    sync?: {
        totalSyncs: number;
        successfulSyncs: number;
        failedSyncs: number;
        averageSyncTime: number;
    };
}
export interface WebhookSystemHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    components: {
        receiver: 'healthy' | 'unhealthy';
        parser: 'healthy' | 'unhealthy';
        router: 'healthy' | 'unhealthy';
        delivery: 'healthy' | 'unhealthy';
        eventStore: 'healthy' | 'unhealthy';
        sync: 'healthy' | 'unhealthy' | 'disabled';
    };
    lastHealthCheck: Date;
    issues: string[];
}
export declare class WebhookManager extends EventEmitter {
    private config;
    private logger;
    private receiver?;
    private parser;
    private router;
    private deliveryManager?;
    private eventStore?;
    private syncEngine?;
    private isInitialized;
    private isRunning;
    private startTime?;
    private healthCheckTimer?;
    private lastHealth?;
    private metrics;
    constructor(config: WebhookManagerConfig, logger?: winston.Logger);
    private createDefaultLogger;
    private initializeMetrics;
    private setupEventHandlers;
    initialize(): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    private processWebhook;
    addHandler(handler: WebhookHandler): void;
    removeHandler(handlerId: string): boolean;
    getHandlers(): WebhookHandler[];
    addMiddleware(middleware: WebhookMiddleware): void;
    removeMiddleware(name: string): boolean;
    getSyncEngine(): SynchronizationEngine | undefined;
    private setupHealthMonitoring;
    checkHealth(): Promise<WebhookSystemHealth>;
    private updateReceiverMetrics;
    private updateParserMetrics;
    getMetrics(): WebhookSystemMetrics;
    getHealth(): WebhookSystemHealth | undefined;
    resetMetrics(): void;
    isHealthy(): boolean;
    getConfig(): WebhookManagerConfig;
    getUptime(): number;
}
//# sourceMappingURL=WebhookManager.d.ts.map