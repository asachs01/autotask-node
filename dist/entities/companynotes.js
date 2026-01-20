"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyNotes = void 0;
const base_1 = require("./base");
/**
 * CompanyNotes entity class for Autotask API
 *
 * Notes associated with companies
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CompanyNotesEntity.htm}
 */
class CompanyNotes extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/CompanyNotes';
    }
    static getMetadata() {
        return [
            {
                operation: 'createCompanyNotes',
                requiredParams: ['companyNotes'],
                optionalParams: [],
                returnType: 'ICompanyNotes',
                endpoint: '/CompanyNotes',
            },
            {
                operation: 'getCompanyNotes',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'ICompanyNotes',
                endpoint: '/CompanyNotes/{id}',
            },
            {
                operation: 'updateCompanyNotes',
                requiredParams: ['id', 'companyNotes'],
                optionalParams: [],
                returnType: 'ICompanyNotes',
                endpoint: '/CompanyNotes/{id}',
            },
            {
                operation: 'listCompanyNotes',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'ICompanyNotes[]',
                endpoint: '/CompanyNotes',
            }
        ];
    }
    /**
     * Create a new companynotes
     * @param companyNotes - The companynotes data to create
     * @returns Promise with the created companynotes
     */
    async create(companyNotes) {
        this.logger.info('Creating companynotes', { companyNotes });
        return this.executeRequest(async () => this.axios.post(this.endpoint, companyNotes), this.endpoint, 'POST');
    }
    /**
     * Get a companynotes by ID
     * @param id - The companynotes ID
     * @returns Promise with the companynotes data
     */
    async get(id) {
        this.logger.info('Getting companynotes', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a companynotes
     * @param id - The companynotes ID
     * @param companyNotes - The updated companynotes data
     * @returns Promise with the updated companynotes
     */
    async update(id, companyNotes) {
        this.logger.info('Updating companynotes', { id, companyNotes });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, companyNotes), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a companynotes
     * @param id - The companynotes ID
     * @param companyNotes - The partial companynotes data to update
     * @returns Promise with the updated companynotes
     */
    async patch(id, companyNotes) {
        this.logger.info('Patching companynotes', { id, companyNotes });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, companyNotes), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * List companynotes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of companynotes
     */
    async list(query = {}) {
        this.logger.info('Listing companynotes', { query });
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
exports.CompanyNotes = CompanyNotes;
//# sourceMappingURL=companynotes.js.map