"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductVendors = void 0;
const base_1 = require("./base");
/**
 * ProductVendors entity class for Autotask API
 *
 * Vendor information for products
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: inventory
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ProductVendorsEntity.htm}
 */
class ProductVendors extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ProductVendors';
    }
    static getMetadata() {
        return [
            {
                operation: 'createProductVendors',
                requiredParams: ['productVendors'],
                optionalParams: [],
                returnType: 'IProductVendors',
                endpoint: '/ProductVendors',
            },
            {
                operation: 'getProductVendors',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IProductVendors',
                endpoint: '/ProductVendors/{id}',
            },
            {
                operation: 'updateProductVendors',
                requiredParams: ['id', 'productVendors'],
                optionalParams: [],
                returnType: 'IProductVendors',
                endpoint: '/ProductVendors/{id}',
            },
            {
                operation: 'deleteProductVendors',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ProductVendors/{id}',
            },
            {
                operation: 'listProductVendors',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IProductVendors[]',
                endpoint: '/ProductVendors',
            }
        ];
    }
    /**
     * Create a new productvendors
     * @param productVendors - The productvendors data to create
     * @returns Promise with the created productvendors
     */
    async create(productVendors) {
        this.logger.info('Creating productvendors', { productVendors });
        return this.executeRequest(async () => this.axios.post(this.endpoint, productVendors), this.endpoint, 'POST');
    }
    /**
     * Get a productvendors by ID
     * @param id - The productvendors ID
     * @returns Promise with the productvendors data
     */
    async get(id) {
        this.logger.info('Getting productvendors', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a productvendors
     * @param id - The productvendors ID
     * @param productVendors - The updated productvendors data
     * @returns Promise with the updated productvendors
     */
    async update(id, productVendors) {
        this.logger.info('Updating productvendors', { id, productVendors });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, productVendors), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a productvendors
     * @param id - The productvendors ID
     * @param productVendors - The partial productvendors data to update
     * @returns Promise with the updated productvendors
     */
    async patch(id, productVendors) {
        this.logger.info('Patching productvendors', { id, productVendors });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, productVendors), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a productvendors
     * @param id - The productvendors ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting productvendors', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List productvendors with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of productvendors
     */
    async list(query = {}) {
        this.logger.info('Listing productvendors', { query });
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
exports.ProductVendors = ProductVendors;
//# sourceMappingURL=productvendors.js.map