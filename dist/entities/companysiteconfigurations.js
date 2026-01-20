"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanySiteConfigurations = void 0;
const base_1 = require("./base");
/**
 * CompanySiteConfigurations entity class for Autotask API
 *
 * Site configurations for companies
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: organizational
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CompanySiteConfigurationsEntity.htm}
 */
class CompanySiteConfigurations extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/CompanySiteConfigurations';
    }
    static getMetadata() {
        return [
            {
                operation: 'createCompanySiteConfigurations',
                requiredParams: ['companySiteConfigurations'],
                optionalParams: [],
                returnType: 'ICompanySiteConfigurations',
                endpoint: '/CompanySiteConfigurations',
            },
            {
                operation: 'getCompanySiteConfigurations',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'ICompanySiteConfigurations',
                endpoint: '/CompanySiteConfigurations/{id}',
            },
            {
                operation: 'updateCompanySiteConfigurations',
                requiredParams: ['id', 'companySiteConfigurations'],
                optionalParams: [],
                returnType: 'ICompanySiteConfigurations',
                endpoint: '/CompanySiteConfigurations/{id}',
            },
            {
                operation: 'deleteCompanySiteConfigurations',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/CompanySiteConfigurations/{id}',
            },
            {
                operation: 'listCompanySiteConfigurations',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'ICompanySiteConfigurations[]',
                endpoint: '/CompanySiteConfigurations',
            }
        ];
    }
    /**
     * Create a new companysiteconfigurations
     * @param companySiteConfigurations - The companysiteconfigurations data to create
     * @returns Promise with the created companysiteconfigurations
     */
    async create(companySiteConfigurations) {
        this.logger.info('Creating companysiteconfigurations', { companySiteConfigurations });
        return this.executeRequest(async () => this.axios.post(this.endpoint, companySiteConfigurations), this.endpoint, 'POST');
    }
    /**
     * Get a companysiteconfigurations by ID
     * @param id - The companysiteconfigurations ID
     * @returns Promise with the companysiteconfigurations data
     */
    async get(id) {
        this.logger.info('Getting companysiteconfigurations', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a companysiteconfigurations
     * @param id - The companysiteconfigurations ID
     * @param companySiteConfigurations - The updated companysiteconfigurations data
     * @returns Promise with the updated companysiteconfigurations
     */
    async update(id, companySiteConfigurations) {
        this.logger.info('Updating companysiteconfigurations', { id, companySiteConfigurations });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, companySiteConfigurations), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a companysiteconfigurations
     * @param id - The companysiteconfigurations ID
     * @param companySiteConfigurations - The partial companysiteconfigurations data to update
     * @returns Promise with the updated companysiteconfigurations
     */
    async patch(id, companySiteConfigurations) {
        this.logger.info('Patching companysiteconfigurations', { id, companySiteConfigurations });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, companySiteConfigurations), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a companysiteconfigurations
     * @param id - The companysiteconfigurations ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting companysiteconfigurations', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List companysiteconfigurations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of companysiteconfigurations
     */
    async list(query = {}) {
        this.logger.info('Listing companysiteconfigurations', { query });
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
exports.CompanySiteConfigurations = CompanySiteConfigurations;
//# sourceMappingURL=companysiteconfigurations.js.map