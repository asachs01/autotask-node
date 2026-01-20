"use strict";
/**
 * Real-time synchronization patterns for bi-directional data synchronization
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SynchronizationEngine = void 0;
const winston_1 = __importDefault(require("winston"));
const events_1 = require("events");
class SynchronizationEngine extends events_1.EventEmitter {
    constructor(logger) {
        super();
        this.config = new Map();
        this.externalSystems = new Map();
        this.activeSyncs = new Map();
        this.logger = logger || this.createDefaultLogger();
        this.stats = this.initializeStats();
    }
    createDefaultLogger() {
        return winston_1.default.createLogger({
            level: 'info',
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
            defaultMeta: { service: 'sync-engine' },
            transports: [
                new winston_1.default.transports.Console({
                    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
                }),
            ],
        });
    }
    initializeStats() {
        return {
            totalSyncs: 0,
            successfulSyncs: 0,
            failedSyncs: 0,
            toExternalSyncs: 0,
            fromExternalSyncs: 0,
            conflictsResolved: 0,
            averageSyncTime: 0,
            syncsByEntity: {},
            errorsByType: {},
        };
    }
    // Configuration management
    addSyncConfig(config) {
        this.validateSyncConfig(config);
        this.config.set(config.id, config);
        this.logger.info('Sync configuration added', {
            syncId: config.id,
            name: config.name,
            enabled: config.enabled,
        });
        this.emit('sync:config:added', config);
    }
    updateSyncConfig(syncId, updates) {
        const config = this.config.get(syncId);
        if (!config) {
            return false;
        }
        const updatedConfig = { ...config, ...updates };
        this.validateSyncConfig(updatedConfig);
        this.config.set(syncId, updatedConfig);
        this.logger.info('Sync configuration updated', { syncId });
        this.emit('sync:config:updated', updatedConfig);
        return true;
    }
    removeSyncConfig(syncId) {
        const removed = this.config.delete(syncId);
        if (removed) {
            this.logger.info('Sync configuration removed', { syncId });
            this.emit('sync:config:removed', syncId);
        }
        return removed;
    }
    addExternalSystem(system) {
        this.externalSystems.set(system.id, system);
        this.logger.info('External system added', {
            systemId: system.id,
            name: system.name,
            type: system.type,
        });
    }
    // Core synchronization methods
    async syncFromAutotask(event, syncId) {
        const results = [];
        const relevantConfigs = syncId
            ? [this.config.get(syncId)].filter(Boolean)
            : this.findRelevantSyncConfigs(event, 'to_external');
        for (const config of relevantConfigs) {
            if (!config.enabled || !config.autotaskToExternal) {
                continue;
            }
            const result = await this.performSync(event, config, 'to_external');
            results.push(result);
        }
        return results;
    }
    async syncToAutotask(externalData, entityType, entityId, externalSystemId, syncId) {
        const results = [];
        const relevantConfigs = syncId
            ? [this.config.get(syncId)].filter(Boolean)
            : Array.from(this.config.values()).filter(config => config.enabled && config.externalToAutotask);
        for (const config of relevantConfigs) {
            const mockEvent = this.createMockEvent(externalData, entityType, entityId);
            const result = await this.performSync(mockEvent, config, 'from_external', externalData);
            results.push(result);
        }
        return results;
    }
    async performSync(event, config, direction, externalData) {
        const startTime = Date.now();
        const correlationId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const context = {
            syncId: config.id,
            direction,
            sourceSystem: direction === 'to_external' ? 'autotask' : 'external',
            targetSystem: direction === 'to_external' ? 'external' : 'autotask',
            entityType: event.entityType,
            entityId: event.entityId,
            timestamp: new Date(),
            correlationId,
            metadata: event.metadata || {},
        };
        const result = {
            success: false,
            syncId: config.id,
            entityType: event.entityType,
            entityId: event.entityId,
            direction,
            sourceData: direction === 'to_external' ? event.data : externalData,
            errors: [],
            metrics: {
                processingTime: 0,
                mappingsApplied: 0,
                transformationsApplied: 0,
                validationsPassed: 0,
                validationsFailed: 0,
            },
        };
        try {
            // Check if sync is already in progress for this entity
            const syncKey = `${config.id}:${event.entityType}:${event.entityId}:${direction}`;
            if (this.activeSyncs.has(syncKey)) {
                this.logger.warn('Sync already in progress', {
                    syncKey,
                    correlationId,
                });
                result.errors?.push({
                    code: 'SYNC_IN_PROGRESS',
                    message: 'Synchronization already in progress for this entity',
                });
                return result;
            }
            // Store active sync promise
            const syncPromise = this.executeSyncProcess(event, config, context, result, externalData);
            this.activeSyncs.set(syncKey, syncPromise);
            try {
                return await syncPromise;
            }
            finally {
                this.activeSyncs.delete(syncKey);
            }
        }
        catch (error) {
            result.errors?.push({
                code: 'SYNC_ERROR',
                message: error instanceof Error ? error.message : String(error),
            });
            this.logger.error('Sync failed', {
                syncId: config.id,
                entityType: event.entityType,
                entityId: event.entityId,
                direction,
                error: error instanceof Error ? error.message : String(error),
                correlationId,
            });
            this.updateStats(result, Date.now() - startTime);
            this.emit('sync:failed', result, error);
            return result;
        }
    }
    async executeSyncProcess(event, config, context, result, _externalData) {
        const startTime = Date.now();
        try {
            // Step 1: Apply filters
            if (config.filters &&
                !this.applyFilters(result.sourceData, config.filters, context.direction)) {
                result.success = true; // Not an error, just filtered out
                result.metrics.processingTime = Date.now() - startTime;
                return result;
            }
            // Step 2: Get target data for conflict detection
            const targetData = await this.getTargetData(context);
            // Step 3: Detect and resolve conflicts
            if (targetData) {
                const conflicts = this.detectConflicts(result.sourceData, targetData, config.mappings);
                if (conflicts.length > 0) {
                    const resolvedData = await this.resolveConflicts(result.sourceData, targetData, conflicts, config, context);
                    result.conflictsResolved = conflicts.map(conflict => ({
                        field: conflict.field,
                        autotaskValue: conflict.autotaskValue,
                        externalValue: conflict.externalValue,
                        resolvedValue: resolvedData[conflict.field],
                        resolution: config.conflictResolution,
                    }));
                    result.sourceData = resolvedData;
                }
            }
            // Step 4: Apply field mappings
            result.transformedData = await this.applyFieldMappings(result.sourceData, config.mappings, context);
            result.metrics.mappingsApplied = config.mappings.length;
            // Step 5: Apply transformations
            if (config.transformations) {
                for (const transformation of config.transformations) {
                    if (this.shouldApplyTransformation(transformation, context.direction)) {
                        result.transformedData = await transformation.transform(result.transformedData, context);
                        result.metrics.transformationsApplied++;
                    }
                }
            }
            // Step 6: Validate transformed data
            const validationResult = await this.validateTransformedData(result.transformedData, config, context);
            result.metrics.validationsPassed = validationResult.passed;
            result.metrics.validationsFailed = validationResult.failed;
            if (validationResult.errors.length > 0) {
                result.errors?.push(...validationResult.errors);
                throw new Error(`Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
            }
            // Step 7: Send to target system
            result.targetData = await this.sendToTargetSystem(result.transformedData, context);
            result.success = true;
            result.metrics.processingTime = Date.now() - startTime;
            this.logger.info('Sync completed successfully', {
                syncId: config.id,
                entityType: context.entityType,
                entityId: context.entityId,
                direction: context.direction,
                processingTime: result.metrics.processingTime,
                correlationId: context.correlationId,
            });
            this.updateStats(result, result.metrics.processingTime);
            this.emit('sync:completed', result);
            return result;
        }
        catch (error) {
            result.errors?.push({
                code: 'SYNC_EXECUTION_ERROR',
                message: error instanceof Error ? error.message : String(error),
            });
            result.metrics.processingTime = Date.now() - startTime;
            this.updateStats(result, result.metrics.processingTime);
            throw error;
        }
    }
    applyFilters(data, filters, direction) {
        return filters.every(filter => {
            if (filter.direction &&
                filter.direction !== direction &&
                filter.direction !== 'both') {
                return true; // Skip filter if direction doesn't match
            }
            const value = this.getNestedValue(data, filter.field);
            switch (filter.operator) {
                case 'equals':
                    return value === filter.value;
                case 'not_equals':
                    return value !== filter.value;
                case 'contains':
                    return String(value).includes(String(filter.value));
                case 'starts_with':
                    return String(value).startsWith(String(filter.value));
                case 'ends_with':
                    return String(value).endsWith(String(filter.value));
                case 'in':
                    return Array.isArray(filter.value) && filter.value.includes(value);
                case 'not_in':
                    return Array.isArray(filter.value) && !filter.value.includes(value);
                default:
                    return true;
            }
        });
    }
    detectConflicts(sourceData, targetData, mappings) {
        const conflicts = [];
        for (const mapping of mappings) {
            if (mapping.direction === 'bidirectional') {
                const sourceValue = this.getNestedValue(sourceData, mapping.autotaskField);
                const targetValue = this.getNestedValue(targetData, mapping.externalField);
                if (sourceValue !== undefined &&
                    targetValue !== undefined &&
                    sourceValue !== targetValue) {
                    conflicts.push({
                        field: mapping.autotaskField,
                        autotaskValue: sourceValue,
                        externalValue: targetValue,
                        mapping,
                    });
                }
            }
        }
        return conflicts;
    }
    async resolveConflicts(sourceData, targetData, conflicts, config, context) {
        const resolvedData = { ...sourceData };
        for (const conflict of conflicts) {
            let resolvedValue;
            switch (config.conflictResolution) {
                case 'autotask_wins':
                    resolvedValue = conflict.autotaskValue;
                    break;
                case 'external_wins':
                    resolvedValue = conflict.externalValue;
                    break;
                case 'timestamp': {
                    // Use the most recent value based on last modified date
                    const sourceTime = new Date(sourceData.lastModifiedDate || 0);
                    const targetTime = new Date(targetData.lastModifiedDate || 0);
                    resolvedValue =
                        sourceTime > targetTime
                            ? conflict.autotaskValue
                            : conflict.externalValue;
                    break;
                }
                case 'custom':
                    if (config.customConflictResolver) {
                        resolvedValue = await config.customConflictResolver(conflict.autotaskValue, conflict.externalValue, context);
                    }
                    else {
                        resolvedValue = conflict.autotaskValue; // Fallback
                    }
                    break;
                case 'manual':
                    // Emit event for manual resolution
                    this.emit('sync:conflict', {
                        context,
                        conflict,
                        resolve: (value) => {
                            resolvedValue = value;
                        },
                    });
                    // For now, use autotask value as default
                    resolvedValue = conflict.autotaskValue;
                    break;
                default:
                    resolvedValue = conflict.autotaskValue;
            }
            this.setNestedValue(resolvedData, conflict.field, resolvedValue);
        }
        return resolvedData;
    }
    async applyFieldMappings(data, mappings, context) {
        const transformedData = {};
        for (const mapping of mappings) {
            if (!this.shouldApplyMapping(mapping, context.direction)) {
                continue;
            }
            const sourceField = context.direction === 'to_external'
                ? mapping.autotaskField
                : mapping.externalField;
            const targetField = context.direction === 'to_external'
                ? mapping.externalField
                : mapping.autotaskField;
            let value = this.getNestedValue(data, sourceField);
            // Apply transformation if configured
            const transform = context.direction === 'to_external'
                ? mapping.transform?.toExternal
                : mapping.transform?.fromExternal;
            if (transform) {
                value = transform(value, context);
            }
            // Apply validation if configured
            const validation = context.direction === 'to_external'
                ? mapping.validation?.toExternal
                : mapping.validation?.fromExternal;
            if (validation && !validation(value)) {
                throw new Error(`Validation failed for field ${targetField}: ${value}`);
            }
            if (value !== undefined || mapping.required) {
                this.setNestedValue(transformedData, targetField, value);
            }
        }
        return transformedData;
    }
    shouldApplyMapping(mapping, direction) {
        switch (mapping.direction) {
            case 'bidirectional':
                return true;
            case 'to_external':
                return direction === 'to_external';
            case 'from_external':
                return direction === 'from_external';
            default:
                return false;
        }
    }
    shouldApplyTransformation(transformation, direction) {
        return (transformation.direction === 'both' ||
            transformation.direction === direction);
    }
    async validateTransformedData(data, config, context) {
        // This is a simplified validation - in a real implementation,
        // you'd have more comprehensive validation rules
        const errors = [];
        let passed = 0;
        let failed = 0;
        for (const mapping of config.mappings) {
            if (mapping.required) {
                const field = context.direction === 'to_external'
                    ? mapping.externalField
                    : mapping.autotaskField;
                const value = this.getNestedValue(data, field);
                if (value === undefined || value === null || value === '') {
                    errors.push({
                        field,
                        message: `Required field ${field} is missing or empty`,
                        code: 'REQUIRED_FIELD_MISSING',
                    });
                    failed++;
                }
                else {
                    passed++;
                }
            }
        }
        return { passed, failed, errors };
    }
    async getTargetData(_context) {
        // This would integrate with the target system to get current data
        // Implementation depends on the target system type
        return null; // Simplified for now
    }
    async sendToTargetSystem(data, context) {
        // This would send data to the target system
        // Implementation depends on the target system type
        this.logger.debug('Sending data to target system', {
            targetSystem: context.targetSystem,
            entityType: context.entityType,
            entityId: context.entityId,
        });
        return data; // Simplified for now
    }
    findRelevantSyncConfigs(event, direction) {
        return Array.from(this.config.values()).filter(config => {
            if (!config.enabled)
                return false;
            if (direction === 'to_external' && !config.autotaskToExternal)
                return false;
            if (direction === 'from_external' && !config.externalToAutotask)
                return false;
            // Add more sophisticated filtering logic here
            return true;
        });
    }
    createMockEvent(externalData, entityType, entityId) {
        // Create a mock Autotask event from external data
        return {
            id: `mock_${Date.now()}`,
            type: 'entity.updated',
            action: 'update',
            entityType: entityType,
            entityId,
            timestamp: new Date(),
            source: { system: 'external' },
            data: externalData,
            autotaskData: {
                zoneId: 'external',
            },
        };
    }
    validateSyncConfig(config) {
        if (!config.id || !config.name) {
            throw new Error('Sync config must have id and name');
        }
        if (config.mappings.length === 0) {
            throw new Error('Sync config must have at least one field mapping');
        }
        // Add more validation as needed
    }
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!(key in current)) {
                current[key] = {};
            }
            return current[key];
        }, obj);
        target[lastKey] = value;
    }
    updateStats(result, processingTime) {
        this.stats.totalSyncs++;
        if (result.success) {
            this.stats.successfulSyncs++;
        }
        else {
            this.stats.failedSyncs++;
        }
        if (result.direction === 'to_external') {
            this.stats.toExternalSyncs++;
        }
        else {
            this.stats.fromExternalSyncs++;
        }
        if (result.conflictsResolved) {
            this.stats.conflictsResolved += result.conflictsResolved.length;
        }
        // Update entity stats
        this.stats.syncsByEntity[result.entityType] =
            (this.stats.syncsByEntity[result.entityType] || 0) + 1;
        // Update error stats
        if (result.errors) {
            for (const error of result.errors) {
                this.stats.errorsByType[error.code] =
                    (this.stats.errorsByType[error.code] || 0) + 1;
            }
        }
        // Update average sync time
        const totalTime = this.stats.averageSyncTime * (this.stats.totalSyncs - 1) + processingTime;
        this.stats.averageSyncTime = totalTime / this.stats.totalSyncs;
        this.stats.lastSyncAt = new Date();
    }
    // Public utility methods
    getSyncConfig(syncId) {
        return this.config.get(syncId);
    }
    getSyncConfigs() {
        return Array.from(this.config.values());
    }
    getExternalSystems() {
        return Array.from(this.externalSystems.values());
    }
    getStats() {
        return { ...this.stats };
    }
    resetStats() {
        this.stats = this.initializeStats();
    }
    // Webhook handler creation
    createWebhookHandler(syncId) {
        return {
            id: `sync_handler_${syncId || 'all'}`,
            name: `Synchronization Handler${syncId ? ` (${syncId})` : ''}`,
            description: 'Handles webhook events for data synchronization',
            handle: async (event) => {
                try {
                    const results = await this.syncFromAutotask(event, syncId);
                    const successfulSyncs = results.filter(r => r.success);
                    const failedSyncs = results.filter(r => !r.success);
                    return {
                        success: failedSyncs.length === 0,
                        message: `Processed ${results.length} sync operations (${successfulSyncs.length} successful, ${failedSyncs.length} failed)`,
                        data: {
                            results,
                            successful: successfulSyncs.length,
                            failed: failedSyncs.length,
                        },
                        errors: failedSyncs.flatMap(r => r.errors?.map(e => ({ code: e.code, message: e.message })) || []),
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        message: 'Synchronization handler failed',
                        errors: [
                            {
                                code: 'SYNC_HANDLER_ERROR',
                                message: error instanceof Error ? error.message : String(error),
                            },
                        ],
                    };
                }
            },
        };
    }
}
exports.SynchronizationEngine = SynchronizationEngine;
//# sourceMappingURL=SynchronizationPatterns.js.map