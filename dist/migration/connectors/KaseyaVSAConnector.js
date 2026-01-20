"use strict";
/**
 * Kaseya VSA connector for migration to Autotask
 * Provides data extraction from Kaseya VSA using REST API
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KaseyaVSAConnector = void 0;
const axios_1 = __importDefault(require("axios"));
const BaseConnector_1 = require("./BaseConnector");
class KaseyaVSAConnector extends BaseConnector_1.BaseConnector {
    constructor(system, config, options = {}) {
        super(system, config, options);
    }
    async connect() {
        try {
            this.logger.info('Connecting to Kaseya VSA');
            this.apiClient = axios_1.default.create({
                baseURL: `${this.config.baseUrl}/api/v1.0`,
                timeout: this.options.timeout || 30000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            await this.authenticate();
            await this.testConnection();
            this.isConnected = true;
            this.logger.info('Connected to Kaseya VSA successfully');
        }
        catch (error) {
            this.logger.error('Failed to connect to Kaseya VSA', error);
            throw error;
        }
    }
    async disconnect() {
        this.accessToken = undefined;
        this.tokenExpiry = undefined;
        this.isConnected = false;
        this.logger.info('Disconnected from Kaseya VSA');
    }
    async testConnection() {
        try {
            await this.ensureAuthenticated();
            const response = await this.apiClient.get('/system/info');
            return response.status === 200;
        }
        catch (error) {
            this.logger.error('Kaseya VSA connection test failed', error);
            return false;
        }
    }
    getCapabilities() {
        return {
            supportedEntities: [
                'organizations', // Organizations/Tenants
                'machines', // Managed endpoints
                'agents', // VSA agents
                'tickets', // Service tickets
                'alarms', // System alarms
                'patches', // Patch management
                'software', // Software inventory
                'networks', // Network monitoring
                'users', // VSA users
                'policies', // Agent policies
                'reports', // System reports
                'audits' // Audit logs
            ],
            supportsIncrementalSync: true,
            supportsRealTimeSync: false,
            maxBatchSize: 500,
            rateLimits: {
                requestsPerSecond: 5,
                requestsPerHour: 18000
            },
            authenticationTypes: ['oauth2', 'api_key'],
            apiVersion: '1.0'
        };
    }
    async getAvailableEntities() {
        return this.getCapabilities().supportedEntities;
    }
    async getEntitySchema(entityType) {
        const schemas = {
            organizations: {
                name: 'organizations',
                fields: [
                    { name: 'OrgId', type: 'string', required: true },
                    { name: 'OrgName', type: 'string', required: true, maxLength: 100 },
                    { name: 'OrgRef', type: 'string', required: false, maxLength: 50 },
                    { name: 'ParentOrgId', type: 'string', required: false },
                    { name: 'Website', type: 'string', required: false, format: 'url' },
                    { name: 'Phone', type: 'string', required: false, format: 'phone' },
                    { name: 'Email', type: 'string', required: false, format: 'email' },
                    { name: 'Address', type: 'string', required: false },
                    { name: 'City', type: 'string', required: false, maxLength: 50 },
                    { name: 'State', type: 'string', required: false, maxLength: 50 },
                    { name: 'Zip', type: 'string', required: false, maxLength: 20 },
                    { name: 'Country', type: 'string', required: false, maxLength: 50 },
                    { name: 'Created', type: 'string', required: false, format: 'datetime' },
                    { name: 'Modified', type: 'string', required: false, format: 'datetime' }
                ],
                relationships: [],
                constraints: ['OrgName must be unique']
            },
            machines: {
                name: 'machines',
                fields: [
                    { name: 'AgentGuid', type: 'string', required: true },
                    { name: 'MachineId', type: 'string', required: true },
                    { name: 'MachineName', type: 'string', required: true, maxLength: 100 },
                    { name: 'OrgId', type: 'string', required: true },
                    { name: 'GroupId', type: 'string', required: false },
                    { name: 'OSName', type: 'string', required: false },
                    { name: 'OSVersion', type: 'string', required: false },
                    { name: 'OSType', type: 'string', required: false },
                    { name: 'Architecture', type: 'string', required: false },
                    { name: 'IPAddress', type: 'string', required: false },
                    { name: 'MacAddress', type: 'string', required: false },
                    { name: 'Domain', type: 'string', required: false },
                    { name: 'LastSeen', type: 'string', required: false, format: 'datetime' },
                    { name: 'OnlineStatus', type: 'boolean', required: false },
                    { name: 'AgentVersion', type: 'string', required: false },
                    { name: 'Created', type: 'string', required: false, format: 'datetime' },
                    { name: 'Modified', type: 'string', required: false, format: 'datetime' }
                ],
                relationships: [
                    {
                        name: 'organization',
                        type: 'many-to-one',
                        targetEntity: 'organizations',
                        foreignKey: 'OrgId',
                        required: true
                    }
                ],
                constraints: ['AgentGuid must be unique', 'MachineId must be unique']
            },
            tickets: {
                name: 'tickets',
                fields: [
                    { name: 'TicketId', type: 'string', required: true },
                    { name: 'TicketNumber', type: 'string', required: true },
                    { name: 'Subject', type: 'string', required: true, maxLength: 200 },
                    { name: 'Description', type: 'string', required: false },
                    { name: 'Status', type: 'string', required: true },
                    { name: 'Priority', type: 'string', required: false },
                    { name: 'Category', type: 'string', required: false },
                    { name: 'Subcategory', type: 'string', required: false },
                    { name: 'OrgId', type: 'string', required: true },
                    { name: 'MachineId', type: 'string', required: false },
                    { name: 'AssignedTo', type: 'string', required: false },
                    { name: 'CreatedBy', type: 'string', required: false },
                    { name: 'CreatedDate', type: 'string', required: true, format: 'datetime' },
                    { name: 'ModifiedDate', type: 'string', required: false, format: 'datetime' },
                    { name: 'ClosedDate', type: 'string', required: false, format: 'datetime' },
                    { name: 'DueDate', type: 'string', required: false, format: 'datetime' },
                    { name: 'Resolution', type: 'string', required: false },
                    { name: 'TimeLogged', type: 'number', required: false },
                    { name: 'EstimatedTime', type: 'number', required: false }
                ],
                relationships: [
                    {
                        name: 'organization',
                        type: 'many-to-one',
                        targetEntity: 'organizations',
                        foreignKey: 'OrgId',
                        required: true
                    },
                    {
                        name: 'machine',
                        type: 'many-to-one',
                        targetEntity: 'machines',
                        foreignKey: 'MachineId',
                        required: false
                    }
                ],
                constraints: ['TicketNumber must be unique']
            },
            alarms: {
                name: 'alarms',
                fields: [
                    { name: 'AlarmId', type: 'string', required: true },
                    { name: 'AlarmName', type: 'string', required: true },
                    { name: 'AlarmType', type: 'string', required: true },
                    { name: 'Severity', type: 'string', required: true },
                    { name: 'Status', type: 'string', required: true },
                    { name: 'OrgId', type: 'string', required: true },
                    { name: 'MachineId', type: 'string', required: false },
                    { name: 'Message', type: 'string', required: false },
                    { name: 'Details', type: 'string', required: false },
                    { name: 'FirstOccurred', type: 'string', required: false, format: 'datetime' },
                    { name: 'LastOccurred', type: 'string', required: false, format: 'datetime' },
                    { name: 'Acknowledged', type: 'boolean', required: false },
                    { name: 'AcknowledgedBy', type: 'string', required: false },
                    { name: 'AcknowledgedDate', type: 'string', required: false, format: 'datetime' },
                    { name: 'Resolved', type: 'boolean', required: false },
                    { name: 'ResolvedDate', type: 'string', required: false, format: 'datetime' }
                ],
                relationships: [
                    {
                        name: 'organization',
                        type: 'many-to-one',
                        targetEntity: 'organizations',
                        foreignKey: 'OrgId',
                        required: true
                    },
                    {
                        name: 'machine',
                        type: 'many-to-one',
                        targetEntity: 'machines',
                        foreignKey: 'MachineId',
                        required: false
                    }
                ],
                constraints: []
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
            await this.ensureAuthenticated();
            const endpoint = this.getEndpoint(entityType);
            const params = {
                $count: true,
                $top: 0
            };
            if (filters) {
                params.$filter = this.buildFilter(filters);
            }
            const response = await this.apiClient.get(endpoint, { params });
            return response.data['@odata.count'] || 0;
        }
        catch (error) {
            this.logger.error('Failed to get record count', { entityType, error });
            throw error;
        }
    }
    async fetchBatch(entityType, offset, limit, options) {
        try {
            await this.ensureAuthenticated();
            await this.checkRateLimit();
            const endpoint = this.getEndpoint(entityType);
            const params = {
                $skip: offset,
                $top: Math.min(limit, 500)
            };
            if (options?.fields && options.fields.length > 0) {
                params.$select = options.fields.join(',');
            }
            if (options?.filters) {
                params.$filter = this.buildFilter(options.filters);
            }
            if (options?.sorting && options.sorting.length > 0) {
                params.$orderby = options.sorting
                    .map(s => `${s.field} ${s.direction}`)
                    .join(',');
            }
            if (options?.modifiedSince) {
                const dateFilter = `Modified gt ${options.modifiedSince.toISOString()}`;
                params.$filter = params.$filter
                    ? `(${params.$filter}) and ${dateFilter}`
                    : dateFilter;
            }
            const response = await this.apiClient.get(endpoint, { params });
            this.updateRateLimitFromHeaders(response);
            return this.transformRecords(entityType, response.data.value || []);
        }
        catch (error) {
            this.logger.error('Failed to fetch batch from Kaseya VSA', { entityType, offset, limit, error });
            throw error;
        }
    }
    async authenticate() {
        const { username, password, clientId, clientSecret } = this.config.credentials;
        try {
            if (clientId && clientSecret) {
                // OAuth2 authentication
                const authResponse = await axios_1.default.post(`${this.config.baseUrl}/oauth/token`, {
                    grant_type: 'client_credentials',
                    client_id: clientId,
                    client_secret: clientSecret,
                    username,
                    password
                }, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                });
                this.accessToken = authResponse.data.access_token;
                this.tokenExpiry = new Date(Date.now() + (authResponse.data.expires_in * 1000));
            }
            else if (username && password) {
                // Basic authentication fallback
                const auth = Buffer.from(`${username}:${password}`).toString('base64');
                this.apiClient.defaults.headers.common['Authorization'] = `Basic ${auth}`;
            }
        }
        catch (error) {
            this.logger.error('Kaseya VSA authentication failed', error);
            throw error;
        }
    }
    async ensureAuthenticated() {
        if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
            this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${this.accessToken}`;
            return;
        }
        if (this.accessToken) {
            // Token expired, re-authenticate
            await this.authenticate();
        }
    }
    getEndpoint(entityType) {
        const endpointMap = {
            'organizations': '/system/orgs',
            'machines': '/assetmgmt/assets',
            'agents': '/system/agents',
            'tickets': '/automation/tickets',
            'alarms': '/monitoring/alarms',
            'patches': '/patchmgmt/patches',
            'software': '/assetmgmt/software',
            'networks': '/monitoring/networks',
            'users': '/system/users',
            'policies': '/system/policies',
            'reports': '/reporting/reports',
            'audits': '/system/audits'
        };
        const endpoint = endpointMap[entityType];
        if (!endpoint) {
            throw new Error(`Unsupported entity type: ${entityType}`);
        }
        return endpoint;
    }
    buildFilter(filters) {
        const conditions = [];
        for (const [field, value] of Object.entries(filters)) {
            if (value != null) {
                if (typeof value === 'string') {
                    conditions.push(`${field} eq '${value}'`);
                }
                else if (typeof value === 'number') {
                    conditions.push(`${field} eq ${value}`);
                }
                else if (typeof value === 'boolean') {
                    conditions.push(`${field} eq ${value}`);
                }
                else if (Array.isArray(value)) {
                    const orConditions = value.map(v => `${field} eq '${v}'`).join(' or ');
                    conditions.push(`(${orConditions})`);
                }
            }
        }
        return conditions.join(' and ');
    }
    transformRecords(entityType, records) {
        return records.map(record => {
            const transformed = {};
            // Copy all fields with proper naming
            for (const [key, value] of Object.entries(record)) {
                transformed[key] = this.transformFieldValue(key, value);
            }
            // Add metadata
            transformed._source_id = record.AgentGuid || record.MachineId || record.TicketId || record.AlarmId;
            transformed._source_updated = record.Modified || record.ModifiedDate;
            transformed._entity_type = entityType;
            return transformed;
        });
    }
    transformFieldValue(fieldName, value) {
        if (value === null || value === undefined || value === '') {
            return null;
        }
        // Handle date fields
        if (fieldName.includes('Date') || fieldName.includes('Created') || fieldName.includes('Modified')) {
            const date = new Date(value);
            return isNaN(date.getTime()) ? value : date.toISOString();
        }
        // Handle boolean fields
        if (typeof value === 'string' && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) {
            return value.toLowerCase() === 'true';
        }
        return value;
    }
    updateRateLimitFromHeaders(response) {
        // Kaseya VSA may not provide rate limit headers
        // Use conservative estimates
        this.updateRateLimit(100, new Date(Date.now() + 60000));
    }
}
exports.KaseyaVSAConnector = KaseyaVSAConnector;
//# sourceMappingURL=KaseyaVSAConnector.js.map