"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesOrderAttachments = void 0;
const base_1 = require("./base");
/**
 * SalesOrderAttachments entity class for Autotask API
 *
 * File attachments for sales orders
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/SalesOrderAttachmentsEntity.htm}
 */
class SalesOrderAttachments extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/SalesOrderAttachments';
    }
    static getMetadata() {
        return [
            {
                operation: 'createSalesOrderAttachments',
                requiredParams: ['salesOrderAttachments'],
                optionalParams: [],
                returnType: 'ISalesOrderAttachments',
                endpoint: '/SalesOrderAttachments',
            },
            {
                operation: 'getSalesOrderAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'ISalesOrderAttachments',
                endpoint: '/SalesOrderAttachments/{id}',
            },
            {
                operation: 'deleteSalesOrderAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/SalesOrderAttachments/{id}',
            },
            {
                operation: 'listSalesOrderAttachments',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'ISalesOrderAttachments[]',
                endpoint: '/SalesOrderAttachments',
            }
        ];
    }
    /**
     * Create a new salesorderattachments
     * @param salesOrderAttachments - The salesorderattachments data to create
     * @returns Promise with the created salesorderattachments
     */
    async create(salesOrderAttachments) {
        this.logger.info('Creating salesorderattachments', { salesOrderAttachments });
        return this.executeRequest(async () => this.axios.post(this.endpoint, salesOrderAttachments), this.endpoint, 'POST');
    }
    /**
     * Get a salesorderattachments by ID
     * @param id - The salesorderattachments ID
     * @returns Promise with the salesorderattachments data
     */
    async get(id) {
        this.logger.info('Getting salesorderattachments', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a salesorderattachments
     * @param id - The salesorderattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting salesorderattachments', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List salesorderattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of salesorderattachments
     */
    async list(query = {}) {
        this.logger.info('Listing salesorderattachments', { query });
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
exports.SalesOrderAttachments = SalesOrderAttachments;
//# sourceMappingURL=salesorderattachments.js.map