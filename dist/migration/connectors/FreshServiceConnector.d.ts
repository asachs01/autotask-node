/**
 * FreshService connector for migration to Autotask
 * Provides data extraction from FreshService using REST API
 */
import { BaseConnector, EntitySchema, ConnectorOptions } from './BaseConnector';
import { PSASystem, SourceConnectionConfig, ConnectorCapabilities } from '../types/MigrationTypes';
export declare class FreshServiceConnector extends BaseConnector {
    constructor(system: PSASystem, config: SourceConnectionConfig, options?: ConnectorOptions);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    testConnection(): Promise<boolean>;
    getCapabilities(): ConnectorCapabilities;
    getAvailableEntities(): Promise<string[]>;
    getEntitySchema(entityType: string): Promise<EntitySchema>;
    getRecordCount(entityType: string): Promise<number>;
    fetchBatch(entityType: string, offset: number, limit: number): Promise<any[]>;
}
//# sourceMappingURL=FreshServiceConnector.d.ts.map