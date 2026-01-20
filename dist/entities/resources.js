"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resources = void 0;
const base_1 = require("./base");
/**
 * Resources entity class for Autotask API
 *
 * Human resources and staff members
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: core
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourcesEntity.htm}
 */
class Resources extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/Resources';
    }
    static getMetadata() {
        return [
            {
                operation: 'createResources',
                requiredParams: ['resources'],
                optionalParams: [],
                returnType: 'IResources',
                endpoint: '/Resources',
            },
            {
                operation: 'getResources',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IResources',
                endpoint: '/Resources/{id}',
            },
            {
                operation: 'updateResources',
                requiredParams: ['id', 'resources'],
                optionalParams: [],
                returnType: 'IResources',
                endpoint: '/Resources/{id}',
            },
            {
                operation: 'listResources',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IResources[]',
                endpoint: '/Resources',
            },
        ];
    }
    /**
     * Create a new resources
     * @param resources - The resources data to create
     * @returns Promise with the created resources
     */
    async create(resources) {
        this.logger.info('Creating resources', { resources });
        return this.executeRequest(async () => this.axios.post(this.endpoint, resources), this.endpoint, 'POST');
    }
    /**
     * Get a resources by ID
     * @param id - The resources ID
     * @returns Promise with the resources data
     */
    async get(id) {
        this.logger.info('Getting resources', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a resources
     * @param id - The resources ID
     * @param resources - The updated resources data
     * @returns Promise with the updated resources
     */
    async update(id, resources) {
        this.logger.info('Updating resources', { id, resources });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, resources), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a resources
     * @param id - The resources ID
     * @param resources - The partial resources data to update
     * @returns Promise with the updated resources
     */
    async patch(id, resources) {
        this.logger.info('Patching resources', { id, resources });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, resources), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * List resources with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of resources
     */
    async list(query = {}) {
        this.logger.info('Listing resources', { query });
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
exports.Resources = Resources;
//# sourceMappingURL=resources.js.map