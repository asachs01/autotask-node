/**
 * Abstract base connector for PSA system integrations
 * Provides common interface and functionality for all PSA connectors
 */
import { EventEmitter } from 'events';
import { Logger } from 'winston';
import { SourceConnectionConfig, ConnectorCapabilities, PSASystem, DataQualityReport } from '../types/MigrationTypes';
export interface ConnectorOptions {
    timeout?: number;
    retryAttempts?: number;
    rateLimit?: number;
    batchSize?: number;
    parallelism?: number;
}
export interface EntitySchema {
    name: string;
    fields: FieldSchema[];
    relationships: RelationshipSchema[];
    constraints: string[];
}
export interface FieldSchema {
    name: string;
    type: string;
    required: boolean;
    maxLength?: number;
    format?: string;
    values?: string[];
}
export interface RelationshipSchema {
    name: string;
    type: 'one-to-one' | 'one-to-many' | 'many-to-many' | 'many-to-one';
    targetEntity: string;
    foreignKey: string;
    required: boolean;
}
export interface FetchOptions {
    filters?: Record<string, any>;
    sorting?: {
        field: string;
        direction: 'asc' | 'desc';
    }[];
    fields?: string[];
    includeRelated?: string[];
    modifiedSince?: Date;
}
export interface SyncResult {
    totalRecords: number;
    fetchedRecords: number;
    errors: Array<{
        record: any;
        error: string;
    }>;
    warnings: string[];
    metadata: Record<string, any>;
}
export declare abstract class BaseConnector extends EventEmitter {
    protected system: PSASystem;
    protected config: SourceConnectionConfig;
    protected options: ConnectorOptions;
    protected logger: Logger;
    protected isConnected: boolean;
    protected rateLimitRemaining: number;
    protected rateLimitReset: Date;
    constructor(system: PSASystem, config: SourceConnectionConfig, options?: ConnectorOptions);
    /**
     * Connect to the PSA system
     */
    abstract connect(): Promise<void>;
    /**
     * Disconnect from the PSA system
     */
    abstract disconnect(): Promise<void>;
    /**
     * Test the connection
     */
    abstract testConnection(): Promise<boolean>;
    /**
     * Get connector capabilities
     */
    abstract getCapabilities(): ConnectorCapabilities;
    /**
     * Get available entities
     */
    abstract getAvailableEntities(): Promise<string[]>;
    /**
     * Get entity schema
     */
    abstract getEntitySchema(entityType: string): Promise<EntitySchema>;
    /**
     * Get record count for an entity
     */
    abstract getRecordCount(entityType: string, filters?: Record<string, any>): Promise<number>;
    /**
     * Fetch records in batches
     */
    abstract fetchBatch(entityType: string, offset: number, limit: number, options?: FetchOptions): Promise<any[]>;
    /**
     * Fetch all records for an entity
     */
    fetchAll(entityType: string, options?: FetchOptions): Promise<any[]>;
    /**
     * Fetch incremental changes since last sync
     */
    fetchIncremental(entityType: string, since: Date, options?: FetchOptions): Promise<SyncResult>;
    /**
     * Validate data quality for an entity
     */
    validateDataQuality(entityType: string): Promise<DataQualityReport>;
    /**
     * Export entity data to various formats
     */
    exportData(entityType: string, format: 'json' | 'csv' | 'xml', outputPath: string, options?: FetchOptions): Promise<void>;
    /**
     * Get connection status
     */
    getConnectionStatus(): {
        isConnected: boolean;
        lastConnected?: Date;
        rateLimitRemaining: number;
        rateLimitReset: Date;
    };
    /**
     * Health check
     */
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        latency: number;
        details: Record<string, any>;
    }>;
    protected checkRateLimit(): Promise<void>;
    protected sleep(ms: number): Promise<void>;
    protected updateRateLimit(remaining: number, resetTime: Date): void;
    protected retryWithBackoff<T>(operation: () => Promise<T>, attempts?: number): Promise<T>;
    protected analyzeDataQuality(schema: EntitySchema, records: any[]): Promise<any[]>;
    protected calculateQualityScore(issues: any[]): number;
    protected generateQualityRecommendations(issues: any[]): string[];
    protected calculateCompleteness(schema: EntitySchema, records: any[]): number;
    protected calculateAccuracy(schema: EntitySchema, records: any[]): number;
    protected calculateConsistency(records: any[]): number;
    protected calculateValidity(schema: EntitySchema, records: any[]): number;
    protected validateFieldFormat(value: any, format: string): boolean;
    protected exportToJSON(records: any[], outputPath: string): Promise<void>;
    protected exportToCSV(records: any[], outputPath: string): Promise<void>;
    protected exportToXML(records: any[], outputPath: string): Promise<void>;
    private escapeXML;
}
//# sourceMappingURL=BaseConnector.d.ts.map