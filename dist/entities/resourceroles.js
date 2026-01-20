"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceRoles = void 0;
const base_1 = require("./base");
/**
 * ResourceRoles entity class for Autotask API
 *
 * Role assignments for resources
 * Supported Operations: GET, POST, DELETE
 * Category: lookup
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourceRolesEntity.htm}
 */
class ResourceRoles extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ResourceRoles';
    }
    static getMetadata() {
        return [
            {
                operation: 'createResourceRoles',
                requiredParams: ['resourceRoles'],
                optionalParams: [],
                returnType: 'IResourceRoles',
                endpoint: '/ResourceRoles',
            },
            {
                operation: 'getResourceRoles',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IResourceRoles',
                endpoint: '/ResourceRoles/{id}',
            },
            {
                operation: 'deleteResourceRoles',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ResourceRoles/{id}',
            },
            {
                operation: 'listResourceRoles',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IResourceRoles[]',
                endpoint: '/ResourceRoles',
            }
        ];
    }
    /**
     * Create a new resourceroles
     * @param resourceRoles - The resourceroles data to create
     * @returns Promise with the created resourceroles
     */
    async create(resourceRoles) {
        this.logger.info('Creating resourceroles', { resourceRoles });
        return this.executeRequest(async () => this.axios.post(this.endpoint, resourceRoles), this.endpoint, 'POST');
    }
    /**
     * Get a resourceroles by ID
     * @param id - The resourceroles ID
     * @returns Promise with the resourceroles data
     */
    async get(id) {
        this.logger.info('Getting resourceroles', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a resourceroles
     * @param id - The resourceroles ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting resourceroles', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List resourceroles with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of resourceroles
     */
    async list(query = {}) {
        this.logger.info('Listing resourceroles', { query });
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
            searchBody.maxRecords = query.pageSize;
        return this.executeQueryRequest(async () => this.axios.post(`${this.endpoint}/query`, searchBody), `${this.endpoint}/query`, 'POST');
    }
}
exports.ResourceRoles = ResourceRoles;
//# sourceMappingURL=resourceroles.js.map