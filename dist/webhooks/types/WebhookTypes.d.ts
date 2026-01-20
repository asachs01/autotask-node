/**
 * Comprehensive webhook type definitions for Autotask webhook system
 */
import { Request, Response, NextFunction } from 'express';
export interface WebhookConfig {
    port?: number;
    host?: string;
    path?: string;
    secret?: string;
    timeout?: number;
    maxPayloadSize?: string;
    enableCors?: boolean;
    corsOptions?: {
        origin?: string | string[];
        methods?: string[];
        allowedHeaders?: string[];
    };
    rateLimiting?: {
        windowMs?: number;
        max?: number;
        message?: string;
    };
}
export interface WebhookSignature {
    algorithm: 'sha256' | 'sha1' | 'md5';
    secret: string;
    header: string;
    prefix?: string;
}
export interface WebhookRequest extends Request {
    rawBody?: Buffer;
    signature?: string;
    webhookId?: string;
    timestamp?: Date;
    verified?: boolean;
}
export interface WebhookResponse {
    success: boolean;
    message?: string;
    eventId?: string;
    processedAt?: Date;
    errors?: WebhookError[];
}
export interface WebhookError {
    code: string;
    message: string;
    field?: string;
    details?: any;
}
export interface WebhookHandler<T = any> {
    id: string;
    name: string;
    description?: string;
    priority?: number;
    enabled?: boolean;
    filter?: WebhookFilter;
    handle: (event: WebhookEvent<T>) => Promise<WebhookHandlerResult>;
}
export interface WebhookHandlerResult {
    success: boolean;
    message?: string;
    data?: any;
    errors?: WebhookError[];
    retry?: boolean;
    nextRetry?: Date;
}
export interface WebhookFilter {
    entityType?: string | string[];
    action?: WebhookAction | WebhookAction[];
    conditions?: FilterCondition[];
    customFilter?: (event: WebhookEvent) => boolean;
}
export interface FilterCondition {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'exists' | 'not_exists';
    value: any;
}
export interface WebhookEvent<T = any> {
    id: string;
    type: WebhookEventType;
    action: WebhookAction;
    entityType: string;
    entityId: string;
    timestamp: Date;
    source: WebhookSource;
    data: T;
    previousData?: T;
    changes?: WebhookChange[];
    metadata?: WebhookMetadata;
    signature?: string;
    retry?: {
        attempt: number;
        maxAttempts: number;
        lastAttempt?: Date;
        nextAttempt?: Date;
    };
}
export interface WebhookChange {
    field: string;
    oldValue: any;
    newValue: any;
    type: 'create' | 'update' | 'delete';
}
export interface WebhookMetadata {
    userId?: string;
    userName?: string;
    userAgent?: string;
    ipAddress?: string;
    correlationId?: string;
    tags?: string[];
    [key: string]: any;
}
export interface WebhookSource {
    system: 'autotask' | 'external' | 'internal';
    version?: string;
    zone?: string;
    environment?: 'production' | 'staging' | 'development';
}
export declare enum WebhookEventType {
    ENTITY_CREATED = "entity.created",
    ENTITY_UPDATED = "entity.updated",
    ENTITY_DELETED = "entity.deleted",
    ENTITY_RESTORED = "entity.restored",
    SYSTEM_EVENT = "system.event",
    BATCH_OPERATION = "batch.operation",
    CUSTOM_EVENT = "custom.event"
}
export declare enum WebhookAction {
    CREATE = "create",
    UPDATE = "update",
    DELETE = "delete",
    RESTORE = "restore",
    BATCH_CREATE = "batch_create",
    BATCH_UPDATE = "batch_update",
    BATCH_DELETE = "batch_delete",
    STATUS_CHANGE = "status_change",
    ASSIGNMENT_CHANGE = "assignment_change",
    CUSTOM = "custom"
}
export interface DeliveryOptions {
    mode: 'at_least_once' | 'exactly_once' | 'at_most_once';
    retryPolicy: RetryPolicy;
    timeout?: number;
    deadLetterQueue?: boolean;
    persistEvents?: boolean;
}
export interface RetryPolicy {
    maxAttempts: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
    jitterMs?: number;
    retryableErrors?: string[];
}
export interface EventStore {
    save(event: WebhookEvent): Promise<void>;
    get(eventId: string): Promise<WebhookEvent | null>;
    getByFilter(filter: EventStoreFilter): Promise<WebhookEvent[]>;
    delete(eventId: string): Promise<void>;
    markProcessed(eventId: string, result: WebhookHandlerResult): Promise<void>;
}
export interface EventStoreFilter {
    entityType?: string;
    action?: WebhookAction;
    fromDate?: Date;
    toDate?: Date;
    processed?: boolean;
    failed?: boolean;
    limit?: number;
    offset?: number;
}
export interface WebhookQueue {
    name: string;
    concurrency: number;
    rateLimiting?: {
        max: number;
        duration: number;
    };
    retryPolicy: RetryPolicy;
    deadLetterQueue?: string;
}
export interface QueueJob {
    id: string;
    event: WebhookEvent;
    handler: WebhookHandler;
    attempts: number;
    createdAt: Date;
    processedAt?: Date;
    completedAt?: Date;
    failedAt?: Date;
    error?: WebhookError;
}
export interface WebhookMetrics {
    totalEvents: number;
    processedEvents: number;
    failedEvents: number;
    averageProcessingTime: number;
    eventsByType: Record<string, number>;
    eventsByAction: Record<string, number>;
    handlerMetrics: Record<string, HandlerMetrics>;
}
export interface HandlerMetrics {
    id: string;
    name: string;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    lastExecutionAt?: Date;
    errors: WebhookError[];
}
export interface WebhookMiddleware {
    name: string;
    before?: (req: WebhookRequest, res: Response, next: NextFunction) => Promise<void> | void;
    after?: (req: WebhookRequest, res: Response, result: WebhookHandlerResult) => Promise<void> | void;
    error?: (error: Error, req: WebhookRequest, res: Response, next: NextFunction) => Promise<void> | void;
}
export interface WebhookPlugin {
    name: string;
    version: string;
    description?: string;
    initialize: (config: any) => Promise<void>;
    destroy?: () => Promise<void>;
    middleware?: WebhookMiddleware[];
    handlers?: WebhookHandler[];
}
export interface SecurityOptions {
    validateSignature: boolean;
    signatureConfig?: WebhookSignature;
    allowedIps?: string[];
    requireAuth?: boolean;
    authConfig?: AuthConfig;
    sanitizeInput?: boolean;
    maxPayloadSize?: number;
    rateLimiting?: RateLimitConfig;
}
export interface AuthConfig {
    type: 'api_key' | 'bearer_token' | 'oauth' | 'basic';
    config: {
        [key: string]: any;
    };
}
export interface RateLimitConfig {
    windowMs: number;
    max: number;
    message?: string;
    standardHeaders?: boolean;
    legacyHeaders?: boolean;
}
export interface WebhookTest {
    id: string;
    name: string;
    description?: string;
    payload: any;
    expectedResponse?: WebhookResponse;
    expectedHandlerResults?: Record<string, WebhookHandlerResult>;
    metadata?: {
        tags?: string[];
        category?: string;
        [key: string]: any;
    };
}
export interface SimulationConfig {
    eventTypes: WebhookEventType[];
    entityTypes: string[];
    frequency: number;
    duration?: number;
    randomData?: boolean;
    templates?: Record<string, any>;
}
export interface SynchronizationConfig {
    source: string;
    target: string;
    bidirectional: boolean;
    conflictResolution: 'source_wins' | 'target_wins' | 'timestamp' | 'manual';
    mappings: FieldMapping[];
    filters?: WebhookFilter[];
}
export interface FieldMapping {
    sourceField: string;
    targetField: string;
    transform?: (value: any) => any;
    required?: boolean;
}
export interface WorkflowConfig {
    id: string;
    name: string;
    description?: string;
    trigger: WebhookFilter;
    steps: WorkflowStep[];
    errorHandling?: ErrorHandlingConfig;
}
export interface WorkflowStep {
    id: string;
    name: string;
    type: 'action' | 'condition' | 'parallel' | 'loop';
    config: {
        [key: string]: any;
    };
    nextSteps?: string[];
    errorHandling?: ErrorHandlingConfig;
}
export interface ErrorHandlingConfig {
    strategy: 'retry' | 'skip' | 'stop' | 'redirect';
    retryPolicy?: RetryPolicy;
    redirectTo?: string;
    onError?: (error: Error, context: any) => Promise<void>;
}
export interface WebhookSystemConfig {
    server: WebhookConfig;
    security: SecurityOptions;
    delivery: DeliveryOptions;
    queues: WebhookQueue[];
    eventStore?: {
        type: 'memory' | 'redis' | 'mongodb' | 'postgresql';
        config: any;
    };
    monitoring?: {
        enabled: boolean;
        metricsInterval?: number;
        alerting?: AlertConfig;
    };
    plugins?: string[];
}
export interface AlertConfig {
    channels: AlertChannel[];
    rules: AlertRule[];
}
export interface AlertChannel {
    type: 'email' | 'slack' | 'webhook' | 'sms';
    config: any;
}
export interface AlertRule {
    name: string;
    condition: string;
    threshold: number;
    channels: string[];
    cooldownMs?: number;
}
//# sourceMappingURL=WebhookTypes.d.ts.map