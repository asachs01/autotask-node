/**
 * CSV/Excel Import connector for generic data migration to Autotask
 * Supports flexible column mapping and data transformation
 */
import { BaseConnector, EntitySchema, FetchOptions, ConnectorOptions } from './BaseConnector';
import { PSASystem, SourceConnectionConfig, ConnectorCapabilities } from '../types/MigrationTypes';
export interface CSVImportConfig extends SourceConnectionConfig {
    filePath: string;
    format: 'csv' | 'excel';
    delimiter?: string;
    encoding?: string;
    hasHeaders?: boolean;
    skipRows?: number;
    mapping?: Record<string, string>;
    dateFormats?: Record<string, string>;
}
export declare class CSVImportConnector extends BaseConnector {
    protected config: CSVImportConfig;
    private records;
    private headers;
    private totalRecords;
    constructor(system: PSASystem, config: CSVImportConfig, options?: ConnectorOptions);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    testConnection(): Promise<boolean>;
    getCapabilities(): ConnectorCapabilities;
    getAvailableEntities(): Promise<string[]>;
    getEntitySchema(entityType: string): Promise<EntitySchema>;
    getRecordCount(entityType: string, filters?: Record<string, any>): Promise<number>;
    fetchBatch(entityType: string, offset: number, limit: number, options?: FetchOptions): Promise<any[]>;
    private loadCSVData;
    private loadExcelData;
    private processExcelRecord;
    private parseValue;
    private parseDate;
    private inferFieldType;
    private getMaxLength;
    private filterRecords;
    private sortRecords;
    private applyMappings;
    /**
     * Preview data for mapping configuration
     */
    previewData(limit?: number): Promise<{
        headers: string[];
        sampleRecords: any[];
        statistics: Record<string, any>;
    }>;
}
//# sourceMappingURL=CSVImportConnector.d.ts.map