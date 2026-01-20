"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceTimeOffAdditional = void 0;
const base_1 = require("./base");
/**
 * ResourceTimeOffAdditional entity class for Autotask API
 *
 * Additional time off information for resources
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: time
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourceTimeOffAdditionalEntity.htm}
 */
class ResourceTimeOffAdditional extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ResourceTimeOffAdditional';
    }
    static getMetadata() {
        return [
            {
                operation: 'createResourceTimeOffAdditional',
                requiredParams: ['resourceTimeOffAdditional'],
                optionalParams: [],
                returnType: 'IResourceTimeOffAdditional',
                endpoint: '/ResourceTimeOffAdditional',
            },
            {
                operation: 'getResourceTimeOffAdditional',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IResourceTimeOffAdditional',
                endpoint: '/ResourceTimeOffAdditional/{id}',
            },
            {
                operation: 'updateResourceTimeOffAdditional',
                requiredParams: ['id', 'resourceTimeOffAdditional'],
                optionalParams: [],
                returnType: 'IResourceTimeOffAdditional',
                endpoint: '/ResourceTimeOffAdditional/{id}',
            },
            {
                operation: 'deleteResourceTimeOffAdditional',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ResourceTimeOffAdditional/{id}',
            },
            {
                operation: 'listResourceTimeOffAdditional',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IResourceTimeOffAdditional[]',
                endpoint: '/ResourceTimeOffAdditional',
            }
        ];
    }
    /**
     * Create a new resourcetimeoffadditional
     * @param resourceTimeOffAdditional - The resourcetimeoffadditional data to create
     * @returns Promise with the created resourcetimeoffadditional
     */
    async create(resourceTimeOffAdditional) {
        this.logger.info('Creating resourcetimeoffadditional', { resourceTimeOffAdditional });
        return this.executeRequest(async () => this.axios.post(this.endpoint, resourceTimeOffAdditional), this.endpoint, 'POST');
    }
    /**
     * Get a resourcetimeoffadditional by ID
     * @param id - The resourcetimeoffadditional ID
     * @returns Promise with the resourcetimeoffadditional data
     */
    async get(id) {
        this.logger.info('Getting resourcetimeoffadditional', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a resourcetimeoffadditional
     * @param id - The resourcetimeoffadditional ID
     * @param resourceTimeOffAdditional - The updated resourcetimeoffadditional data
     * @returns Promise with the updated resourcetimeoffadditional
     */
    async update(id, resourceTimeOffAdditional) {
        this.logger.info('Updating resourcetimeoffadditional', { id, resourceTimeOffAdditional });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, resourceTimeOffAdditional), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a resourcetimeoffadditional
     * @param id - The resourcetimeoffadditional ID
     * @param resourceTimeOffAdditional - The partial resourcetimeoffadditional data to update
     * @returns Promise with the updated resourcetimeoffadditional
     */
    async patch(id, resourceTimeOffAdditional) {
        this.logger.info('Patching resourcetimeoffadditional', { id, resourceTimeOffAdditional });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, resourceTimeOffAdditional), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a resourcetimeoffadditional
     * @param id - The resourcetimeoffadditional ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting resourcetimeoffadditional', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List resourcetimeoffadditional with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of resourcetimeoffadditional
     */
    async list(query = {}) {
        this.logger.info('Listing resourcetimeoffadditional', { query });
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
exports.ResourceTimeOffAdditional = ResourceTimeOffAdditional;
//# sourceMappingURL=resourcetimeoffadditional.js.map