"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyAttachments = void 0;
const base_1 = require("./base");
/**
 * CompanyAttachments entity class for Autotask API
 *
 * File attachments for companies
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CompanyAttachmentsEntity.htm}
 */
class CompanyAttachments extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/CompanyAttachments';
    }
    static getMetadata() {
        return [
            {
                operation: 'createCompanyAttachments',
                requiredParams: ['companyAttachments'],
                optionalParams: [],
                returnType: 'ICompanyAttachments',
                endpoint: '/CompanyAttachments',
            },
            {
                operation: 'getCompanyAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'ICompanyAttachments',
                endpoint: '/CompanyAttachments/{id}',
            },
            {
                operation: 'deleteCompanyAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/CompanyAttachments/{id}',
            },
            {
                operation: 'listCompanyAttachments',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'ICompanyAttachments[]',
                endpoint: '/CompanyAttachments',
            }
        ];
    }
    /**
     * Create a new companyattachments
     * @param companyAttachments - The companyattachments data to create
     * @returns Promise with the created companyattachments
     */
    async create(companyAttachments) {
        this.logger.info('Creating companyattachments', { companyAttachments });
        return this.executeRequest(async () => this.axios.post(this.endpoint, companyAttachments), this.endpoint, 'POST');
    }
    /**
     * Get a companyattachments by ID
     * @param id - The companyattachments ID
     * @returns Promise with the companyattachments data
     */
    async get(id) {
        this.logger.info('Getting companyattachments', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a companyattachments
     * @param id - The companyattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting companyattachments', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List companyattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of companyattachments
     */
    async list(query = {}) {
        this.logger.info('Listing companyattachments', { query });
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
exports.CompanyAttachments = CompanyAttachments;
//# sourceMappingURL=companyattachments.js.map