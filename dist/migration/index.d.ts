/**
 * Autotask PSA Migration Framework
 * Complete migration solution for importing data from various PSA systems to Autotask
 */
export { MigrationEngine } from './core/MigrationEngine';
export * from './types/MigrationTypes';
export { BaseConnector } from './connectors/BaseConnector';
export { ConnectorFactory } from './connectors/ConnectorFactory';
export { ConnectWiseManageConnector } from './connectors/ConnectWiseManageConnector';
export { ServiceNowConnector } from './connectors/ServiceNowConnector';
export { KaseyaVSAConnector } from './connectors/KaseyaVSAConnector';
export { FreshServiceConnector } from './connectors/FreshServiceConnector';
export { ServiceDeskPlusConnector } from './connectors/ServiceDeskPlusConnector';
export { CSVImportConnector } from './connectors/CSVImportConnector';
export { MappingEngine } from './mapping/MappingEngine';
export { PreMigrationValidator } from './validation/PreMigrationValidator';
export { createMigrationConfig, validateMigrationConfig } from './utils/configHelpers';
export { createMappingRules } from './utils/mappingHelpers';
export { generateMigrationReport } from './utils/reportHelpers';
/**
 * Quick start function for simple migrations
 */
export declare function createSimpleMigration(options: {
    sourceSystem: string;
    sourceConfig: any;
    autotaskConfig: any;
    entities: string[];
    mappingRules?: any[];
}): Promise<MigrationEngine>;
/**
 * Create a CSV import migration
 */
export declare function createCSVImport(options: {
    filePath: string;
    targetEntity: string;
    fieldMapping: Record<string, string>;
    autotaskConfig: any;
    hasHeaders?: boolean;
    delimiter?: string;
}): Promise<MigrationEngine>;
/**
 * Migration configuration builder
 */
export declare class MigrationConfigBuilder {
    private config;
    sourceSystem(system: string): this;
    sourceConnection(config: any): this;
    entities(entities: string[]): this;
    autotaskConfig(config: any): this;
    mappingRules(rules: any[]): this;
    validation(options: any): this;
    options(options: any): this;
    build(): any;
}
/**
 * Default field mappings for common PSA systems
 */
export declare const DEFAULT_MAPPINGS: {
    connectwise: {
        companies: {
            name: string;
            identifier: string;
            addressLine1: string;
            city: string;
            state: string;
            zip: string;
            phoneNumber: string;
            website: string;
        };
        contacts: {
            firstName: string;
            lastName: string;
            'communicationItems[0].value': string;
            title: string;
        };
        tickets: {
            summary: string;
            initialDescription: string;
            'status.name': string;
            'priority.name': string;
        };
    };
    servicenow: {
        companies: {
            name: string;
            street: string;
            city: string;
            state: string;
            zip: string;
            phone: string;
            website: string;
        };
        contacts: {
            first_name: string;
            last_name: string;
            email: string;
            title: string;
        };
        tickets: {
            short_description: string;
            description: string;
            state: string;
            priority: string;
        };
    };
};
export declare const VERSION = "1.0.0";
export declare const SUPPORTED_SYSTEMS: string[];
import { MigrationEngine } from './core/MigrationEngine';
import { ConnectorFactory } from './connectors/ConnectorFactory';
import { MappingEngine } from './mapping/MappingEngine';
declare const _default: {
    MigrationEngine: typeof MigrationEngine;
    ConnectorFactory: typeof ConnectorFactory;
    MappingEngine: typeof MappingEngine;
    createSimpleMigration: typeof createSimpleMigration;
    createCSVImport: typeof createCSVImport;
    MigrationConfigBuilder: typeof MigrationConfigBuilder;
    DEFAULT_MAPPINGS: {
        connectwise: {
            companies: {
                name: string;
                identifier: string;
                addressLine1: string;
                city: string;
                state: string;
                zip: string;
                phoneNumber: string;
                website: string;
            };
            contacts: {
                firstName: string;
                lastName: string;
                'communicationItems[0].value': string;
                title: string;
            };
            tickets: {
                summary: string;
                initialDescription: string;
                'status.name': string;
                'priority.name': string;
            };
        };
        servicenow: {
            companies: {
                name: string;
                street: string;
                city: string;
                state: string;
                zip: string;
                phone: string;
                website: string;
            };
            contacts: {
                first_name: string;
                last_name: string;
                email: string;
                title: string;
            };
            tickets: {
                short_description: string;
                description: string;
                state: string;
                priority: string;
            };
        };
    };
    VERSION: string;
    SUPPORTED_SYSTEMS: string[];
};
export default _default;
//# sourceMappingURL=index.d.ts.map