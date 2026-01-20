"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecklistLibraries = void 0;
const base_1 = require("./base");
/**
 * ChecklistLibraries entity class for Autotask API
 *
 * Libraries of reusable checklists
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: checklists
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ChecklistLibrariesEntity.htm}
 */
class ChecklistLibraries extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ChecklistLibraries';
    }
    static getMetadata() {
        return [
            {
                operation: 'createChecklistLibraries',
                requiredParams: ['checklistLibraries'],
                optionalParams: [],
                returnType: 'IChecklistLibraries',
                endpoint: '/ChecklistLibraries',
            },
            {
                operation: 'getChecklistLibraries',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IChecklistLibraries',
                endpoint: '/ChecklistLibraries/{id}',
            },
            {
                operation: 'updateChecklistLibraries',
                requiredParams: ['id', 'checklistLibraries'],
                optionalParams: [],
                returnType: 'IChecklistLibraries',
                endpoint: '/ChecklistLibraries/{id}',
            },
            {
                operation: 'deleteChecklistLibraries',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ChecklistLibraries/{id}',
            },
            {
                operation: 'listChecklistLibraries',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IChecklistLibraries[]',
                endpoint: '/ChecklistLibraries',
            }
        ];
    }
    /**
     * Create a new checklistlibraries
     * @param checklistLibraries - The checklistlibraries data to create
     * @returns Promise with the created checklistlibraries
     */
    async create(checklistLibraries) {
        this.logger.info('Creating checklistlibraries', { checklistLibraries });
        return this.executeRequest(async () => this.axios.post(this.endpoint, checklistLibraries), this.endpoint, 'POST');
    }
    /**
     * Get a checklistlibraries by ID
     * @param id - The checklistlibraries ID
     * @returns Promise with the checklistlibraries data
     */
    async get(id) {
        this.logger.info('Getting checklistlibraries', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a checklistlibraries
     * @param id - The checklistlibraries ID
     * @param checklistLibraries - The updated checklistlibraries data
     * @returns Promise with the updated checklistlibraries
     */
    async update(id, checklistLibraries) {
        this.logger.info('Updating checklistlibraries', { id, checklistLibraries });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, checklistLibraries), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a checklistlibraries
     * @param id - The checklistlibraries ID
     * @param checklistLibraries - The partial checklistlibraries data to update
     * @returns Promise with the updated checklistlibraries
     */
    async patch(id, checklistLibraries) {
        this.logger.info('Patching checklistlibraries', { id, checklistLibraries });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, checklistLibraries), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a checklistlibraries
     * @param id - The checklistlibraries ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting checklistlibraries', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List checklistlibraries with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of checklistlibraries
     */
    async list(query = {}) {
        this.logger.info('Listing checklistlibraries', { query });
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
exports.ChecklistLibraries = ChecklistLibraries;
//# sourceMappingURL=checklistlibraries.js.map