/**
 * Event parser for processing Autotask webhook payloads
 */

import winston from 'winston';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import {
  WebhookEvent,
  WebhookEventType,
  WebhookAction,
  WebhookSource,
  WebhookChange,
  WebhookMetadata,
  WebhookError,
} from './types/WebhookTypes';
import {
  AutotaskWebhookEvent,
  AutotaskEntityType,
  TicketWebhookEvent,
  ProjectWebhookEvent,
  ContactWebhookEvent,
  CompanyWebhookEvent,
  TimeEntryWebhookEvent,
  TaskWebhookEvent,
  AutotaskSystemEvent,
  AutotaskSystemEventType,
  AutotaskBatchEvent,
} from '../events/types/AutotaskEvents';

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
  // Standard Autotask webhook structure
  eventType: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp?: string;
  zoneId: string;

  // Entity data
  entity?: any;
  previousEntity?: any;
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;

  // Metadata
  userId?: string;
  userName?: string;
  userAgent?: string;
  ipAddress?: string;
  correlationId?: string;

  // System events
  systemEvent?: {
    type: string;
    details?: any;
  };

  // Batch operations
  batch?: {
    id: string;
    totalRecords: number;
    processedRecords: number;
    failedRecords: number;
    status: string;
    errors?: any[];
  };
}

export class EventParser {
  private config: ParserConfig;
  private logger: winston.Logger;
  private schemaValidator: Joi.Root;

  constructor(config: Partial<ParserConfig> = {}, logger?: winston.Logger) {
    this.config = {
      validateSchema: true,
      enrichEvents: true,
      generateIds: true,
      preserveRawData: false,
      timezone: 'UTC',
      ...config,
    };

    this.logger = logger || this.createDefaultLogger();
    this.schemaValidator = Joi.defaults(schema =>
      schema.options({ allowUnknown: true })
    );
    this.setupValidationSchemas();
  }

