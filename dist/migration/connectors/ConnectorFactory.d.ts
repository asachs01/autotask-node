/**
 * Factory for creating PSA system connectors
 */
import { PSASystem, SourceConnectionConfig } from '../types/MigrationTypes';
import { BaseConnector, ConnectorOptions } from './BaseConnector';
export declare class ConnectorFactory {
    private static connectorRegistry;
    /**
     * Create a connector for the specified PSA system
     */
    static createConnector(system: PSASystem, config: SourceConnectionConfig, options?: ConnectorOptions): BaseConnector;
    /**
     * Register a custom connector
     */
    static registerConnector(system: PSASystem, connectorClass: new (system: PSASystem, config: SourceConnectionConfig, options?: ConnectorOptions) => BaseConnector): void;
    /**
     * Get supported PSA systems
     */
    static getSupportedSystems(): PSASystem[];
    /**
     * Check if a PSA system is supported
     */
    static isSupported(system: PSASystem): boolean;
    /**
     * Get connector capabilities for a PSA system
     */
    static getConnectorCapabilities(system: PSASystem): any;
}
//# sourceMappingURL=ConnectorFactory.d.ts.map