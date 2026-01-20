"use strict";
/**
 * Event parser for processing Autotask webhook payloads
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventParser = void 0;
const winston_1 = __importDefault(require("winston"));
const joi_1 = __importDefault(require("joi"));
const uuid_1 = require("uuid");
const WebhookTypes_1 = require("./types/WebhookTypes");
const AutotaskEvents_1 = require("../events/types/AutotaskEvents");
class EventParser {
    constructor(config = {}, logger) {
        this.config = {
            validateSchema: true,
            enrichEvents: true,
            generateIds: true,
            preserveRawData: false,
            timezone: 'UTC',
            ...config,
        };
        this.logger = logger || this.createDefaultLogger();
        this.schemaValidator = joi_1.default.defaults(schema => schema.options({ allowUnknown: true }));
        this.setupValidationSchemas();
    }
    createDefaultLogger() {
        return winston_1.default.createLogger({
            level: 'info',
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
            defaultMeta: { service: 'event-parser' },
            transports: [
                new winston_1.default.transports.Console({
                    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
                }),
            ],
        });
    }
    setupValidationSchemas() {
        // This will be implemented with detailed validation schemas
        // For now, we'll use basic validation
    }
    async parse(payload, metadata) {
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
        }
        catch (error) {
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
                        message: error instanceof Error ? error.message : 'Unknown parsing error',
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
    validatePayload(payload) {
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
    isValidEntityType(entityType) {
        return Object.values(AutotaskEvents_1.AutotaskEntityType).includes(entityType);
    }
    async parsePayload(payload, metadata) {
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
    createBaseEvent(payload, metadata) {
        const eventId = this.config.generateIds
            ? (0, uuid_1.v4)()
            : `${payload.entityType}_${payload.entityId}_${Date.now()}`;
        const timestamp = payload.timestamp
            ? new Date(payload.timestamp)
            : new Date();
        return {
            id: eventId,
            type: this.mapEventType(payload.eventType),
            action: this.mapAction(payload.action),
            entityType: payload.entityType,
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
    mapEventType(eventType) {
        switch (eventType.toLowerCase()) {
            case 'create':
            case 'created':
                return WebhookTypes_1.WebhookEventType.ENTITY_CREATED;
            case 'update':
            case 'updated':
                return WebhookTypes_1.WebhookEventType.ENTITY_UPDATED;
            case 'delete':
            case 'deleted':
                return WebhookTypes_1.WebhookEventType.ENTITY_DELETED;
            case 'restore':
            case 'restored':
                return WebhookTypes_1.WebhookEventType.ENTITY_RESTORED;
            case 'system':
                return WebhookTypes_1.WebhookEventType.SYSTEM_EVENT;
            case 'batch':
                return WebhookTypes_1.WebhookEventType.BATCH_OPERATION;
            default:
                return WebhookTypes_1.WebhookEventType.CUSTOM_EVENT;
        }
    }
    mapAction(action) {
        switch (action.toLowerCase()) {
            case 'create':
            case 'created':
                return WebhookTypes_1.WebhookAction.CREATE;
            case 'update':
            case 'updated':
                return WebhookTypes_1.WebhookAction.UPDATE;
            case 'delete':
            case 'deleted':
                return WebhookTypes_1.WebhookAction.DELETE;
            case 'restore':
            case 'restored':
                return WebhookTypes_1.WebhookAction.RESTORE;
            case 'batch_create':
                return WebhookTypes_1.WebhookAction.BATCH_CREATE;
            case 'batch_update':
                return WebhookTypes_1.WebhookAction.BATCH_UPDATE;
            case 'batch_delete':
                return WebhookTypes_1.WebhookAction.BATCH_DELETE;
            case 'status_change':
                return WebhookTypes_1.WebhookAction.STATUS_CHANGE;
            case 'assignment_change':
                return WebhookTypes_1.WebhookAction.ASSIGNMENT_CHANGE;
            default:
                return WebhookTypes_1.WebhookAction.CUSTOM;
        }
    }
    createSource(payload) {
        return {
            system: 'autotask',
            version: this.detectEventVersion(payload),
            zone: payload.zoneId,
            environment: this.detectEnvironment(payload),
            ...this.config.defaultSource,
        };
    }
    parseChanges(changes) {
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
    determineChangeType(oldValue, newValue) {
        if (oldValue == null && newValue != null) {
            return 'create';
        }
        if (oldValue != null && newValue == null) {
            return 'delete';
        }
        return 'update';
    }
    createMetadata(payload, metadata) {
        return {
            userId: payload.userId,
            userName: payload.userName,
            userAgent: payload.userAgent,
            ipAddress: payload.ipAddress,
            correlationId: payload.correlationId || (0, uuid_1.v4)(),
            tags: [],
            ...metadata,
            // Add parsing metadata
            parsedAt: new Date().toISOString(),
            payloadSize: JSON.stringify(payload).length,
        };
    }
    parseSystemEvent(payload, baseEvent) {
        const systemEventType = this.mapSystemEventType(payload.systemEvent.type);
        return {
            ...baseEvent,
            type: WebhookTypes_1.WebhookEventType.SYSTEM_EVENT,
            systemEventType,
            data: payload.systemEvent.details || {},
        };
    }
    mapSystemEventType(type) {
        switch (type.toLowerCase()) {
            case 'user_login':
                return AutotaskEvents_1.AutotaskSystemEventType.USER_LOGIN;
            case 'user_logout':
                return AutotaskEvents_1.AutotaskSystemEventType.USER_LOGOUT;
            case 'user_created':
                return AutotaskEvents_1.AutotaskSystemEventType.USER_CREATED;
            case 'user_updated':
                return AutotaskEvents_1.AutotaskSystemEventType.USER_UPDATED;
            case 'user_deactivated':
                return AutotaskEvents_1.AutotaskSystemEventType.USER_DEACTIVATED;
            case 'configuration_changed':
                return AutotaskEvents_1.AutotaskSystemEventType.CONFIGURATION_CHANGED;
            case 'integration_error':
                return AutotaskEvents_1.AutotaskSystemEventType.INTEGRATION_ERROR;
            case 'backup_completed':
                return AutotaskEvents_1.AutotaskSystemEventType.BACKUP_COMPLETED;
            case 'maintenance_started':
                return AutotaskEvents_1.AutotaskSystemEventType.MAINTENANCE_STARTED;
            case 'maintenance_completed':
                return AutotaskEvents_1.AutotaskSystemEventType.MAINTENANCE_COMPLETED;
            case 'zone_status_changed':
                return AutotaskEvents_1.AutotaskSystemEventType.ZONE_STATUS_CHANGED;
            default:
                return AutotaskEvents_1.AutotaskSystemEventType.CONFIGURATION_CHANGED; // Default fallback
        }
    }
    parseBatchEvent(payload, baseEvent) {
        return {
            ...baseEvent,
            type: WebhookTypes_1.WebhookEventType.BATCH_OPERATION,
            data: payload.batch,
            batchInfo: {
                batchId: payload.batch.id,
                totalRecords: payload.batch.totalRecords,
                processedRecords: payload.batch.processedRecords,
                failedRecords: payload.batch.failedRecords,
                operation: this.mapAction(payload.action),
                entityType: payload.entityType,
                status: payload.batch.status,
                startedAt: new Date(), // This should come from the payload ideally
                errors: payload.batch.errors?.map(err => ({
                    recordId: err.recordId || '',
                    error: err.message || String(err),
                    details: err,
                })) || [],
            },
        };
    }
    parseEntityEvent(payload, baseEvent) {
        const entityEvent = {
            ...baseEvent,
            data: payload.entity || {},
            previousData: payload.previousEntity,
        };
        // Add entity-specific parsing based on entity type
        switch (payload.entityType) {
            case AutotaskEvents_1.AutotaskEntityType.TICKET:
                return this.enrichTicketEvent(entityEvent, payload);
            case AutotaskEvents_1.AutotaskEntityType.PROJECT:
                return this.enrichProjectEvent(entityEvent, payload);
            case AutotaskEvents_1.AutotaskEntityType.CONTACT:
                return this.enrichContactEvent(entityEvent, payload);
            case AutotaskEvents_1.AutotaskEntityType.COMPANY:
                return this.enrichCompanyEvent(entityEvent, payload);
            case AutotaskEvents_1.AutotaskEntityType.TIME_ENTRY:
                return this.enrichTimeEntryEvent(entityEvent, payload);
            case AutotaskEvents_1.AutotaskEntityType.TASK:
                return this.enrichTaskEvent(entityEvent, payload);
            default:
                return entityEvent;
        }
    }
    enrichTicketEvent(event, _payload) {
        // Add ticket-specific enrichment logic
        return event;
    }
    enrichProjectEvent(event, _payload) {
        // Add project-specific enrichment logic
        return event;
    }
    enrichContactEvent(event, _payload) {
        // Add contact-specific enrichment logic
        return event;
    }
    enrichCompanyEvent(event, _payload) {
        // Add company-specific enrichment logic
        return event;
    }
    enrichTimeEntryEvent(event, _payload) {
        // Add time entry-specific enrichment logic
        return event;
    }
    enrichTaskEvent(event, _payload) {
        // Add task-specific enrichment logic
        return event;
    }
    async enrichEvent(event) {
        // Add enrichment logic here
        // This could include:
        // - Looking up related entities
        // - Adding calculated fields
        // - Geocoding addresses
        // - Adding business rules context
        if (this.config.timezone && this.config.timezone !== 'UTC') {
            // Convert timestamps to specified timezone
            event.timestamp = this.convertToTimezone(event.timestamp, this.config.timezone);
        }
    }
    extractCompanyId(entity) {
        return entity?.companyID || entity?.accountID || entity?.id;
    }
    extractResourceId(entity) {
        return (entity?.resourceID ||
            entity?.assignedResourceID ||
            entity?.createdByResourceID);
    }
    extractUserDefinedFields(entity) {
        return entity?.userDefinedFields || entity?.udfs;
    }
    extractCustomFields(entity) {
        return entity?.customFields || entity?.custom;
    }
    detectEventVersion(payload) {
        return payload.version || payload.apiVersion || '1.0';
    }
    detectEnvironment(payload) {
        const zoneId = payload.zoneId?.toLowerCase() || '';
        if (zoneId.includes('dev') || zoneId.includes('test')) {
            return 'development';
        }
        if (zoneId.includes('staging') || zoneId.includes('stage')) {
            return 'staging';
        }
        return 'production';
    }
    convertToTimezone(date, _timezone) {
        // This is a simplified implementation
        // In a real implementation, you'd use a proper timezone library like moment-timezone
        return date;
    }
    // Public utility methods
    validateEventStructure(event) {
        const errors = [];
        if (!event.id)
            errors.push('Event ID is required');
        if (!event.type)
            errors.push('Event type is required');
        if (!event.action)
            errors.push('Event action is required');
        if (!event.entityType)
            errors.push('Entity type is required');
        if (!event.entityId)
            errors.push('Entity ID is required');
        if (!event.timestamp)
            errors.push('Event timestamp is required');
        if (!event.source)
            errors.push('Event source is required');
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    getEventSignature(event) {
        // Create a unique signature for the event for deduplication
        const data = `${event.entityType}:${event.entityId}:${event.action}:${event.timestamp.getTime()}`;
        return Buffer.from(data).toString('base64');
    }
    extractEventSummary(event) {
        const action = event.action.charAt(0).toUpperCase() +
            event.action.slice(1).toLowerCase();
        return `${action} ${event.entityType} ${event.entityId}`;
    }
    setConfig(config) {
        this.config = { ...this.config, ...config };
    }
    getConfig() {
        return { ...this.config };
    }
}
exports.EventParser = EventParser;
//# sourceMappingURL=EventParser.js.map