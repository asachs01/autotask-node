"use strict";
/**
 * Factory for creating PSA system connectors
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorFactory = void 0;
const MigrationTypes_1 = require("../types/MigrationTypes");
const ConnectWiseManageConnector_1 = require("./ConnectWiseManageConnector");
const ServiceNowConnector_1 = require("./ServiceNowConnector");
const KaseyaVSAConnector_1 = require("./KaseyaVSAConnector");
const FreshServiceConnector_1 = require("./FreshServiceConnector");
const ServiceDeskPlusConnector_1 = require("./ServiceDeskPlusConnector");
const CSVImportConnector_1 = require("./CSVImportConnector");
class ConnectorFactory {
    /**
     * Create a connector for the specified PSA system
     */
    static createConnector(system, config, options) {
        const ConnectorClass = this.connectorRegistry.get(system);
        if (!ConnectorClass) {
            throw new Error(`Unsupported PSA system: ${system}`);
        }
        return new ConnectorClass(system, config, options);
    }
    /**
     * Register a custom connector
     */
    static registerConnector(system, connectorClass) {
        this.connectorRegistry.set(system, connectorClass);
    }
    /**
     * Get supported PSA systems
     */
    static getSupportedSystems() {
        return Array.from(this.connectorRegistry.keys());
    }
    /**
     * Check if a PSA system is supported
     */
    static isSupported(system) {
        return this.connectorRegistry.has(system);
    }
    /**
     * Get connector capabilities for a PSA system
     */
    static getConnectorCapabilities(system) {
        const ConnectorClass = this.connectorRegistry.get(system);
        if (!ConnectorClass) {
            throw new Error(`Unsupported PSA system: ${system}`);
        }
        // Create temporary instance to get capabilities
        const tempConnector = new ConnectorClass(system, { baseUrl: '', credentials: {} });
        return tempConnector.getCapabilities();
    }
}
exports.ConnectorFactory = ConnectorFactory;
ConnectorFactory.connectorRegistry = new Map([
    [MigrationTypes_1.PSASystem.CONNECTWISE_MANAGE, ConnectWiseManageConnector_1.ConnectWiseManageConnector],
    [MigrationTypes_1.PSASystem.SERVICENOW, ServiceNowConnector_1.ServiceNowConnector],
    [MigrationTypes_1.PSASystem.KASEYA_VSA, KaseyaVSAConnector_1.KaseyaVSAConnector],
    [MigrationTypes_1.PSASystem.FRESHSERVICE, FreshServiceConnector_1.FreshServiceConnector],
    [MigrationTypes_1.PSASystem.SERVICEDESK_PLUS, ServiceDeskPlusConnector_1.ServiceDeskPlusConnector],
    [MigrationTypes_1.PSASystem.CSV_IMPORT, CSVImportConnector_1.CSVImportConnector],
    [MigrationTypes_1.PSASystem.EXCEL_IMPORT, CSVImportConnector_1.CSVImportConnector] // Uses same connector as CSV
]);
//# sourceMappingURL=ConnectorFactory.js.map