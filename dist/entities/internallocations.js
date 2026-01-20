"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalLocations = void 0;
const base_1 = require("./base");
/**
 * InternalLocations entity class for Autotask API
 *
 * Internal office locations
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: organizational
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InternalLocationsEntity.htm}
 */
class InternalLocations extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/InternalLocations';
    }
    static getMetadata() {
        return [
            {
                operation: 'createInternalLocations',
                requiredParams: ['internalLocations'],
                optionalParams: [],
                returnType: 'IInternalLocations',
                endpoint: '/InternalLocations',
            },
            {
                operation: 'getInternalLocations',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IInternalLocations',
                endpoint: '/InternalLocations/{id}',
            },
            {
                operation: 'updateInternalLocations',
                requiredParams: ['id', 'internalLocations'],
                optionalParams: [],
                returnType: 'IInternalLocations',
                endpoint: '/InternalLocations/{id}',
            },
            {
                operation: 'deleteInternalLocations',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/InternalLocations/{id}',
            },
            {
                operation: 'listInternalLocations',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IInternalLocations[]',
                endpoint: '/InternalLocations',
            }
        ];
    }
    /**
     * Create a new internallocations
     * @param internalLocations - The internallocations data to create
     * @returns Promise with the created internallocations
     */
    async create(internalLocations) {
        this.logger.info('Creating internallocations', { internalLocations });
        return this.executeRequest(async () => this.axios.post(this.endpoint, internalLocations), this.endpoint, 'POST');
    }
    /**
     * Get a internallocations by ID
     * @param id - The internallocations ID
     * @returns Promise with the internallocations data
     */
    async get(id) {
        this.logger.info('Getting internallocations', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a internallocations
     * @param id - The internallocations ID
     * @param internalLocations - The updated internallocations data
     * @returns Promise with the updated internallocations
     */
    async update(id, internalLocations) {
        this.logger.info('Updating internallocations', { id, internalLocations });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, internalLocations), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a internallocations
     * @param id - The internallocations ID
     * @param internalLocations - The partial internallocations data to update
     * @returns Promise with the updated internallocations
     */
    async patch(id, internalLocations) {
        this.logger.info('Patching internallocations', { id, internalLocations });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, internalLocations), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a internallocations
     * @param id - The internallocations ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting internallocations', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List internallocations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of internallocations
     */
    async list(query = {}) {
        this.logger.info('Listing internallocations', { query });
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
exports.InternalLocations = InternalLocations;
//# sourceMappingURL=internallocations.js.map