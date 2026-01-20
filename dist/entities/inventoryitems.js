"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryItems = void 0;
const base_1 = require("./base");
/**
 * InventoryItems entity class for Autotask API
 *
 * Items in inventory
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: inventory
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InventoryItemsEntity.htm}
 */
class InventoryItems extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/InventoryItems';
    }
    static getMetadata() {
        return [
            {
                operation: 'createInventoryItems',
                requiredParams: ['inventoryItems'],
                optionalParams: [],
                returnType: 'IInventoryItems',
                endpoint: '/InventoryItems',
            },
            {
                operation: 'getInventoryItems',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IInventoryItems',
                endpoint: '/InventoryItems/{id}',
            },
            {
                operation: 'updateInventoryItems',
                requiredParams: ['id', 'inventoryItems'],
                optionalParams: [],
                returnType: 'IInventoryItems',
                endpoint: '/InventoryItems/{id}',
            },
            {
                operation: 'deleteInventoryItems',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/InventoryItems/{id}',
            },
            {
                operation: 'listInventoryItems',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IInventoryItems[]',
                endpoint: '/InventoryItems',
            }
        ];
    }
    /**
     * Create a new inventoryitems
     * @param inventoryItems - The inventoryitems data to create
     * @returns Promise with the created inventoryitems
     */
    async create(inventoryItems) {
        this.logger.info('Creating inventoryitems', { inventoryItems });
        return this.executeRequest(async () => this.axios.post(this.endpoint, inventoryItems), this.endpoint, 'POST');
    }
    /**
     * Get a inventoryitems by ID
     * @param id - The inventoryitems ID
     * @returns Promise with the inventoryitems data
     */
    async get(id) {
        this.logger.info('Getting inventoryitems', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a inventoryitems
     * @param id - The inventoryitems ID
     * @param inventoryItems - The updated inventoryitems data
     * @returns Promise with the updated inventoryitems
     */
    async update(id, inventoryItems) {
        this.logger.info('Updating inventoryitems', { id, inventoryItems });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, inventoryItems), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a inventoryitems
     * @param id - The inventoryitems ID
     * @param inventoryItems - The partial inventoryitems data to update
     * @returns Promise with the updated inventoryitems
     */
    async patch(id, inventoryItems) {
        this.logger.info('Patching inventoryitems', { id, inventoryItems });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, inventoryItems), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a inventoryitems
     * @param id - The inventoryitems ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting inventoryitems', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List inventoryitems with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of inventoryitems
     */
    async list(query = {}) {
        this.logger.info('Listing inventoryitems', { query });
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
exports.InventoryItems = InventoryItems;
//# sourceMappingURL=inventoryitems.js.map