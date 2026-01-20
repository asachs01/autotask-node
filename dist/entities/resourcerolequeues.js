"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceRoleQueues = void 0;
const base_1 = require("./base");
/**
 * ResourceRoleQueues entity class for Autotask API
 *
 * Queue assignments for resource roles
 * Supported Operations: GET, POST, DELETE
 * Category: lookup
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourceRoleQueuesEntity.htm}
 */
class ResourceRoleQueues extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ResourceRoleQueues';
    }
    static getMetadata() {
        return [
            {
                operation: 'createResourceRoleQueues',
                requiredParams: ['resourceRoleQueues'],
                optionalParams: [],
                returnType: 'IResourceRoleQueues',
                endpoint: '/ResourceRoleQueues',
            },
            {
                operation: 'getResourceRoleQueues',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IResourceRoleQueues',
                endpoint: '/ResourceRoleQueues/{id}',
            },
            {
                operation: 'deleteResourceRoleQueues',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ResourceRoleQueues/{id}',
            },
            {
                operation: 'listResourceRoleQueues',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IResourceRoleQueues[]',
                endpoint: '/ResourceRoleQueues',
            }
        ];
    }
    /**
     * Create a new resourcerolequeues
     * @param resourceRoleQueues - The resourcerolequeues data to create
     * @returns Promise with the created resourcerolequeues
     */
    async create(resourceRoleQueues) {
        this.logger.info('Creating resourcerolequeues', { resourceRoleQueues });
        return this.executeRequest(async () => this.axios.post(this.endpoint, resourceRoleQueues), this.endpoint, 'POST');
    }
    /**
     * Get a resourcerolequeues by ID
     * @param id - The resourcerolequeues ID
     * @returns Promise with the resourcerolequeues data
     */
    async get(id) {
        this.logger.info('Getting resourcerolequeues', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a resourcerolequeues
     * @param id - The resourcerolequeues ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting resourcerolequeues', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List resourcerolequeues with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of resourcerolequeues
     */
    async list(query = {}) {
        this.logger.info('Listing resourcerolequeues', { query });
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
exports.ResourceRoleQueues = ResourceRoleQueues;
//# sourceMappingURL=resourcerolequeues.js.map