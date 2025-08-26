/**
 * Real-time synchronization patterns for bi-directional data synchronization
 */

import winston from 'winston';
import { EventEmitter } from 'events';
import { WebhookHandlerResult, WebhookHandler } from '../types/WebhookTypes';
import { AutotaskWebhookEvent } from '../../events/types/AutotaskEvents';

export interface SyncConfig {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  autotaskToExternal: boolean;
  externalToAutotask: boolean;
  conflictResolution:
    | 'autotask_wins'
    | 'external_wins'
    | 'timestamp'
    | 'manual'
    | 'custom';
  customConflictResolver?: (
    autotaskData: any,
    externalData: any,
    context: SyncContext
  ) => Promise<any>;
  mappings: SyncFieldMapping[];
  filters?: SyncFilter[];
  transformations?: SyncTransformation[];
  retryPolicy: {
    maxAttempts: number;
    delayMs: number;
    backoffMultiplier: number;
  };
}

export interface SyncFieldMapping {
  autotaskField: string;
  externalField: string;
  direction: 'to_external' | 'from_external' | 'bidirectional';
  required: boolean;
  transform?: {
    toExternal?: (value: any, context: SyncContext) => any;
    fromExternal?: (value: any, context: SyncContext) => any;
  };
  validation?: {
    toExternal?: (value: any) => boolean;
    fromExternal?: (value: any) => boolean;
  };
}

export interface SyncFilter {
  field: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'starts_with'
    | 'ends_with'
    | 'in'
    | 'not_in';
  value: any;
  direction?: 'to_external' | 'from_external' | 'both';
}

export interface SyncTransformation {
  name: string;
  direction: 'to_external' | 'from_external' | 'both';
  transform: (data: any, context: SyncContext) => Promise<any>;
}

export interface SyncContext {
  syncId: string;
  direction: 'to_external' | 'from_external';
  sourceSystem: string;
  targetSystem: string;
  entityType: string;
  entityId: string;
  timestamp: Date;
  userId?: string;
  correlationId: string;
  metadata: Record<string, any>;
}

export interface SyncResult {
  success: boolean;
  syncId: string;
  entityType: string;
  entityId: string;
  direction: 'to_external' | 'from_external';
  sourceData: any;
  transformedData?: any;
  targetData?: any;
  conflictsResolved?: Array<{
    field: string;
    autotaskValue: any;
    externalValue: any;
    resolvedValue: any;
    resolution: string;
  }>;
  errors?: Array<{
    field?: string;
    message: string;
    code: string;
  }>;
  metrics: {
    processingTime: number;
    mappingsApplied: number;
    transformationsApplied: number;
    validationsPassed: number;
    validationsFailed: number;
  };
}

export interface ExternalSystem {
  id: string;
  name: string;
  type: 'crm' | 'erp' | 'database' | 'api' | 'file' | 'other';
  connection: ExternalSystemConnection;
}

export interface ExternalSystemConnection {
  type: 'rest_api' | 'graphql' | 'database' | 'file' | 'webhook';
  config: any;
  authentication?: {
    type: 'none' | 'api_key' | 'oauth' | 'basic' | 'bearer';
    config: any;
  };
}

export interface SyncStats {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  toExternalSyncs: number;
  fromExternalSyncs: number;
  conflictsResolved: number;
  averageSyncTime: number;
  lastSyncAt?: Date;
  syncsByEntity: Record<string, number>;
  errorsByType: Record<string, number>;
}

export class SynchronizationEngine extends EventEmitter {
  private config: Map<string, SyncConfig> = new Map();
  private externalSystems: Map<string, ExternalSystem> = new Map();
  private stats: SyncStats;
  private logger: winston.Logger;
  private activeSyncs: Map<string, Promise<SyncResult>> = new Map();

  constructor(logger?: winston.Logger) {
    super();

    this.logger = logger || this.createDefaultLogger();
    this.stats = this.initializeStats();
  }

