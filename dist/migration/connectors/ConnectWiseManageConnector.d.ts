/**
 * ConnectWise Manage connector for migration to Autotask
 * Provides comprehensive data extraction and mapping for ConnectWise Manage
 */
import { BaseConnector, EntitySchema, FetchOptions, ConnectorOptions } from './BaseConnector';
import { PSASystem, SourceConnectionConfig, ConnectorCapabilities } from '../types/MigrationTypes';
export declare class ConnectWiseManageConnector extends BaseConnector {
    private apiClient;
    private apiVersion;
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
    private getEndpoint;
    private buildConditions;
    private buildOrderBy;
    private buildChildConditions;
    private updateRateLimitFromHeaders;
}
//# sourceMappingURL=ConnectWiseManageConnector.d.ts.map