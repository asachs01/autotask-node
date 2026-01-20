"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Phases = void 0;
const base_1 = require("./base");
/**
 * Phases entity class for Autotask API
 *
 * Project and task phases
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: lookup
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PhasesEntity.htm}
 */
class Phases extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/Phases';
    }
    static getMetadata() {
        return [
            {
                operation: 'createPhases',
                requiredParams: ['phases'],
                optionalParams: [],
                returnType: 'IPhases',
                endpoint: '/Phases',
            },
            {
                operation: 'getPhases',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IPhases',
                endpoint: '/Phases/{id}',
            },
            {
                operation: 'updatePhases',
                requiredParams: ['id', 'phases'],
                optionalParams: [],
                returnType: 'IPhases',
                endpoint: '/Phases/{id}',
            },
            {
                operation: 'deletePhases',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/Phases/{id}',
            },
            {
                operation: 'listPhases',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IPhases[]',
                endpoint: '/Phases',
            }
        ];
    }
    /**
     * Create a new phases
     * @param phases - The phases data to create
     * @returns Promise with the created phases
     */
    async create(phases) {
        this.logger.info('Creating phases', { phases });
        return this.executeRequest(async () => this.axios.post(this.endpoint, phases), this.endpoint, 'POST');
    }
    /**
     * Get a phases by ID
     * @param id - The phases ID
     * @returns Promise with the phases data
     */
    async get(id) {
        this.logger.info('Getting phases', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a phases
     * @param id - The phases ID
     * @param phases - The updated phases data
     * @returns Promise with the updated phases
     */
    async update(id, phases) {
        this.logger.info('Updating phases', { id, phases });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, phases), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a phases
     * @param id - The phases ID
     * @param phases - The partial phases data to update
     * @returns Promise with the updated phases
     */
    async patch(id, phases) {
        this.logger.info('Patching phases', { id, phases });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, phases), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a phases
     * @param id - The phases ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting phases', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List phases with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of phases
     */
    async list(query = {}) {
        this.logger.info('Listing phases', { query });
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
exports.Phases = Phases;
//# sourceMappingURL=phases.js.map