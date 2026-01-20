"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceTimeOffApprovers = void 0;
const base_1 = require("./base");
/**
 * ResourceTimeOffApprovers entity class for Autotask API
 *
 * Approvers for resource time off requests
 * Supported Operations: GET, POST, DELETE
 * Category: time
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourceTimeOffApproversEntity.htm}
 */
class ResourceTimeOffApprovers extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ResourceTimeOffApprovers';
    }
    static getMetadata() {
        return [
            {
                operation: 'createResourceTimeOffApprovers',
                requiredParams: ['resourceTimeOffApprovers'],
                optionalParams: [],
                returnType: 'IResourceTimeOffApprovers',
                endpoint: '/ResourceTimeOffApprovers',
            },
            {
                operation: 'getResourceTimeOffApprovers',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IResourceTimeOffApprovers',
                endpoint: '/ResourceTimeOffApprovers/{id}',
            },
            {
                operation: 'deleteResourceTimeOffApprovers',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ResourceTimeOffApprovers/{id}',
            },
            {
                operation: 'listResourceTimeOffApprovers',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IResourceTimeOffApprovers[]',
                endpoint: '/ResourceTimeOffApprovers',
            }
        ];
    }
    /**
     * Create a new resourcetimeoffapprovers
     * @param resourceTimeOffApprovers - The resourcetimeoffapprovers data to create
     * @returns Promise with the created resourcetimeoffapprovers
     */
    async create(resourceTimeOffApprovers) {
        this.logger.info('Creating resourcetimeoffapprovers', { resourceTimeOffApprovers });
        return this.executeRequest(async () => this.axios.post(this.endpoint, resourceTimeOffApprovers), this.endpoint, 'POST');
    }
    /**
     * Get a resourcetimeoffapprovers by ID
     * @param id - The resourcetimeoffapprovers ID
     * @returns Promise with the resourcetimeoffapprovers data
     */
    async get(id) {
        this.logger.info('Getting resourcetimeoffapprovers', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a resourcetimeoffapprovers
     * @param id - The resourcetimeoffapprovers ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting resourcetimeoffapprovers', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List resourcetimeoffapprovers with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of resourcetimeoffapprovers
     */
    async list(query = {}) {
        this.logger.info('Listing resourcetimeoffapprovers', { query });
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
exports.ResourceTimeOffApprovers = ResourceTimeOffApprovers;
//# sourceMappingURL=resourcetimeoffapprovers.js.map