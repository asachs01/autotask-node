"use strict";
/**
 * ServiceDesk Plus connector for migration to Autotask
 * Provides data extraction from ManageEngine ServiceDesk Plus
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceDeskPlusConnector = void 0;
const BaseConnector_1 = require("./BaseConnector");
class ServiceDeskPlusConnector extends BaseConnector_1.BaseConnector {
    constructor(system, config, options = {}) {
        super(system, config, options);
    }
    async connect() {
        this.logger.info('ServiceDesk Plus connector - implementation in progress');
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
            supportedEntities: ['organizations', 'users', 'requests', 'assets', 'contracts'],
            supportsIncrementalSync: true,
            supportsRealTimeSync: false,
            maxBatchSize: 100,
            rateLimits: { requestsPerSecond: 10, requestsPerHour: 10000 },
            authenticationTypes: ['api_key', 'oauth2'],
            apiVersion: 'v3'
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
exports.ServiceDeskPlusConnector = ServiceDeskPlusConnector;
//# sourceMappingURL=ServiceDeskPlusConnector.js.map