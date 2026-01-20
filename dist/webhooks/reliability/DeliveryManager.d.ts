/**
 * Delivery manager ensuring reliable event delivery with various guarantees
 */
import winston from 'winston';
import { EventEmitter } from 'events';
import { WebhookEvent, WebhookHandler, WebhookHandlerResult, DeliveryOptions } from '../types/WebhookTypes';
export interface DeliveryManagerConfig {
    redis: {
        host: string;
        port: number;
        password?: string;
        db?: number;
    };
    defaultDeliveryOptions: DeliveryOptions;
    queuePrefix: string;
    enableMetrics: boolean;
    cleanupInterval: number;
    maxJobAge: number;
}
export interface DeliveryMetrics {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    retryingJobs: number;
    deadLetterJobs: number;
    averageProcessingTime: number;
    lastProcessedAt?: Date;
}
export interface DeliveryJob {
    id: string;
    event: WebhookEvent;
    handler: WebhookHandler;
    options: DeliveryOptions;
    attempt: number;
    maxAttempts: number;
    createdAt: Date;
    scheduledAt?: Date;
    processedAt?: Date;
    completedAt?: Date;
    error?: string;
    result?: WebhookHandlerResult;
}
export declare class DeliveryManager extends EventEmitter {
    private config;
    private logger;
    private redis;
    private mainQueue;
    private retryQueue;
    private deadLetterQueue;
    private metrics;
    private idempotencyCache;
    private cleanupTimer?;
    constructor(config: DeliveryManagerConfig, logger?: winston.Logger);
    private createDefaultLogger;
    private initializeMetrics;
    private setupRedis;
    private setupQueues;
    private setupQueueProcessors;
    private setupQueueEventHandlers;
    private setupCleanup;
    deliver(event: WebhookEvent, handler: WebhookHandler, options?: Partial<DeliveryOptions>): Promise<string>;
    private processDelivery;
    private handleDeliveryFailure;
    private shouldRetry;
    private scheduleRetry;
    private calculateRetryDelay;
    private processRetry;
    private sendToDeadLetterQueue;
    private processManualIntervention;
    private executeWithTimeout;
    private generateJobId;
    private generateIdempotencyKey;
    private updateAverageProcessingTime;
    private cleanup;
    getJobStatus(jobId: string): Promise<DeliveryJob | null>;
    cancelJob(jobId: string): Promise<boolean>;
    retryDeadLetterJob(jobId: string): Promise<boolean>;
    getMetrics(): DeliveryMetrics;
    getQueueStats(): Promise<{
        main: {
            waiting: number;
            active: number;
            completed: number;
            failed: number;
        };
        retry: {
            waiting: number;
            active: number;
            completed: number;
            failed: number;
        };
        dlq: {
            waiting: number;
            active: number;
            completed: number;
            failed: number;
        };
    }>;
    shutdown(): Promise<void>;
}
//# sourceMappingURL=DeliveryManager.d.ts.map