"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseReports = void 0;
const base_1 = require("./base");
/**
 * ExpenseReports entity class for Autotask API
 *
 * Expense reports for reimbursement
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: expense
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ExpenseReportsEntity.htm}
 */
class ExpenseReports extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ExpenseReports';
    }
    static getMetadata() {
        return [
            {
                operation: 'createExpenseReports',
                requiredParams: ['expenseReports'],
                optionalParams: [],
                returnType: 'IExpenseReports',
                endpoint: '/ExpenseReports',
            },
            {
                operation: 'getExpenseReports',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IExpenseReports',
                endpoint: '/ExpenseReports/{id}',
            },
            {
                operation: 'updateExpenseReports',
                requiredParams: ['id', 'expenseReports'],
                optionalParams: [],
                returnType: 'IExpenseReports',
                endpoint: '/ExpenseReports/{id}',
            },
            {
                operation: 'deleteExpenseReports',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ExpenseReports/{id}',
            },
            {
                operation: 'listExpenseReports',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IExpenseReports[]',
                endpoint: '/ExpenseReports',
            }
        ];
    }
    /**
     * Create a new expensereports
     * @param expenseReports - The expensereports data to create
     * @returns Promise with the created expensereports
     */
    async create(expenseReports) {
        this.logger.info('Creating expensereports', { expenseReports });
        return this.executeRequest(async () => this.axios.post(this.endpoint, expenseReports), this.endpoint, 'POST');
    }
    /**
     * Get a expensereports by ID
     * @param id - The expensereports ID
     * @returns Promise with the expensereports data
     */
    async get(id) {
        this.logger.info('Getting expensereports', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a expensereports
     * @param id - The expensereports ID
     * @param expenseReports - The updated expensereports data
     * @returns Promise with the updated expensereports
     */
    async update(id, expenseReports) {
        this.logger.info('Updating expensereports', { id, expenseReports });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, expenseReports), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a expensereports
     * @param id - The expensereports ID
     * @param expenseReports - The partial expensereports data to update
     * @returns Promise with the updated expensereports
     */
    async patch(id, expenseReports) {
        this.logger.info('Patching expensereports', { id, expenseReports });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, expenseReports), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a expensereports
     * @param id - The expensereports ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting expensereports', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List expensereports with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of expensereports
     */
    async list(query = {}) {
        this.logger.info('Listing expensereports', { query });
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
exports.ExpenseReports = ExpenseReports;
//# sourceMappingURL=expensereports.js.map