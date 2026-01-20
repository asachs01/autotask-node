/**
 * Event parser for processing Autotask webhook payloads
 */
import winston from 'winston';
import { WebhookEvent, WebhookSource, WebhookMetadata, WebhookError } from './types/WebhookTypes';
export interface ParsedWebhookResult {
    success: boolean;
    event?: WebhookEvent;
    errors?: WebhookError[];
    warnings?: string[];
    metadata?: {
        parsingTime: number;
        originalPayloadSize: number;
        eventVersion?: string;
    };
}
export interface ParserConfig {
    validateSchema: boolean;
    enrichEvents: boolean;
    generateIds: boolean;
    preserveRawData: boolean;
    timezone?: string;
    defaultSource?: Partial<WebhookSource>;
}
export interface AutotaskWebhookPayload {
    eventType: string;
    action: string;
    entityType: string;
    entityId: string;
    timestamp?: string;
    zoneId: string;
    entity?: any;
    previousEntity?: any;
    changes?: Array<{
        field: string;
        oldValue: any;
        newValue: any;
    }>;
    userId?: string;
    userName?: string;
    userAgent?: string;
    ipAddress?: string;
    correlationId?: string;
    systemEvent?: {
        type: string;
        details?: any;
    };
    batch?: {
        id: string;
        totalRecords: number;
        processedRecords: number;
        failedRecords: number;
        status: string;
        errors?: any[];
    };
}
export declare class EventParser {
    private config;
    private logger;
    private schemaValidator;
    constructor(config?: Partial<ParserConfig>, logger?: winston.Logger);
    private createDefaultLogger;
    private setupValidationSchemas;
    parse(payload: any, metadata?: Partial<WebhookMetadata>): Promise<ParsedWebhookResult>;
    private validatePayload;
    private isValidEntityType;
    private parsePayload;
    private createBaseEvent;
    private mapEventType;
    private mapAction;
    private createSource;
    private parseChanges;
    private determineChangeType;
    private createMetadata;
    private parseSystemEvent;
    private mapSystemEventType;
    private parseBatchEvent;
    private parseEntityEvent;
    private enrichTicketEvent;
    private enrichProjectEvent;
    private enrichContactEvent;
    private enrichCompanyEvent;
    private enrichTimeEntryEvent;
    private enrichTaskEvent;
    private enrichEvent;
    private extractCompanyId;
    private extractResourceId;
    private extractUserDefinedFields;
    private extractCustomFields;
    private detectEventVersion;
    private detectEnvironment;
    private convertToTimezone;
    validateEventStructure(event: WebhookEvent): {
        valid: boolean;
        errors: string[];
    };
    getEventSignature(event: WebhookEvent): string;
    extractEventSummary(event: WebhookEvent): string;
    setConfig(config: Partial<ParserConfig>): void;
    getConfig(): ParserConfig;
}
//# sourceMappingURL=EventParser.d.ts.map