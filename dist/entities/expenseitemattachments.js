"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseItemAttachments = void 0;
const base_1 = require("./base");
/**
 * ExpenseItemAttachments entity class for Autotask API
 *
 * File attachments for expense items
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ExpenseItemAttachmentsEntity.htm}
 */
class ExpenseItemAttachments extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ExpenseItemAttachments';
    }
    static getMetadata() {
        return [
            {
                operation: 'createExpenseItemAttachments',
                requiredParams: ['expenseItemAttachments'],
                optionalParams: [],
                returnType: 'IExpenseItemAttachments',
                endpoint: '/ExpenseItemAttachments',
            },
            {
                operation: 'getExpenseItemAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IExpenseItemAttachments',
                endpoint: '/ExpenseItemAttachments/{id}',
            },
            {
                operation: 'deleteExpenseItemAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ExpenseItemAttachments/{id}',
            },
            {
                operation: 'listExpenseItemAttachments',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IExpenseItemAttachments[]',
                endpoint: '/ExpenseItemAttachments',
            }
        ];
    }
    /**
     * Create a new expenseitemattachments
     * @param expenseItemAttachments - The expenseitemattachments data to create
     * @returns Promise with the created expenseitemattachments
     */
    async create(expenseItemAttachments) {
        this.logger.info('Creating expenseitemattachments', { expenseItemAttachments });
        return this.executeRequest(async () => this.axios.post(this.endpoint, expenseItemAttachments), this.endpoint, 'POST');
    }
    /**
     * Get a expenseitemattachments by ID
     * @param id - The expenseitemattachments ID
     * @returns Promise with the expenseitemattachments data
     */
    async get(id) {
        this.logger.info('Getting expenseitemattachments', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a expenseitemattachments
     * @param id - The expenseitemattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting expenseitemattachments', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List expenseitemattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of expenseitemattachments
     */
    async list(query = {}) {
        this.logger.info('Listing expenseitemattachments', { query });
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
exports.ExpenseItemAttachments = ExpenseItemAttachments;
//# sourceMappingURL=expenseitemattachments.js.map