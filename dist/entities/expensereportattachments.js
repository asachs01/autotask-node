"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseReportAttachments = void 0;
const base_1 = require("./base");
/**
 * ExpenseReportAttachments entity class for Autotask API
 *
 * File attachments for expense reports
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ExpenseReportAttachmentsEntity.htm}
 */
class ExpenseReportAttachments extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ExpenseReportAttachments';
    }
    static getMetadata() {
        return [
            {
                operation: 'createExpenseReportAttachments',
                requiredParams: ['expenseReportAttachments'],
                optionalParams: [],
                returnType: 'IExpenseReportAttachments',
                endpoint: '/ExpenseReportAttachments',
            },
            {
                operation: 'getExpenseReportAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IExpenseReportAttachments',
                endpoint: '/ExpenseReportAttachments/{id}',
            },
            {
                operation: 'deleteExpenseReportAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ExpenseReportAttachments/{id}',
            },
            {
                operation: 'listExpenseReportAttachments',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IExpenseReportAttachments[]',
                endpoint: '/ExpenseReportAttachments',
            }
        ];
    }
    /**
     * Create a new expensereportattachments
     * @param expenseReportAttachments - The expensereportattachments data to create
     * @returns Promise with the created expensereportattachments
     */
    async create(expenseReportAttachments) {
        this.logger.info('Creating expensereportattachments', { expenseReportAttachments });
        return this.executeRequest(async () => this.axios.post(this.endpoint, expenseReportAttachments), this.endpoint, 'POST');
    }
    /**
     * Get a expensereportattachments by ID
     * @param id - The expensereportattachments ID
     * @returns Promise with the expensereportattachments data
     */
    async get(id) {
        this.logger.info('Getting expensereportattachments', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a expensereportattachments
     * @param id - The expensereportattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting expensereportattachments', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List expensereportattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of expensereportattachments
     */
    async list(query = {}) {
        this.logger.info('Listing expensereportattachments', { query });
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
exports.ExpenseReportAttachments = ExpenseReportAttachments;
//# sourceMappingURL=expensereportattachments.js.map