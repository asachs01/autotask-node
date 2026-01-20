"use strict";
/**
 * ConnectWise Manage connector for migration to Autotask
 * Provides comprehensive data extraction and mapping for ConnectWise Manage
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectWiseManageConnector = void 0;
const axios_1 = __importDefault(require("axios"));
const BaseConnector_1 = require("./BaseConnector");
class ConnectWiseManageConnector extends BaseConnector_1.BaseConnector {
    constructor(system, config, options = {}) {
        super(system, config, options);
        this.apiVersion = 'v4_6_release';
    }
    async connect() {
        try {
            this.logger.info('Connecting to ConnectWise Manage');
            // Create axios instance with base configuration
            this.apiClient = axios_1.default.create({
                baseURL: `${this.config.baseUrl}/${this.apiVersion}`,
                timeout: this.options.timeout || 30000,
                headers: {
                    'Content-Type': 'application/json',
                    'clientId': this.config.credentials.clientId
                }
            });
            // Set up authentication
            this.setupAuthentication();
            // Test connection
            await this.testConnection();
            this.isConnected = true;
            this.logger.info('Connected to ConnectWise Manage successfully');
        }
        catch (error) {
            this.logger.error('Failed to connect to ConnectWise Manage', error);
            throw error;
        }
    }
    async disconnect() {
        this.isConnected = false;
        this.logger.info('Disconnected from ConnectWise Manage');
    }
    async testConnection() {
        try {
            const response = await this.apiClient.get('/system/info');
            return response.status === 200;
        }
        catch (error) {
            this.logger.error('Connection test failed', error);
            return false;
        }
    }
    getCapabilities() {
        return {
            supportedEntities: [
                'companies',
                'contacts',
                'agreements',
                'tickets',
                'projects',
                'time_entries',
                'expenses',
                'products',
                'configurations',
                'opportunities',
                'activities',
                'documents',
                'invoices'
            ],
            supportsIncrementalSync: true,
            supportsRealTimeSync: false,
            maxBatchSize: 1000,
            rateLimits: {
                requestsPerSecond: 5,
                requestsPerHour: 50000
            },
            authenticationTypes: ['basic_auth', 'api_key'],
            apiVersion: this.apiVersion
        };
    }
    async getAvailableEntities() {
        return this.getCapabilities().supportedEntities;
    }
    async getEntitySchema(entityType) {
        const schemas = {
            companies: {
                name: 'companies',
                fields: [
                    { name: 'id', type: 'number', required: false },
                    { name: 'identifier', type: 'string', required: true, maxLength: 25 },
                    { name: 'name', type: 'string', required: true, maxLength: 50 },
                    { name: 'status', type: 'object', required: true },
                    { name: 'type', type: 'object', required: true },
                    { name: 'addressLine1', type: 'string', required: false, maxLength: 50 },
                    { name: 'addressLine2', type: 'string', required: false, maxLength: 50 },
                    { name: 'city', type: 'string', required: false, maxLength: 50 },
                    { name: 'state', type: 'string', required: false, maxLength: 50 },
                    { name: 'zip', type: 'string', required: false, maxLength: 12 },
                    { name: 'country', type: 'object', required: false },
                    { name: 'phoneNumber', type: 'string', required: false, maxLength: 15, format: 'phone' },
                    { name: 'faxNumber', type: 'string', required: false, maxLength: 15, format: 'phone' },
                    { name: 'website', type: 'string', required: false, maxLength: 255, format: 'url' },
                    { name: 'territoryId', type: 'number', required: false },
                    { name: 'marketId', type: 'number', required: false },
                    { name: 'accountNumber', type: 'string', required: false, maxLength: 30 },
                    { name: 'dateAcquired', type: 'string', required: false, format: 'date' },
                    { name: 'sicCode', type: 'object', required: false },
                    { name: 'annualRevenue', type: 'number', required: false },
                    { name: 'numberOfEmployees', type: 'number', required: false },
                    { name: 'timeZone', type: 'object', required: false },
                    { name: 'leadSource', type: 'string', required: false, maxLength: 50 },
                    { name: 'leadFlag', type: 'boolean', required: false },
                    { name: 'unsubscribeFlag', type: 'boolean', required: false },
                    { name: 'calendarId', type: 'number', required: false },
                    { name: 'invoiceDeliveryMethod', type: 'object', required: false },
                    { name: 'invoiceToEmailAddress', type: 'string', required: false, format: 'email' },
                    { name: 'invoiceCCEmailAddress', type: 'string', required: false, format: 'email' },
                    { name: 'deletedFlag', type: 'boolean', required: false },
                    { name: 'dateDeleted', type: 'string', required: false, format: 'date' },
                    { name: 'deletedBy', type: 'string', required: false, maxLength: 30 }
                ],
                relationships: [
                    {
                        name: 'contacts',
                        type: 'one-to-many',
                        targetEntity: 'contacts',
                        foreignKey: 'company.id',
                        required: false
                    },
                    {
                        name: 'agreements',
                        type: 'one-to-many',
                        targetEntity: 'agreements',
                        foreignKey: 'company.id',
                        required: false
                    },
                    {
                        name: 'opportunities',
                        type: 'one-to-many',
                        targetEntity: 'opportunities',
                        foreignKey: 'company.id',
                        required: false
                    }
                ],
                constraints: ['identifier must be unique', 'name is required']
            },
            contacts: {
                name: 'contacts',
                fields: [
                    { name: 'id', type: 'number', required: false },
                    { name: 'firstName', type: 'string', required: false, maxLength: 30 },
                    { name: 'lastName', type: 'string', required: true, maxLength: 30 },
                    { name: 'company', type: 'object', required: true },
                    { name: 'site', type: 'object', required: false },
                    { name: 'addressLine1', type: 'string', required: false, maxLength: 50 },
                    { name: 'addressLine2', type: 'string', required: false, maxLength: 50 },
                    { name: 'city', type: 'string', required: false, maxLength: 50 },
                    { name: 'state', type: 'string', required: false, maxLength: 50 },
                    { name: 'zip', type: 'string', required: false, maxLength: 12 },
                    { name: 'country', type: 'object', required: false },
                    { name: 'relationship', type: 'object', required: false },
                    { name: 'type', type: 'object', required: false },
                    { name: 'communicationItems', type: 'array', required: false },
                    { name: 'title', type: 'string', required: false, maxLength: 50 },
                    { name: 'school', type: 'string', required: false, maxLength: 50 },
                    { name: 'nickName', type: 'string', required: false, maxLength: 30 },
                    { name: 'marriedFlag', type: 'boolean', required: false },
                    { name: 'childrenFlag', type: 'boolean', required: false },
                    { name: 'significantOther', type: 'string', required: false, maxLength: 50 },
                    { name: 'portalPassword', type: 'string', required: false, maxLength: 50 },
                    { name: 'portalSecurityLevel', type: 'number', required: false },
                    { name: 'disablePortalLoginFlag', type: 'boolean', required: false },
                    { name: 'unsubscribeFlag', type: 'boolean', required: false },
                    { name: 'gender', type: 'string', required: false, values: ['Male', 'Female'] },
                    { name: 'birthDay', type: 'string', required: false, format: 'date' },
                    { name: 'anniversary', type: 'string', required: false, format: 'date' },
                    { name: 'presence', type: 'string', required: false, maxLength: 50 },
                    { name: 'mobileGuid', type: 'string', required: false },
                    { name: 'facebookUrl', type: 'string', required: false, format: 'url' },
                    { name: 'twitterUrl', type: 'string', required: false, format: 'url' },
                    { name: 'linkedInUrl', type: 'string', required: false, format: 'url' },
                    { name: 'defaultBillingFlag', type: 'boolean', required: false },
                    { name: 'defaultFlag', type: 'boolean', required: false },
                    { name: 'inactiveFlag', type: 'boolean', required: false }
                ],
                relationships: [
                    {
                        name: 'company',
                        type: 'many-to-one',
                        targetEntity: 'companies',
                        foreignKey: 'company.id',
                        required: true
                    }
                ],
                constraints: ['lastName is required', 'company relationship is required']
            },
            tickets: {
                name: 'tickets',
                fields: [
                    { name: 'id', type: 'number', required: false },
                    { name: 'summary', type: 'string', required: true, maxLength: 100 },
                    { name: 'recordType', type: 'string', required: true, values: ['ServiceTicket', 'ProjectTicket', 'ProjectIssue'] },
                    { name: 'board', type: 'object', required: true },
                    { name: 'status', type: 'object', required: true },
                    { name: 'company', type: 'object', required: true },
                    { name: 'site', type: 'object', required: false },
                    { name: 'siteName', type: 'string', required: false, maxLength: 50 },
                    { name: 'addressLine1', type: 'string', required: false, maxLength: 50 },
                    { name: 'addressLine2', type: 'string', required: false, maxLength: 50 },
                    { name: 'city', type: 'string', required: false, maxLength: 50 },
                    { name: 'stateIdentifier', type: 'string', required: false, maxLength: 50 },
                    { name: 'zip', type: 'string', required: false, maxLength: 12 },
                    { name: 'country', type: 'object', required: false },
                    { name: 'contact', type: 'object', required: false },
                    { name: 'contactName', type: 'string', required: false, maxLength: 62 },
                    { name: 'contactPhoneNumber', type: 'string', required: false, maxLength: 15, format: 'phone' },
                    { name: 'contactPhoneExtension', type: 'string', required: false, maxLength: 15 },
                    { name: 'contactEmailAddress', type: 'string', required: false, format: 'email' },
                    { name: 'type', type: 'object', required: false },
                    { name: 'subType', type: 'object', required: false },
                    { name: 'item', type: 'object', required: false },
                    { name: 'team', type: 'object', required: false },
                    { name: 'owner', type: 'object', required: false },
                    { name: 'priority', type: 'object', required: false },
                    { name: 'serviceLocation', type: 'object', required: false },
                    { name: 'source', type: 'object', required: false },
                    { name: 'severity', type: 'string', required: false, values: ['Low', 'Medium', 'High'] },
                    { name: 'impact', type: 'string', required: false, values: ['Low', 'Medium', 'High'] },
                    { name: 'allowAllClientsPortalView', type: 'boolean', required: false },
                    { name: 'customerUpdatedFlag', type: 'boolean', required: false },
                    { name: 'automaticEmailContactFlag', type: 'boolean', required: false },
                    { name: 'automaticEmailResourceFlag', type: 'boolean', required: false },
                    { name: 'automaticEmailCcFlag', type: 'boolean', required: false },
                    { name: 'automaticEmailCc', type: 'string', required: false },
                    { name: 'initialDescription', type: 'string', required: false },
                    { name: 'initialInternalAnalysis', type: 'string', required: false },
                    { name: 'initialResolution', type: 'string', required: false },
                    { name: 'contactEmailLookup', type: 'string', required: false, format: 'email' },
                    { name: 'processNotifications', type: 'boolean', required: false },
                    { name: 'skipCallback', type: 'boolean', required: false },
                    { name: 'closedDate', type: 'string', required: false, format: 'date' },
                    { name: 'closedBy', type: 'string', required: false, maxLength: 30 },
                    { name: 'closedFlag', type: 'boolean', required: false },
                    { name: 'actualHours', type: 'number', required: false },
                    { name: 'approved', type: 'boolean', required: false },
                    { name: 'estimatedExpenseCost', type: 'number', required: false },
                    { name: 'estimatedExpenseRevenue', type: 'number', required: false },
                    { name: 'estimatedProductCost', type: 'number', required: false },
                    { name: 'estimatedProductRevenue', type: 'number', required: false },
                    { name: 'estimatedTimeCost', type: 'number', required: false },
                    { name: 'estimatedTimeRevenue', type: 'number', required: false },
                    { name: 'billingMethod', type: 'string', required: false },
                    { name: 'billingAmount', type: 'number', required: false },
                    { name: 'hourlyRate', type: 'number', required: false },
                    { name: 'subBillingMethod', type: 'string', required: false },
                    { name: 'subBillingAmount', type: 'number', required: false },
                    { name: 'subDateAccepted', type: 'string', required: false, format: 'date' },
                    { name: 'dateEntered', type: 'string', required: false, format: 'date' },
                    { name: 'enteredBy', type: 'string', required: false, maxLength: 30 },
                    { name: 'lastUpdated', type: 'string', required: false, format: 'date' },
                    { name: 'updatedBy', type: 'string', required: false, maxLength: 30 },
                    { name: 'duration', type: 'number', required: false }
                ],
                relationships: [
                    {
                        name: 'company',
                        type: 'many-to-one',
                        targetEntity: 'companies',
                        foreignKey: 'company.id',
                        required: true
                    },
                    {
                        name: 'contact',
                        type: 'many-to-one',
                        targetEntity: 'contacts',
                        foreignKey: 'contact.id',
                        required: false
                    },
                    {
                        name: 'project',
                        type: 'many-to-one',
                        targetEntity: 'projects',
                        foreignKey: 'project.id',
                        required: false
                    }
                ],
                constraints: ['summary is required', 'board is required', 'company is required']
            }
        };
        const schema = schemas[entityType];
        if (!schema) {
            throw new Error(`Schema not found for entity type: ${entityType}`);
        }
        return schema;
    }
    async getRecordCount(entityType, filters) {
        try {
            const endpoint = this.getEndpoint(entityType);
            const params = {
                pageSize: 1,
                conditions: this.buildConditions(filters)
            };
            const response = await this.apiClient.get(endpoint + '/count', { params });
            return response.data.count || 0;
        }
        catch (error) {
            this.logger.error('Failed to get record count', { entityType, error });
            throw error;
        }
    }
    async fetchBatch(entityType, offset, limit, options) {
        try {
            await this.checkRateLimit();
            const endpoint = this.getEndpoint(entityType);
            const params = {
                page: Math.floor(offset / limit) + 1,
                pageSize: Math.min(limit, 1000), // CW Manage max page size
                conditions: this.buildConditions(options?.filters),
                orderBy: this.buildOrderBy(options?.sorting),
                fields: options?.fields?.join(','),
                childConditions: this.buildChildConditions(options?.includeRelated)
            };
            const response = await this.apiClient.get(endpoint, { params });
            // Update rate limit info from response headers
            this.updateRateLimitFromHeaders(response);
            return response.data || [];
        }
        catch (error) {
            this.logger.error('Failed to fetch batch', { entityType, offset, limit, error });
            throw error;
        }
    }
    setupAuthentication() {
        const { username, password, clientId } = this.config.credentials;
        if (username && password) {
            // Basic authentication
            const auth = Buffer.from(`${username}:${password}`).toString('base64');
            this.apiClient.defaults.headers.common['Authorization'] = `Basic ${auth}`;
        }
        if (clientId) {
            this.apiClient.defaults.headers.common['clientId'] = clientId;
        }
    }
    getEndpoint(entityType) {
        const endpointMap = {
            companies: '/company/companies',
            contacts: '/company/contacts',
            agreements: '/finance/agreements',
            tickets: '/service/tickets',
            projects: '/project/projects',
            time_entries: '/time/entries',
            expenses: '/expense/entries',
            products: '/procurement/products',
            configurations: '/company/configurations',
            opportunities: '/sales/opportunities',
            activities: '/sales/activities',
            documents: '/system/documents',
            invoices: '/finance/invoices'
        };
        const endpoint = endpointMap[entityType];
        if (!endpoint) {
            throw new Error(`Unsupported entity type: ${entityType}`);
        }
        return endpoint;
    }
    buildConditions(filters) {
        if (!filters || Object.keys(filters).length === 0) {
            return '';
        }
        const conditions = [];
        for (const [field, value] of Object.entries(filters)) {
            if (value != null) {
                if (typeof value === 'string') {
                    conditions.push(`${field} = "${value}"`);
                }
                else if (typeof value === 'number') {
                    conditions.push(`${field} = ${value}`);
                }
                else if (typeof value === 'boolean') {
                    conditions.push(`${field} = ${value}`);
                }
                else if (Array.isArray(value)) {
                    const valueList = value.map(v => typeof v === 'string' ? `"${v}"` : v).join(',');
                    conditions.push(`${field} in (${valueList})`);
                }
            }
        }
        return conditions.join(' and ');
    }
    buildOrderBy(sorting) {
        if (!sorting || sorting.length === 0) {
            return 'id';
        }
        return sorting
            .map(sort => `${sort.field} ${sort.direction}`)
            .join(',');
    }
    buildChildConditions(includeRelated) {
        if (!includeRelated || includeRelated.length === 0) {
            return '';
        }
        // Build child conditions for related entities
        return includeRelated.join(',');
    }
    updateRateLimitFromHeaders(response) {
        const remaining = parseInt(response.headers['x-ratelimit-remaining'] || '0', 10);
        const resetTime = parseInt(response.headers['x-ratelimit-reset'] || '0', 10);
        this.updateRateLimit(remaining, new Date(resetTime * 1000));
    }
}
exports.ConnectWiseManageConnector = ConnectWiseManageConnector;
//# sourceMappingURL=ConnectWiseManageConnector.js.map