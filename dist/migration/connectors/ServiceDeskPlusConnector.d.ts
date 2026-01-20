/**
 * ServiceDesk Plus connector for migration to Autotask
 * Provides data extraction from ManageEngine ServiceDesk Plus
 */
import { BaseConnector, EntitySchema, ConnectorOptions } from './BaseConnector';
import { PSASystem, SourceConnectionConfig, ConnectorCapabilities } from '../types/MigrationTypes';
export declare class ServiceDeskPlusConnector extends BaseConnector {
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
//# sourceMappingURL=ServiceDeskPlusConnector.d.ts.map