"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Services = void 0;
const base_1 = require("./base");
/**
 * Services entity class for Autotask API
 *
 * Individual services offered
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ServicesEntity.htm}
 */
class Services extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/Services';
    }
    static getMetadata() {
        return [
            {
                operation: 'createServices',
                requiredParams: ['services'],
                optionalParams: [],
                returnType: 'IServices',
                endpoint: '/Services',
            },
            {
                operation: 'getServices',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IServices',
                endpoint: '/Services/{id}',
            },
            {
                operation: 'updateServices',
                requiredParams: ['id', 'services'],
                optionalParams: [],
                returnType: 'IServices',
                endpoint: '/Services/{id}',
            },
            {
                operation: 'listServices',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IServices[]',
                endpoint: '/Services',
            }
        ];
    }
    /**
     * Create a new services
     * @param services - The services data to create
     * @returns Promise with the created services
     */
    async create(services) {
        this.logger.info('Creating services', { services });
        return this.executeRequest(async () => this.axios.post(this.endpoint, services), this.endpoint, 'POST');
    }
    /**
     * Get a services by ID
     * @param id - The services ID
     * @returns Promise with the services data
     */
    async get(id) {
        this.logger.info('Getting services', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a services
     * @param id - The services ID
     * @param services - The updated services data
     * @returns Promise with the updated services
     */
    async update(id, services) {
        this.logger.info('Updating services', { id, services });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, services), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a services
     * @param id - The services ID
     * @param services - The partial services data to update
     * @returns Promise with the updated services
     */
    async patch(id, services) {
        this.logger.info('Patching services', { id, services });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, services), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * List services with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of services
     */
    async list(query = {}) {
        this.logger.info('Listing services', { query });
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
exports.Services = Services;
//# sourceMappingURL=services.js.map