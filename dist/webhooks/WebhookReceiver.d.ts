/**
 * Secure webhook receiver with Express.js integration and signature validation
 */
import { Express } from 'express';
import winston from 'winston';
import { WebhookConfig, SecurityOptions, WebhookMiddleware } from './types/WebhookTypes';
export declare class WebhookReceiver {
    private app;
    private server;
    private config;
    private securityOptions;
    private middleware;
    private logger;
    private isRunning;
    constructor(config: WebhookConfig | undefined, securityOptions: SecurityOptions, logger?: winston.Logger);
    private mergeWithDefaults;
    private createDefaultLogger;
    private setupMiddleware;
    private setupSecurityMiddleware;
    private setupRoutes;
    private validateAuthentication;
    private validateSignature;
    private generateSignature;
    private compareSignatures;
    private generateWebhookId;
    private processWebhook;
    private sanitizePayload;
    private emitWebhookEvent;
    private handleMiddlewareError;
    addMiddleware(middleware: WebhookMiddleware): void;
    removeMiddleware(name: string): boolean;
    start(): Promise<void>;
    stop(): Promise<void>;
    isListening(): boolean;
    getConfig(): Required<WebhookConfig>;
    getApp(): Express;
}
//# sourceMappingURL=WebhookReceiver.d.ts.map