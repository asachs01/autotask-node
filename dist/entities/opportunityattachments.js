"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpportunityAttachments = void 0;
const base_1 = require("./base");
/**
 * OpportunityAttachments entity class for Autotask API
 *
 * File attachments for opportunities
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/OpportunityAttachmentsEntity.htm}
 */
class OpportunityAttachments extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/OpportunityAttachments';
    }
    static getMetadata() {
        return [
            {
                operation: 'createOpportunityAttachments',
                requiredParams: ['opportunityAttachments'],
                optionalParams: [],
                returnType: 'IOpportunityAttachments',
                endpoint: '/OpportunityAttachments',
            },
            {
                operation: 'getOpportunityAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IOpportunityAttachments',
                endpoint: '/OpportunityAttachments/{id}',
            },
            {
                operation: 'deleteOpportunityAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/OpportunityAttachments/{id}',
            },
            {
                operation: 'listOpportunityAttachments',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IOpportunityAttachments[]',
                endpoint: '/OpportunityAttachments',
            }
        ];
    }
    /**
     * Create a new opportunityattachments
     * @param opportunityAttachments - The opportunityattachments data to create
     * @returns Promise with the created opportunityattachments
     */
    async create(opportunityAttachments) {
        this.logger.info('Creating opportunityattachments', { opportunityAttachments });
        return this.executeRequest(async () => this.axios.post(this.endpoint, opportunityAttachments), this.endpoint, 'POST');
    }
    /**
     * Get a opportunityattachments by ID
     * @param id - The opportunityattachments ID
     * @returns Promise with the opportunityattachments data
     */
    async get(id) {
        this.logger.info('Getting opportunityattachments', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a opportunityattachments
     * @param id - The opportunityattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting opportunityattachments', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List opportunityattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of opportunityattachments
     */
    async list(query = {}) {
        this.logger.info('Listing opportunityattachments', { query });
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
exports.OpportunityAttachments = OpportunityAttachments;
//# sourceMappingURL=opportunityattachments.js.map