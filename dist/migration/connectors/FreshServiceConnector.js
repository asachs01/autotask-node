"use strict";
/**
 * FreshService connector for migration to Autotask
 * Provides data extraction from FreshService using REST API
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FreshServiceConnector = void 0;
const BaseConnector_1 = require("./BaseConnector");
class FreshServiceConnector extends BaseConnector_1.BaseConnector {
    constructor(system, config, options = {}) {
        super(system, config, options);
    }
    async connect() {
        this.logger.info('FreshService connector - implementation in progress');
        this.isConnected = true;
    }
    async disconnect() {
        this.isConnected = false;
    }
    async testConnection() {
        return true;
    }
    getCapabilities() {
        return {
            supportedEntities: ['companies', 'contacts', 'tickets', 'assets', 'contracts'],
            supportsIncrementalSync: true,
            supportsRealTimeSync: false,
            maxBatchSize: 100,
            rateLimits: { requestsPerSecond: 5, requestsPerHour: 5000 },
            authenticationTypes: ['api_key'],
            apiVersion: 'v2'
        };
    }
    async getAvailableEntities() {
        return this.getCapabilities().supportedEntities;
    }
    async getEntitySchema(entityType) {
        return {
            name: entityType,
            fields: [],
            relationships: [],
            constraints: []
        };
    }
    async getRecordCount(entityType) {
        return 0;
    }
    async fetchBatch(entityType, offset, limit) {
        return [];
    }
}
exports.FreshServiceConnector = FreshServiceConnector;
//# sourceMappingURL=FreshServiceConnector.js.map