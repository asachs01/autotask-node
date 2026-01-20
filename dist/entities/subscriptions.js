"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscriptions = void 0;
const base_1 = require("./base");
/**
 * Subscriptions entity class for Autotask API
 *
 * Recurring service subscriptions
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: lookup
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/SubscriptionsEntity.htm}
 */
class Subscriptions extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/Subscriptions';
    }
    static getMetadata() {
        return [
            {
                operation: 'createSubscriptions',
                requiredParams: ['subscriptions'],
                optionalParams: [],
                returnType: 'ISubscriptions',
                endpoint: '/Subscriptions',
            },
            {
                operation: 'getSubscriptions',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'ISubscriptions',
                endpoint: '/Subscriptions/{id}',
            },
            {
                operation: 'updateSubscriptions',
                requiredParams: ['id', 'subscriptions'],
                optionalParams: [],
                returnType: 'ISubscriptions',
                endpoint: '/Subscriptions/{id}',
            },
            {
                operation: 'deleteSubscriptions',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/Subscriptions/{id}',
            },
            {
                operation: 'listSubscriptions',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'ISubscriptions[]',
                endpoint: '/Subscriptions',
            }
        ];
    }
    /**
     * Create a new subscriptions
     * @param subscriptions - The subscriptions data to create
     * @returns Promise with the created subscriptions
     */
    async create(subscriptions) {
        this.logger.info('Creating subscriptions', { subscriptions });
        return this.executeRequest(async () => this.axios.post(this.endpoint, subscriptions), this.endpoint, 'POST');
    }
    /**
     * Get a subscriptions by ID
     * @param id - The subscriptions ID
     * @returns Promise with the subscriptions data
     */
    async get(id) {
        this.logger.info('Getting subscriptions', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a subscriptions
     * @param id - The subscriptions ID
     * @param subscriptions - The updated subscriptions data
     * @returns Promise with the updated subscriptions
     */
    async update(id, subscriptions) {
        this.logger.info('Updating subscriptions', { id, subscriptions });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, subscriptions), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a subscriptions
     * @param id - The subscriptions ID
     * @param subscriptions - The partial subscriptions data to update
     * @returns Promise with the updated subscriptions
     */
    async patch(id, subscriptions) {
        this.logger.info('Patching subscriptions', { id, subscriptions });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, subscriptions), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a subscriptions
     * @param id - The subscriptions ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting subscriptions', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List subscriptions with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of subscriptions
     */
    async list(query = {}) {
        this.logger.info('Listing subscriptions', { query });
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
exports.Subscriptions = Subscriptions;
//# sourceMappingURL=subscriptions.js.map