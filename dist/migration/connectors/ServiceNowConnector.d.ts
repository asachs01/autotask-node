/**
 * ServiceNow ITSM connector for migration to Autotask
 * Provides data extraction from ServiceNow using REST API
 */
import { BaseConnector, EntitySchema, FetchOptions, ConnectorOptions } from './BaseConnector';
import { PSASystem, SourceConnectionConfig, ConnectorCapabilities } from '../types/MigrationTypes';
export declare class ServiceNowConnector extends BaseConnector {
    private apiClient;
    constructor(system: PSASystem, config: SourceConnectionConfig, options?: ConnectorOptions);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    testConnection(): Promise<boolean>;
    getCapabilities(): ConnectorCapabilities;
    getAvailableEntities(): Promise<string[]>;
    getEntitySchema(entityType: string): Promise<EntitySchema>;
    getRecordCount(entityType: string, filters?: Record<string, any>): Promise<number>;
    fetchBatch(entityType: string, offset: number, limit: number, options?: FetchOptions): Promise<any[]>;
    private setupAuthentication;
    private getTableName;
    private buildQuery;
    private transformRecords;
    private transformFieldValue;
    private mapServiceNowType;
    private getFormatFromType;
    private getRelationships;
    private getDefaultSchema;
    private updateRateLimitFromHeaders;
}
//# sourceMappingURL=ServiceNowConnector.d.ts.map