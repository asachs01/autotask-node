"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryProducts = void 0;
const base_1 = require("./base");
/**
 * InventoryProducts entity class for Autotask API
 *
 * Products available in inventory
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: inventory
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InventoryProductsEntity.htm}
 */
class InventoryProducts extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/InventoryProducts';
    }
    static getMetadata() {
        return [
            {
                operation: 'createInventoryProducts',
                requiredParams: ['inventoryProducts'],
                optionalParams: [],
                returnType: 'IInventoryProducts',
                endpoint: '/InventoryProducts',
            },
            {
                operation: 'getInventoryProducts',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IInventoryProducts',
                endpoint: '/InventoryProducts/{id}',
            },
            {
                operation: 'updateInventoryProducts',
                requiredParams: ['id', 'inventoryProducts'],
                optionalParams: [],
                returnType: 'IInventoryProducts',
                endpoint: '/InventoryProducts/{id}',
            },
            {
                operation: 'deleteInventoryProducts',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/InventoryProducts/{id}',
            },
            {
                operation: 'listInventoryProducts',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IInventoryProducts[]',
                endpoint: '/InventoryProducts',
            }
        ];
    }
    /**
     * Create a new inventoryproducts
     * @param inventoryProducts - The inventoryproducts data to create
     * @returns Promise with the created inventoryproducts
     */
    async create(inventoryProducts) {
        this.logger.info('Creating inventoryproducts', { inventoryProducts });
        return this.executeRequest(async () => this.axios.post(this.endpoint, inventoryProducts), this.endpoint, 'POST');
    }
    /**
     * Get a inventoryproducts by ID
     * @param id - The inventoryproducts ID
     * @returns Promise with the inventoryproducts data
     */
    async get(id) {
        this.logger.info('Getting inventoryproducts', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a inventoryproducts
     * @param id - The inventoryproducts ID
     * @param inventoryProducts - The updated inventoryproducts data
     * @returns Promise with the updated inventoryproducts
     */
    async update(id, inventoryProducts) {
        this.logger.info('Updating inventoryproducts', { id, inventoryProducts });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, inventoryProducts), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a inventoryproducts
     * @param id - The inventoryproducts ID
     * @param inventoryProducts - The partial inventoryproducts data to update
     * @returns Promise with the updated inventoryproducts
     */
    async patch(id, inventoryProducts) {
        this.logger.info('Patching inventoryproducts', { id, inventoryProducts });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, inventoryProducts), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a inventoryproducts
     * @param id - The inventoryproducts ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting inventoryproducts', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List inventoryproducts with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of inventoryproducts
     */
    async list(query = {}) {
        this.logger.info('Listing inventoryproducts', { query });
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
exports.InventoryProducts = InventoryProducts;
//# sourceMappingURL=inventoryproducts.js.map