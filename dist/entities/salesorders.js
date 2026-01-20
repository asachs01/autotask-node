"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesOrders = void 0;
const base_1 = require("./base");
/**
 * SalesOrders entity class for Autotask API
 *
 * Customer sales orders
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: sales
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/SalesOrdersEntity.htm}
 */
class SalesOrders extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/SalesOrders';
    }
    static getMetadata() {
        return [
            {
                operation: 'createSalesOrders',
                requiredParams: ['salesOrders'],
                optionalParams: [],
                returnType: 'ISalesOrders',
                endpoint: '/SalesOrders',
            },
            {
                operation: 'getSalesOrders',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'ISalesOrders',
                endpoint: '/SalesOrders/{id}',
            },
            {
                operation: 'updateSalesOrders',
                requiredParams: ['id', 'salesOrders'],
                optionalParams: [],
                returnType: 'ISalesOrders',
                endpoint: '/SalesOrders/{id}',
            },
            {
                operation: 'listSalesOrders',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'ISalesOrders[]',
                endpoint: '/SalesOrders',
            }
        ];
    }
    /**
     * Create a new salesorders
     * @param salesOrders - The salesorders data to create
     * @returns Promise with the created salesorders
     */
    async create(salesOrders) {
        this.logger.info('Creating salesorders', { salesOrders });
        return this.executeRequest(async () => this.axios.post(this.endpoint, salesOrders), this.endpoint, 'POST');
    }
    /**
     * Get a salesorders by ID
     * @param id - The salesorders ID
     * @returns Promise with the salesorders data
     */
    async get(id) {
        this.logger.info('Getting salesorders', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a salesorders
     * @param id - The salesorders ID
     * @param salesOrders - The updated salesorders data
     * @returns Promise with the updated salesorders
     */
    async update(id, salesOrders) {
        this.logger.info('Updating salesorders', { id, salesOrders });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, salesOrders), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a salesorders
     * @param id - The salesorders ID
     * @param salesOrders - The partial salesorders data to update
     * @returns Promise with the updated salesorders
     */
    async patch(id, salesOrders) {
        this.logger.info('Patching salesorders', { id, salesOrders });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, salesOrders), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * List salesorders with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of salesorders
     */
    async list(query = {}) {
        this.logger.info('Listing salesorders', { query });
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
exports.SalesOrders = SalesOrders;
//# sourceMappingURL=salesorders.js.map