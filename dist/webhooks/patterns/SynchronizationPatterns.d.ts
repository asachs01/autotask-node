/**
 * Real-time synchronization patterns for bi-directional data synchronization
 */
import winston from 'winston';
import { EventEmitter } from 'events';
import { WebhookHandler } from '../types/WebhookTypes';
import { AutotaskWebhookEvent } from '../../events/types/AutotaskEvents';
export interface SyncConfig {
    id: string;
    name: string;
    description?: string;
    enabled: boolean;
    autotaskToExternal: boolean;
    externalToAutotask: boolean;
    conflictResolution: 'autotask_wins' | 'external_wins' | 'timestamp' | 'manual' | 'custom';
    customConflictResolver?: (autotaskData: any, externalData: any, context: SyncContext) => Promise<any>;
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
    operator: 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'ends_with' | 'in' | 'not_in';
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
export declare class SynchronizationEngine extends EventEmitter {
    private config;
    private externalSystems;
    private stats;
    private logger;
    private activeSyncs;
    constructor(logger?: winston.Logger);
    private createDefaultLogger;
    private initializeStats;
    addSyncConfig(config: SyncConfig): void;
    updateSyncConfig(syncId: string, updates: Partial<SyncConfig>): boolean;
    removeSyncConfig(syncId: string): boolean;
    addExternalSystem(system: ExternalSystem): void;
    syncFromAutotask(event: AutotaskWebhookEvent, syncId?: string): Promise<SyncResult[]>;
    syncToAutotask(externalData: any, entityType: string, entityId: string, externalSystemId: string, syncId?: string): Promise<SyncResult[]>;
    private performSync;
    private executeSyncProcess;
    private applyFilters;
    private detectConflicts;
    private resolveConflicts;
    private applyFieldMappings;
    private shouldApplyMapping;
    private shouldApplyTransformation;
    private validateTransformedData;
    private getTargetData;
    private sendToTargetSystem;
    private findRelevantSyncConfigs;
    private createMockEvent;
    private validateSyncConfig;
    private getNestedValue;
    private setNestedValue;
    private updateStats;
    getSyncConfig(syncId: string): SyncConfig | undefined;
    getSyncConfigs(): SyncConfig[];
    getExternalSystems(): ExternalSystem[];
    getStats(): SyncStats;
    resetStats(): void;
    createWebhookHandler(syncId?: string): WebhookHandler;
}
//# sourceMappingURL=SynchronizationPatterns.d.ts.map