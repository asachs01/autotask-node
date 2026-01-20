"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyTeams = void 0;
const base_1 = require("./base");
/**
 * CompanyTeams entity class for Autotask API
 *
 * Teams associated with companies
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: organizational
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CompanyTeamsEntity.htm}
 */
class CompanyTeams extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/CompanyTeams';
    }
    static getMetadata() {
        return [
            {
                operation: 'createCompanyTeams',
                requiredParams: ['companyTeams'],
                optionalParams: [],
                returnType: 'ICompanyTeams',
                endpoint: '/CompanyTeams',
            },
            {
                operation: 'getCompanyTeams',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'ICompanyTeams',
                endpoint: '/CompanyTeams/{id}',
            },
            {
                operation: 'updateCompanyTeams',
                requiredParams: ['id', 'companyTeams'],
                optionalParams: [],
                returnType: 'ICompanyTeams',
                endpoint: '/CompanyTeams/{id}',
            },
            {
                operation: 'deleteCompanyTeams',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/CompanyTeams/{id}',
            },
            {
                operation: 'listCompanyTeams',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'ICompanyTeams[]',
                endpoint: '/CompanyTeams',
            }
        ];
    }
    /**
     * Create a new companyteams
     * @param companyTeams - The companyteams data to create
     * @returns Promise with the created companyteams
     */
    async create(companyTeams) {
        this.logger.info('Creating companyteams', { companyTeams });
        return this.executeRequest(async () => this.axios.post(this.endpoint, companyTeams), this.endpoint, 'POST');
    }
    /**
     * Get a companyteams by ID
     * @param id - The companyteams ID
     * @returns Promise with the companyteams data
     */
    async get(id) {
        this.logger.info('Getting companyteams', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a companyteams
     * @param id - The companyteams ID
     * @param companyTeams - The updated companyteams data
     * @returns Promise with the updated companyteams
     */
    async update(id, companyTeams) {
        this.logger.info('Updating companyteams', { id, companyTeams });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, companyTeams), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a companyteams
     * @param id - The companyteams ID
     * @param companyTeams - The partial companyteams data to update
     * @returns Promise with the updated companyteams
     */
    async patch(id, companyTeams) {
        this.logger.info('Patching companyteams', { id, companyTeams });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, companyTeams), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a companyteams
     * @param id - The companyteams ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting companyteams', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List companyteams with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of companyteams
     */
    async list(query = {}) {
        this.logger.info('Listing companyteams', { query });
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
exports.CompanyTeams = CompanyTeams;
//# sourceMappingURL=companyteams.js.map