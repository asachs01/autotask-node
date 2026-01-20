"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryItemSerialNumbers = void 0;
const base_1 = require("./base");
/**
 * InventoryItemSerialNumbers entity class for Autotask API
 *
 * Serial numbers for inventory items
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: inventory
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InventoryItemSerialNumbersEntity.htm}
 */
class InventoryItemSerialNumbers extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/InventoryItemSerialNumbers';
    }
    static getMetadata() {
        return [
            {
                operation: 'createInventoryItemSerialNumbers',
                requiredParams: ['inventoryItemSerialNumbers'],
                optionalParams: [],
                returnType: 'IInventoryItemSerialNumbers',
                endpoint: '/InventoryItemSerialNumbers',
            },
            {
                operation: 'getInventoryItemSerialNumbers',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IInventoryItemSerialNumbers',
                endpoint: '/InventoryItemSerialNumbers/{id}',
            },
            {
                operation: 'updateInventoryItemSerialNumbers',
                requiredParams: ['id', 'inventoryItemSerialNumbers'],
                optionalParams: [],
                returnType: 'IInventoryItemSerialNumbers',
                endpoint: '/InventoryItemSerialNumbers/{id}',
            },
            {
                operation: 'deleteInventoryItemSerialNumbers',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/InventoryItemSerialNumbers/{id}',
            },
            {
                operation: 'listInventoryItemSerialNumbers',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IInventoryItemSerialNumbers[]',
                endpoint: '/InventoryItemSerialNumbers',
            }
        ];
    }
    /**
     * Create a new inventoryitemserialnumbers
     * @param inventoryItemSerialNumbers - The inventoryitemserialnumbers data to create
     * @returns Promise with the created inventoryitemserialnumbers
     */
    async create(inventoryItemSerialNumbers) {
        this.logger.info('Creating inventoryitemserialnumbers', { inventoryItemSerialNumbers });
        return this.executeRequest(async () => this.axios.post(this.endpoint, inventoryItemSerialNumbers), this.endpoint, 'POST');
    }
    /**
     * Get a inventoryitemserialnumbers by ID
     * @param id - The inventoryitemserialnumbers ID
     * @returns Promise with the inventoryitemserialnumbers data
     */
    async get(id) {
        this.logger.info('Getting inventoryitemserialnumbers', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a inventoryitemserialnumbers
     * @param id - The inventoryitemserialnumbers ID
     * @param inventoryItemSerialNumbers - The updated inventoryitemserialnumbers data
     * @returns Promise with the updated inventoryitemserialnumbers
     */
    async update(id, inventoryItemSerialNumbers) {
        this.logger.info('Updating inventoryitemserialnumbers', { id, inventoryItemSerialNumbers });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, inventoryItemSerialNumbers), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a inventoryitemserialnumbers
     * @param id - The inventoryitemserialnumbers ID
     * @param inventoryItemSerialNumbers - The partial inventoryitemserialnumbers data to update
     * @returns Promise with the updated inventoryitemserialnumbers
     */
    async patch(id, inventoryItemSerialNumbers) {
        this.logger.info('Patching inventoryitemserialnumbers', { id, inventoryItemSerialNumbers });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, inventoryItemSerialNumbers), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a inventoryitemserialnumbers
     * @param id - The inventoryitemserialnumbers ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting inventoryitemserialnumbers', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List inventoryitemserialnumbers with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of inventoryitemserialnumbers
     */
    async list(query = {}) {
        this.logger.info('Listing inventoryitemserialnumbers', { query });
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
exports.InventoryItemSerialNumbers = InventoryItemSerialNumbers;
//# sourceMappingURL=inventoryitemserialnumbers.js.map