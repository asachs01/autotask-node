"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComanagedAssociations = void 0;
const base_1 = require("./base");
/**
 * ComanagedAssociations entity class for Autotask API
 *
 * Co-managed service associations
 * Supported Operations: GET, POST, DELETE
 * Category: associations
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ComanagedAssociationsEntity.htm}
 */
class ComanagedAssociations extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ComanagedAssociations';
    }
    static getMetadata() {
        return [
            {
                operation: 'createComanagedAssociations',
                requiredParams: ['comanagedAssociations'],
                optionalParams: [],
                returnType: 'IComanagedAssociations',
                endpoint: '/ComanagedAssociations',
            },
            {
                operation: 'getComanagedAssociations',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IComanagedAssociations',
                endpoint: '/ComanagedAssociations/{id}',
            },
            {
                operation: 'deleteComanagedAssociations',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ComanagedAssociations/{id}',
            },
            {
                operation: 'listComanagedAssociations',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IComanagedAssociations[]',
                endpoint: '/ComanagedAssociations',
            }
        ];
    }
    /**
     * Create a new comanagedassociations
     * @param comanagedAssociations - The comanagedassociations data to create
     * @returns Promise with the created comanagedassociations
     */
    async create(comanagedAssociations) {
        this.logger.info('Creating comanagedassociations', { comanagedAssociations });
        return this.executeRequest(async () => this.axios.post(this.endpoint, comanagedAssociations), this.endpoint, 'POST');
    }
    /**
     * Get a comanagedassociations by ID
     * @param id - The comanagedassociations ID
     * @returns Promise with the comanagedassociations data
     */
    async get(id) {
        this.logger.info('Getting comanagedassociations', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a comanagedassociations
     * @param id - The comanagedassociations ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting comanagedassociations', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List comanagedassociations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of comanagedassociations
     */
    async list(query = {}) {
        this.logger.info('Listing comanagedassociations', { query });
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
exports.ComanagedAssociations = ComanagedAssociations;
//# sourceMappingURL=comanagedassociations.js.map