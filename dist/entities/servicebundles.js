"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceBundles = void 0;
const base_1 = require("./base");
/**
 * ServiceBundles entity class for Autotask API
 *
 * Bundled service offerings
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ServiceBundlesEntity.htm}
 */
class ServiceBundles extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ServiceBundles';
    }
    static getMetadata() {
        return [
            {
                operation: 'createServiceBundles',
                requiredParams: ['serviceBundles'],
                optionalParams: [],
                returnType: 'IServiceBundles',
                endpoint: '/ServiceBundles',
            },
            {
                operation: 'getServiceBundles',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IServiceBundles',
                endpoint: '/ServiceBundles/{id}',
            },
            {
                operation: 'updateServiceBundles',
                requiredParams: ['id', 'serviceBundles'],
                optionalParams: [],
                returnType: 'IServiceBundles',
                endpoint: '/ServiceBundles/{id}',
            },
            {
                operation: 'listServiceBundles',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IServiceBundles[]',
                endpoint: '/ServiceBundles',
            }
        ];
    }
    /**
     * Create a new servicebundles
     * @param serviceBundles - The servicebundles data to create
     * @returns Promise with the created servicebundles
     */
    async create(serviceBundles) {
        this.logger.info('Creating servicebundles', { serviceBundles });
        return this.executeRequest(async () => this.axios.post(this.endpoint, serviceBundles), this.endpoint, 'POST');
    }
    /**
     * Get a servicebundles by ID
     * @param id - The servicebundles ID
     * @returns Promise with the servicebundles data
     */
    async get(id) {
        this.logger.info('Getting servicebundles', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a servicebundles
     * @param id - The servicebundles ID
     * @param serviceBundles - The updated servicebundles data
     * @returns Promise with the updated servicebundles
     */
    async update(id, serviceBundles) {
        this.logger.info('Updating servicebundles', { id, serviceBundles });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, serviceBundles), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a servicebundles
     * @param id - The servicebundles ID
     * @param serviceBundles - The partial servicebundles data to update
     * @returns Promise with the updated servicebundles
     */
    async patch(id, serviceBundles) {
        this.logger.info('Patching servicebundles', { id, serviceBundles });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, serviceBundles), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * List servicebundles with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of servicebundles
     */
    async list(query = {}) {
        this.logger.info('Listing servicebundles', { query });
        const searchBody = {};
        // Set up basic filter if none provided
        if (!query.filter || Object.keys(query.filter).length === 0) {
            searchBody.filter = [
                {
                    op: 'gte',
                    field: 'id',
                    value: 0,
                },
            ];
        }
        else {
            // Convert object filter to array format
            if (!Array.isArray(query.filter)) {
                const filterArray = [];
                for (const [field, value] of Object.entries(query.filter)) {
                    // Handle nested objects like { id: { gte: 0 } }
                    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                        // Extract operator and value from nested object
                        const [op, val] = Object.entries(value)[0];
                        filterArray.push({
                            op: op,
                            field: field,
                            value: val,
                        });
                    }
                    else {
                        filterArray.push({
                            op: 'eq',
                            field: field,
                            value: value,
                        });
                    }
                }
                searchBody.filter = filterArray;
            }
            else {
                searchBody.filter = query.filter;
            }
        }
        if (query.sort)
            searchBody.sort = query.sort;
        if (query.page)
            searchBody.page = query.page;
        if (query.pageSize)
            searchBody.MaxRecords = query.pageSize;
        return this.executeQueryRequest(async () => this.axios.post(`${this.endpoint}/query`, searchBody), `${this.endpoint}/query`, 'POST');
    }
}
exports.ServiceBundles = ServiceBundles;
//# sourceMappingURL=servicebundles.js.map