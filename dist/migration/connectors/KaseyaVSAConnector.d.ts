/**
 * Kaseya VSA connector for migration to Autotask
 * Provides data extraction from Kaseya VSA using REST API
 */
import { BaseConnector, EntitySchema, FetchOptions, ConnectorOptions } from './BaseConnector';
import { PSASystem, SourceConnectionConfig, ConnectorCapabilities } from '../types/MigrationTypes';
export declare class KaseyaVSAConnector extends BaseConnector {
    private apiClient;
    private accessToken?;
    private tokenExpiry?;
    constructor(system: PSASystem, config: SourceConnectionConfig, options?: ConnectorOptions);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    testConnection(): Promise<boolean>;
    getCapabilities(): ConnectorCapabilities;
    getAvailableEntities(): Promise<string[]>;
    getEntitySchema(entityType: string): Promise<EntitySchema>;
    getRecordCount(entityType: string, filters?: Record<string, any>): Promise<number>;
    fetchBatch(entityType: string, offset: number, limit: number, options?: FetchOptions): Promise<any[]>;
    private authenticate;
    private ensureAuthenticated;
    private getEndpoint;
    private buildFilter;
    private transformRecords;
    private transformFieldValue;
    private updateRateLimitFromHeaders;
}
//# sourceMappingURL=KaseyaVSAConnector.d.ts.map