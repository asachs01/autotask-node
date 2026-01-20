"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingItems = void 0;
const base_1 = require("./base");
/**
 * BillingItems entity class for Autotask API
 *
 * Billing items for invoicing
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: financial
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/BillingItemsEntity.htm}
 */
class BillingItems extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/BillingItems';
    }
    static getMetadata() {
        return [
            {
                operation: 'createBillingItems',
                requiredParams: ['billingItems'],
                optionalParams: [],
                returnType: 'IBillingItems',
                endpoint: '/BillingItems',
            },
            {
                operation: 'getBillingItems',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IBillingItems',
                endpoint: '/BillingItems/{id}',
            },
            {
                operation: 'updateBillingItems',
                requiredParams: ['id', 'billingItems'],
                optionalParams: [],
                returnType: 'IBillingItems',
                endpoint: '/BillingItems/{id}',
            },
            {
                operation: 'deleteBillingItems',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/BillingItems/{id}',
            },
            {
                operation: 'listBillingItems',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IBillingItems[]',
                endpoint: '/BillingItems',
            }
        ];
    }
    /**
     * Create a new billingitems
     * @param billingItems - The billingitems data to create
     * @returns Promise with the created billingitems
     */
    async create(billingItems) {
        this.logger.info('Creating billingitems', { billingItems });
        return this.executeRequest(async () => this.axios.post(this.endpoint, billingItems), this.endpoint, 'POST');
    }
    /**
     * Get a billingitems by ID
     * @param id - The billingitems ID
     * @returns Promise with the billingitems data
     */
    async get(id) {
        this.logger.info('Getting billingitems', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a billingitems
     * @param id - The billingitems ID
     * @param billingItems - The updated billingitems data
     * @returns Promise with the updated billingitems
     */
    async update(id, billingItems) {
        this.logger.info('Updating billingitems', { id, billingItems });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, billingItems), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a billingitems
     * @param id - The billingitems ID
     * @param billingItems - The partial billingitems data to update
     * @returns Promise with the updated billingitems
     */
    async patch(id, billingItems) {
        this.logger.info('Patching billingitems', { id, billingItems });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, billingItems), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a billingitems
     * @param id - The billingitems ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting billingitems', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List billingitems with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of billingitems
     */
    async list(query = {}) {
        this.logger.info('Listing billingitems', { query });
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
exports.BillingItems = BillingItems;
//# sourceMappingURL=billingitems.js.map