  private createDefaultLogger(): winston.Logger {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'sync-engine' },
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

  private initializeStats(): SyncStats {
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
  public addSyncConfig(config: SyncConfig): void {
    this.validateSyncConfig(config);
    this.config.set(config.id, config);

    this.logger.info('Sync configuration added', {
      syncId: config.id,
      name: config.name,
      enabled: config.enabled,
    });

    this.emit('sync:config:added', config);
  }

  public updateSyncConfig(
    syncId: string,
    updates: Partial<SyncConfig>
  ): boolean {
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

  public removeSyncConfig(syncId: string): boolean {
    const removed = this.config.delete(syncId);
    if (removed) {
      this.logger.info('Sync configuration removed', { syncId });
      this.emit('sync:config:removed', syncId);
    }
    return removed;
  }

  public addExternalSystem(system: ExternalSystem): void {
    this.externalSystems.set(system.id, system);

    this.logger.info('External system added', {
      systemId: system.id,
      name: system.name,
      type: system.type,
    });
  }

  // Core synchronization methods
  public async syncFromAutotask(
    event: AutotaskWebhookEvent,
    syncId?: string
  ): Promise<SyncResult[]> {
    const results: SyncResult[] = [];
    const relevantConfigs = syncId
      ? ([this.config.get(syncId)].filter(Boolean) as SyncConfig[])
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

  public async syncToAutotask(
    externalData: any,
    entityType: string,
    entityId: string,
    externalSystemId: string,
    syncId?: string
  ): Promise<SyncResult[]> {
    const results: SyncResult[] = [];
    const relevantConfigs = syncId
      ? ([this.config.get(syncId)].filter(Boolean) as SyncConfig[])
      : Array.from(this.config.values()).filter(
          config => config.enabled && config.externalToAutotask
        );

    for (const config of relevantConfigs) {
      const mockEvent = this.createMockEvent(
        externalData,
        entityType,
        entityId
      );
      const result = await this.performSync(
        mockEvent,
        config,
        'from_external',
        externalData
      );
      results.push(result);
    }

    return results;
  }

  private async performSync(
    event: AutotaskWebhookEvent,
    config: SyncConfig,
    direction: 'to_external' | 'from_external',
    externalData?: any
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const correlationId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const context: SyncContext = {
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

    const result: SyncResult = {
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
      const syncPromise = this.executeSyncProcess(
        event,
        config,
        context,
        result,
        externalData
      );
      this.activeSyncs.set(syncKey, syncPromise);

      try {
        return await syncPromise;
      } finally {
        this.activeSyncs.delete(syncKey);
      }
    } catch (error) {
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

  private async executeSyncProcess(
    event: AutotaskWebhookEvent,
    config: SyncConfig,
    context: SyncContext,
    result: SyncResult,
    _externalData?: any
  ): Promise<SyncResult> {
    const startTime = Date.now();

    try {
      // Step 1: Apply filters
      if (
        config.filters &&
        !this.applyFilters(result.sourceData, config.filters, context.direction)
      ) {
        result.success = true; // Not an error, just filtered out
        result.metrics.processingTime = Date.now() - startTime;
        return result;
      }

      // Step 2: Get target data for conflict detection
      const targetData = await this.getTargetData(context);

      // Step 3: Detect and resolve conflicts
      if (targetData) {
        const conflicts = this.detectConflicts(
          result.sourceData,
          targetData,
          config.mappings
        );
        if (conflicts.length > 0) {
          const resolvedData = await this.resolveConflicts(
            result.sourceData,
            targetData,
            conflicts,
            config,
            context
          );
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
      result.transformedData = await this.applyFieldMappings(
        result.sourceData,
        config.mappings,
        context
      );
      result.metrics.mappingsApplied = config.mappings.length;

      // Step 5: Apply transformations
      if (config.transformations) {
        for (const transformation of config.transformations) {
          if (
            this.shouldApplyTransformation(transformation, context.direction)
          ) {
            result.transformedData = await transformation.transform(
              result.transformedData,
              context
            );
            result.metrics.transformationsApplied++;
          }
        }
      }

      // Step 6: Validate transformed data
      const validationResult = await this.validateTransformedData(
        result.transformedData,
        config,
        context
      );
      result.metrics.validationsPassed = validationResult.passed;
      result.metrics.validationsFailed = validationResult.failed;

      if (validationResult.errors.length > 0) {
        result.errors?.push(...validationResult.errors);
        throw new Error(
          `Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`
        );
      }

      // Step 7: Send to target system
      result.targetData = await this.sendToTargetSystem(
        result.transformedData,
        context
      );

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
    } catch (error) {
      result.errors?.push({
        code: 'SYNC_EXECUTION_ERROR',
        message: error instanceof Error ? error.message : String(error),
      });

      result.metrics.processingTime = Date.now() - startTime;
      this.updateStats(result, result.metrics.processingTime);

      throw error;
    }
  }

  private applyFilters(
    data: any,
    filters: SyncFilter[],
    direction: string
  ): boolean {
    return filters.every(filter => {
      if (
        filter.direction &&
        filter.direction !== direction &&
        filter.direction !== 'both'
      ) {
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

  private detectConflicts(
    sourceData: any,
    targetData: any,
    mappings: SyncFieldMapping[]
  ): Array<{
    field: string;
    autotaskValue: any;
    externalValue: any;
    mapping: SyncFieldMapping;
  }> {
    const conflicts = [];

    for (const mapping of mappings) {
      if (mapping.direction === 'bidirectional') {
        const sourceValue = this.getNestedValue(
          sourceData,
          mapping.autotaskField
        );
        const targetValue = this.getNestedValue(
          targetData,
          mapping.externalField
        );

        if (
          sourceValue !== undefined &&
          targetValue !== undefined &&
          sourceValue !== targetValue
        ) {
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

  private async resolveConflicts(
    sourceData: any,
    targetData: any,
    conflicts: any[],
    config: SyncConfig,
    context: SyncContext
  ): Promise<any> {
    const resolvedData = { ...sourceData };

    for (const conflict of conflicts) {
      let resolvedValue: any;

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
            resolvedValue = await config.customConflictResolver(
              conflict.autotaskValue,
              conflict.externalValue,
              context
            );
          } else {
            resolvedValue = conflict.autotaskValue; // Fallback
          }
          break;
        case 'manual':
          // Emit event for manual resolution
          this.emit('sync:conflict', {
            context,
            conflict,
            resolve: (value: any) => {
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

  private async applyFieldMappings(
    data: any,
    mappings: SyncFieldMapping[],
    context: SyncContext
  ): Promise<any> {
    const transformedData: any = {};

    for (const mapping of mappings) {
      if (!this.shouldApplyMapping(mapping, context.direction)) {
        continue;
      }

      const sourceField =
        context.direction === 'to_external'
          ? mapping.autotaskField
          : mapping.externalField;
      const targetField =
        context.direction === 'to_external'
          ? mapping.externalField
          : mapping.autotaskField;

      let value = this.getNestedValue(data, sourceField);

      // Apply transformation if configured
      const transform =
        context.direction === 'to_external'
          ? mapping.transform?.toExternal
          : mapping.transform?.fromExternal;

      if (transform) {
        value = transform(value, context);
      }

      // Apply validation if configured
      const validation =
        context.direction === 'to_external'
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

  private shouldApplyMapping(
    mapping: SyncFieldMapping,
    direction: string
  ): boolean {
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

  private shouldApplyTransformation(
    transformation: SyncTransformation,
    direction: string
  ): boolean {
    return (
      transformation.direction === 'both' ||
      transformation.direction === direction
    );
  }

  private async validateTransformedData(
    data: any,
    config: SyncConfig,
    context: SyncContext
  ): Promise<{
    passed: number;
    failed: number;
    errors: Array<{ field?: string; message: string; code: string }>;
  }> {
    // This is a simplified validation - in a real implementation,
    // you'd have more comprehensive validation rules
    const errors: Array<{ field?: string; message: string; code: string }> = [];
    let passed = 0;
    let failed = 0;

    for (const mapping of config.mappings) {
      if (mapping.required) {
        const field =
          context.direction === 'to_external'
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
        } else {
          passed++;
        }
      }
    }

    return { passed, failed, errors };
  }

  private async getTargetData(_context: SyncContext): Promise<any> {
    // This would integrate with the target system to get current data
    // Implementation depends on the target system type
    return null; // Simplified for now
  }

  private async sendToTargetSystem(
    data: any,
    context: SyncContext
  ): Promise<any> {
    // This would send data to the target system
    // Implementation depends on the target system type
    this.logger.debug('Sending data to target system', {
      targetSystem: context.targetSystem,
      entityType: context.entityType,
      entityId: context.entityId,
    });

    return data; // Simplified for now
  }

  private findRelevantSyncConfigs(
    event: AutotaskWebhookEvent,
    direction: string
  ): SyncConfig[] {
    return Array.from(this.config.values()).filter(config => {
      if (!config.enabled) return false;
      if (direction === 'to_external' && !config.autotaskToExternal)
        return false;
      if (direction === 'from_external' && !config.externalToAutotask)
        return false;

      // Add more sophisticated filtering logic here
      return true;
    });
  }

  private createMockEvent(
    externalData: any,
    entityType: string,
    entityId: string
  ): AutotaskWebhookEvent {
    // Create a mock Autotask event from external data
    return {
      id: `mock_${Date.now()}`,
      type: 'entity.updated' as any,
      action: 'update' as any,
      entityType: entityType as any,
      entityId,
      timestamp: new Date(),
      source: { system: 'external' as any },
      data: externalData,
      autotaskData: {
        zoneId: 'external',
      },
    };
  }

  private validateSyncConfig(config: SyncConfig): void {
    if (!config.id || !config.name) {
      throw new Error('Sync config must have id and name');
    }

    if (config.mappings.length === 0) {
      throw new Error('Sync config must have at least one field mapping');
    }

    // Add more validation as needed
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!(key in current)) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  private updateStats(result: SyncResult, processingTime: number): void {
    this.stats.totalSyncs++;

    if (result.success) {
      this.stats.successfulSyncs++;
    } else {
      this.stats.failedSyncs++;
    }

    if (result.direction === 'to_external') {
      this.stats.toExternalSyncs++;
    } else {
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
    const totalTime =
      this.stats.averageSyncTime * (this.stats.totalSyncs - 1) + processingTime;
    this.stats.averageSyncTime = totalTime / this.stats.totalSyncs;

    this.stats.lastSyncAt = new Date();
  }

  // Public utility methods
  public getSyncConfig(syncId: string): SyncConfig | undefined {
    return this.config.get(syncId);
  }

  public getSyncConfigs(): SyncConfig[] {
    return Array.from(this.config.values());
  }

  public getExternalSystems(): ExternalSystem[] {
    return Array.from(this.externalSystems.values());
  }

  public getStats(): SyncStats {
    return { ...this.stats };
  }

  public resetStats(): void {
    this.stats = this.initializeStats();
  }

  // Webhook handler creation
  public createWebhookHandler(syncId?: string): WebhookHandler {
    return {
      id: `sync_handler_${syncId || 'all'}`,
      name: `Synchronization Handler${syncId ? ` (${syncId})` : ''}`,
      description: 'Handles webhook events for data synchronization',
      handle: async (
        event: AutotaskWebhookEvent
      ): Promise<WebhookHandlerResult> => {
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
            errors: failedSyncs.flatMap(
              r =>
                r.errors?.map(e => ({ code: e.code, message: e.message })) || []
            ),
          };
        } catch (error) {
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