  private createDefaultLogger(): winston.Logger {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'event-parser' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ],
    });
  }

  private setupValidationSchemas(): void {
    // This will be implemented with detailed validation schemas
    // For now, we'll use basic validation
  }

  public async parse(
    payload: any,
    metadata?: Partial<WebhookMetadata>
  ): Promise<ParsedWebhookResult> {
    const startTime = Date.now();
    const originalPayloadSize = JSON.stringify(payload).length;

    try {
      this.logger.debug('Parsing webhook payload', {
        payloadSize: originalPayloadSize,
        payloadType: typeof payload,
      });

      // Validate payload structure
      const validationResult = this.validatePayload(payload);
      if (!validationResult.valid) {
        return {
          success: false,
          errors: validationResult.errors,
          metadata: {
            parsingTime: Date.now() - startTime,
            originalPayloadSize,
          },
        };
      }

      // Parse the payload based on its structure
      const event = await this.parsePayload(payload, metadata);

      // Enrich the event if enabled
      if (this.config.enrichEvents) {
        await this.enrichEvent(event);
      }

      this.logger.debug('Payload parsed successfully', {
        eventId: event.id,
        eventType: event.type,
        entityType: event.entityType,
        parsingTime: Date.now() - startTime,
      });

      return {
        success: true,
        event,
        metadata: {
          parsingTime: Date.now() - startTime,
          originalPayloadSize,
          eventVersion: this.detectEventVersion(payload),
        },
      };
    } catch (error) {
      this.logger.error('Error parsing webhook payload', {
        error: error instanceof Error ? error.message : String(error),
        payloadSize: originalPayloadSize,
        parsingTime: Date.now() - startTime,
      });

      return {
        success: false,
        errors: [
          {
            code: 'PARSE_ERROR',
            message:
              error instanceof Error ? error.message : 'Unknown parsing error',
            details: error,
          },
        ],
        metadata: {
          parsingTime: Date.now() - startTime,
          originalPayloadSize,
        },
      };
    }
  }

  private validatePayload(payload: any): {
    valid: boolean;
    errors?: WebhookError[];
  } {
    if (!payload || typeof payload !== 'object') {
      return {
        valid: false,
        errors: [
          {
            code: 'INVALID_PAYLOAD',
            message: 'Payload must be a valid object',
          },
        ],
      };
    }

    const requiredFields = ['eventType', 'entityType'];
    const missingFields = requiredFields.filter(field => !payload[field]);

    if (missingFields.length > 0) {
      return {
        valid: false,
        errors: [
          {
            code: 'MISSING_REQUIRED_FIELDS',
            message: `Missing required fields: ${missingFields.join(', ')}`,
            details: { missingFields },
          },
        ],
      };
    }

    // Validate entity type
    if (!this.isValidEntityType(payload.entityType)) {
      return {
        valid: false,
        errors: [
          {
            code: 'INVALID_ENTITY_TYPE',
            message: `Invalid entity type: ${payload.entityType}`,
            field: 'entityType',
          },
        ],
      };
    }

    return { valid: true };
  }

  private isValidEntityType(entityType: string): boolean {
    return Object.values(AutotaskEntityType).includes(
      entityType as AutotaskEntityType
    );
  }

  private async parsePayload(
    payload: AutotaskWebhookPayload,
    metadata?: Partial<WebhookMetadata>
  ): Promise<AutotaskWebhookEvent> {
    const baseEvent = this.createBaseEvent(payload, metadata);

    // Handle different event types
    if (payload.systemEvent) {
      return this.parseSystemEvent(payload, baseEvent);
    }

    if (payload.batch) {
      return this.parseBatchEvent(payload, baseEvent);
    }

    // Parse entity-specific events
    return this.parseEntityEvent(payload, baseEvent);
  }

  private createBaseEvent(
    payload: AutotaskWebhookPayload,
    metadata?: Partial<WebhookMetadata>
  ): Partial<AutotaskWebhookEvent> {
    const eventId = this.config.generateIds
      ? uuidv4()
      : `${payload.entityType}_${payload.entityId}_${Date.now()}`;
    const timestamp = payload.timestamp
      ? new Date(payload.timestamp)
      : new Date();

    return {
      id: eventId,
      type: this.mapEventType(payload.eventType),
      action: this.mapAction(payload.action),
      entityType: payload.entityType as AutotaskEntityType,
      entityId: payload.entityId,
      timestamp,
      source: this.createSource(payload),
      changes: this.parseChanges(payload.changes),
      metadata: this.createMetadata(payload, metadata),
      autotaskData: {
        zoneId: payload.zoneId,
        companyId: this.extractCompanyId(payload.entity),
        resourceId: this.extractResourceId(payload.entity),
        userDefinedFields: this.extractUserDefinedFields(payload.entity),
        customFields: this.extractCustomFields(payload.entity),
      },
    };
  }

  private mapEventType(eventType: string): WebhookEventType {
    switch (eventType.toLowerCase()) {
      case 'create':
      case 'created':
        return WebhookEventType.ENTITY_CREATED;
      case 'update':
      case 'updated':
        return WebhookEventType.ENTITY_UPDATED;
      case 'delete':
      case 'deleted':
        return WebhookEventType.ENTITY_DELETED;
      case 'restore':
      case 'restored':
        return WebhookEventType.ENTITY_RESTORED;
      case 'system':
        return WebhookEventType.SYSTEM_EVENT;
      case 'batch':
        return WebhookEventType.BATCH_OPERATION;
      default:
        return WebhookEventType.CUSTOM_EVENT;
    }
  }

  private mapAction(action: string): WebhookAction {
    switch (action.toLowerCase()) {
      case 'create':
      case 'created':
        return WebhookAction.CREATE;
      case 'update':
      case 'updated':
        return WebhookAction.UPDATE;
      case 'delete':
      case 'deleted':
        return WebhookAction.DELETE;
      case 'restore':
      case 'restored':
        return WebhookAction.RESTORE;
      case 'batch_create':
        return WebhookAction.BATCH_CREATE;
      case 'batch_update':
        return WebhookAction.BATCH_UPDATE;
      case 'batch_delete':
        return WebhookAction.BATCH_DELETE;
      case 'status_change':
        return WebhookAction.STATUS_CHANGE;
      case 'assignment_change':
        return WebhookAction.ASSIGNMENT_CHANGE;
      default:
        return WebhookAction.CUSTOM;
    }
  }

  private createSource(payload: AutotaskWebhookPayload): WebhookSource {
    return {
      system: 'autotask',
      version: this.detectEventVersion(payload),
      zone: payload.zoneId,
      environment: this.detectEnvironment(payload),
      ...this.config.defaultSource,
    };
  }

  private parseChanges(
    changes?: Array<{ field: string; oldValue: any; newValue: any }>
  ): WebhookChange[] {
    if (!changes || !Array.isArray(changes)) {
      return [];
    }

    return changes.map(change => ({
      field: change.field,
      oldValue: change.oldValue,
      newValue: change.newValue,
      type: this.determineChangeType(change.oldValue, change.newValue),
    }));
  }

  private determineChangeType(
    oldValue: any,
    newValue: any
  ): 'create' | 'update' | 'delete' {
    if (oldValue == null && newValue != null) {
      return 'create';
    }
    if (oldValue != null && newValue == null) {
      return 'delete';
    }
    return 'update';
  }

  private createMetadata(
    payload: AutotaskWebhookPayload,
    metadata?: Partial<WebhookMetadata>
  ): WebhookMetadata {
    return {
      userId: payload.userId,
      userName: payload.userName,
      userAgent: payload.userAgent,
      ipAddress: payload.ipAddress,
      correlationId: payload.correlationId || uuidv4(),
      tags: [],
      ...metadata,
      // Add parsing metadata
      parsedAt: new Date().toISOString(),
      payloadSize: JSON.stringify(payload).length,
    };
  }

  private parseSystemEvent(
    payload: AutotaskWebhookPayload,
    baseEvent: Partial<AutotaskWebhookEvent>
  ): AutotaskSystemEvent {
    const systemEventType = this.mapSystemEventType(payload.systemEvent!.type);

    return {
      ...baseEvent,
      type: WebhookEventType.SYSTEM_EVENT,
      systemEventType,
      data: payload.systemEvent!.details || {},
    } as AutotaskSystemEvent;
  }

  private mapSystemEventType(type: string): AutotaskSystemEventType {
    switch (type.toLowerCase()) {
      case 'user_login':
        return AutotaskSystemEventType.USER_LOGIN;
      case 'user_logout':
        return AutotaskSystemEventType.USER_LOGOUT;
      case 'user_created':
        return AutotaskSystemEventType.USER_CREATED;
      case 'user_updated':
        return AutotaskSystemEventType.USER_UPDATED;
      case 'user_deactivated':
        return AutotaskSystemEventType.USER_DEACTIVATED;
      case 'configuration_changed':
        return AutotaskSystemEventType.CONFIGURATION_CHANGED;
      case 'integration_error':
        return AutotaskSystemEventType.INTEGRATION_ERROR;
      case 'backup_completed':
        return AutotaskSystemEventType.BACKUP_COMPLETED;
      case 'maintenance_started':
        return AutotaskSystemEventType.MAINTENANCE_STARTED;
      case 'maintenance_completed':
        return AutotaskSystemEventType.MAINTENANCE_COMPLETED;
      case 'zone_status_changed':
        return AutotaskSystemEventType.ZONE_STATUS_CHANGED;
      default:
        return AutotaskSystemEventType.CONFIGURATION_CHANGED; // Default fallback
    }
  }

  private parseBatchEvent(
    payload: AutotaskWebhookPayload,
    baseEvent: Partial<AutotaskWebhookEvent>
  ): AutotaskBatchEvent {
    return {
      ...baseEvent,
      type: WebhookEventType.BATCH_OPERATION,
      data: payload.batch,
      batchInfo: {
        batchId: payload.batch!.id,
        totalRecords: payload.batch!.totalRecords,
        processedRecords: payload.batch!.processedRecords,
        failedRecords: payload.batch!.failedRecords,
        operation: this.mapAction(payload.action),
        entityType: payload.entityType as AutotaskEntityType,
        status: payload.batch!.status as any,
        startedAt: new Date(), // This should come from the payload ideally
        errors:
          payload.batch!.errors?.map(err => ({
            recordId: err.recordId || '',
            error: err.message || String(err),
            details: err,
          })) || [],
      },
    } as AutotaskBatchEvent;
  }

  private parseEntityEvent(
    payload: AutotaskWebhookPayload,
    baseEvent: Partial<AutotaskWebhookEvent>
  ): AutotaskWebhookEvent {
    const entityEvent = {
      ...baseEvent,
      data: payload.entity || {},
      previousData: payload.previousEntity,
    } as AutotaskWebhookEvent;

    // Add entity-specific parsing based on entity type
    switch (payload.entityType as AutotaskEntityType) {
      case AutotaskEntityType.TICKET:
        return this.enrichTicketEvent(
          entityEvent as TicketWebhookEvent,
          payload
        );
      case AutotaskEntityType.PROJECT:
        return this.enrichProjectEvent(
          entityEvent as ProjectWebhookEvent,
          payload
        );
      case AutotaskEntityType.CONTACT:
        return this.enrichContactEvent(
          entityEvent as ContactWebhookEvent,
          payload
        );
      case AutotaskEntityType.COMPANY:
        return this.enrichCompanyEvent(
          entityEvent as CompanyWebhookEvent,
          payload
        );
      case AutotaskEntityType.TIME_ENTRY:
        return this.enrichTimeEntryEvent(
          entityEvent as TimeEntryWebhookEvent,
          payload
        );
      case AutotaskEntityType.TASK:
        return this.enrichTaskEvent(entityEvent as TaskWebhookEvent, payload);
      default:
        return entityEvent;
    }
  }

  private enrichTicketEvent(
    event: TicketWebhookEvent,
    _payload: AutotaskWebhookPayload
  ): TicketWebhookEvent {
    // Add ticket-specific enrichment logic
    return event;
  }

  private enrichProjectEvent(
    event: ProjectWebhookEvent,
    _payload: AutotaskWebhookPayload
  ): ProjectWebhookEvent {
    // Add project-specific enrichment logic
    return event;
  }

  private enrichContactEvent(
    event: ContactWebhookEvent,
    _payload: AutotaskWebhookPayload
  ): ContactWebhookEvent {
    // Add contact-specific enrichment logic
    return event;
  }

  private enrichCompanyEvent(
    event: CompanyWebhookEvent,
    _payload: AutotaskWebhookPayload
  ): CompanyWebhookEvent {
    // Add company-specific enrichment logic
    return event;
  }

  private enrichTimeEntryEvent(
    event: TimeEntryWebhookEvent,
    _payload: AutotaskWebhookPayload
  ): TimeEntryWebhookEvent {
    // Add time entry-specific enrichment logic
    return event;
  }

  private enrichTaskEvent(
    event: TaskWebhookEvent,
    _payload: AutotaskWebhookPayload
  ): TaskWebhookEvent {
    // Add task-specific enrichment logic
    return event;
  }

  private async enrichEvent(event: AutotaskWebhookEvent): Promise<void> {
    // Add enrichment logic here
    // This could include:
    // - Looking up related entities
    // - Adding calculated fields
    // - Geocoding addresses
    // - Adding business rules context

    if (this.config.timezone && this.config.timezone !== 'UTC') {
      // Convert timestamps to specified timezone
      event.timestamp = this.convertToTimezone(
        event.timestamp,
        this.config.timezone
      );
    }
  }

  private extractCompanyId(entity: any): number | undefined {
    return entity?.companyID || entity?.accountID || entity?.id;
  }

  private extractResourceId(entity: any): number | undefined {
    return (
      entity?.resourceID ||
      entity?.assignedResourceID ||
      entity?.createdByResourceID
    );
  }

  private extractUserDefinedFields(
    entity: any
  ): Record<string, any> | undefined {
    return entity?.userDefinedFields || entity?.udfs;
  }

  private extractCustomFields(entity: any): Record<string, any> | undefined {
    return entity?.customFields || entity?.custom;
  }

  private detectEventVersion(payload: any): string {
    return payload.version || payload.apiVersion || '1.0';
  }

  private detectEnvironment(
    payload: any
  ): 'production' | 'staging' | 'development' {
    const zoneId = payload.zoneId?.toLowerCase() || '';

    if (zoneId.includes('dev') || zoneId.includes('test')) {
      return 'development';
    }
    if (zoneId.includes('staging') || zoneId.includes('stage')) {
      return 'staging';
    }
    return 'production';
  }

  private convertToTimezone(date: Date, _timezone: string): Date {
    // This is a simplified implementation
    // In a real implementation, you'd use a proper timezone library like moment-timezone
    return date;
  }

  // Public utility methods
  public validateEventStructure(event: WebhookEvent): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!event.id) errors.push('Event ID is required');
    if (!event.type) errors.push('Event type is required');
    if (!event.action) errors.push('Event action is required');
    if (!event.entityType) errors.push('Entity type is required');
    if (!event.entityId) errors.push('Entity ID is required');
    if (!event.timestamp) errors.push('Event timestamp is required');
    if (!event.source) errors.push('Event source is required');

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  public getEventSignature(event: WebhookEvent): string {
    // Create a unique signature for the event for deduplication
    const data = `${event.entityType}:${event.entityId}:${event.action}:${event.timestamp.getTime()}`;
    return Buffer.from(data).toString('base64');
  }

  public extractEventSummary(event: WebhookEvent): string {
    const action =
      event.action.charAt(0).toUpperCase() +
      event.action.slice(1).toLowerCase();
    return `${action} ${event.entityType} ${event.entityId}`;
  }

  public setConfig(config: Partial<ParserConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): ParserConfig {
    return { ...this.config };
  }
}
