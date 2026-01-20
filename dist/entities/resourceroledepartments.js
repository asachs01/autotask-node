"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceRoleDepartments = void 0;
const base_1 = require("./base");
/**
 * ResourceRoleDepartments entity class for Autotask API
 *
 * Department assignments for resource roles
 * Supported Operations: GET, POST, DELETE
 * Category: lookup
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourceRoleDepartmentsEntity.htm}
 */
class ResourceRoleDepartments extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ResourceRoleDepartments';
    }
    static getMetadata() {
        return [
            {
                operation: 'createResourceRoleDepartments',
                requiredParams: ['resourceRoleDepartments'],
                optionalParams: [],
                returnType: 'IResourceRoleDepartments',
                endpoint: '/ResourceRoleDepartments',
            },
            {
                operation: 'getResourceRoleDepartments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IResourceRoleDepartments',
                endpoint: '/ResourceRoleDepartments/{id}',
            },
            {
                operation: 'deleteResourceRoleDepartments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ResourceRoleDepartments/{id}',
            },
            {
                operation: 'listResourceRoleDepartments',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IResourceRoleDepartments[]',
                endpoint: '/ResourceRoleDepartments',
            }
        ];
    }
    /**
     * Create a new resourceroledepartments
     * @param resourceRoleDepartments - The resourceroledepartments data to create
     * @returns Promise with the created resourceroledepartments
     */
    async create(resourceRoleDepartments) {
        this.logger.info('Creating resourceroledepartments', { resourceRoleDepartments });
        return this.executeRequest(async () => this.axios.post(this.endpoint, resourceRoleDepartments), this.endpoint, 'POST');
    }
    /**
     * Get a resourceroledepartments by ID
     * @param id - The resourceroledepartments ID
     * @returns Promise with the resourceroledepartments data
     */
    async get(id) {
        this.logger.info('Getting resourceroledepartments', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a resourceroledepartments
     * @param id - The resourceroledepartments ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting resourceroledepartments', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List resourceroledepartments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of resourceroledepartments
     */
    async list(query = {}) {
        this.logger.info('Listing resourceroledepartments', { query });
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
exports.ResourceRoleDepartments = ResourceRoleDepartments;
//# sourceMappingURL=resourceroledepartments.js.map