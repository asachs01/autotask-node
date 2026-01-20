"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryTransfers = void 0;
const base_1 = require("./base");
/**
 * InventoryTransfers entity class for Autotask API
 *
 * Transfer records for inventory items
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: inventory
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InventoryTransfersEntity.htm}
 */
class InventoryTransfers extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/InventoryTransfers';
    }
    static getMetadata() {
        return [
            {
                operation: 'createInventoryTransfers',
                requiredParams: ['inventoryTransfers'],
                optionalParams: [],
                returnType: 'IInventoryTransfers',
                endpoint: '/InventoryTransfers',
            },
            {
                operation: 'getInventoryTransfers',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IInventoryTransfers',
                endpoint: '/InventoryTransfers/{id}',
            },
            {
                operation: 'updateInventoryTransfers',
                requiredParams: ['id', 'inventoryTransfers'],
                optionalParams: [],
                returnType: 'IInventoryTransfers',
                endpoint: '/InventoryTransfers/{id}',
            },
            {
                operation: 'deleteInventoryTransfers',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/InventoryTransfers/{id}',
            },
            {
                operation: 'listInventoryTransfers',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IInventoryTransfers[]',
                endpoint: '/InventoryTransfers',
            }
        ];
    }
    /**
     * Create a new inventorytransfers
     * @param inventoryTransfers - The inventorytransfers data to create
     * @returns Promise with the created inventorytransfers
     */
    async create(inventoryTransfers) {
        this.logger.info('Creating inventorytransfers', { inventoryTransfers });
        return this.executeRequest(async () => this.axios.post(this.endpoint, inventoryTransfers), this.endpoint, 'POST');
    }
    /**
     * Get a inventorytransfers by ID
     * @param id - The inventorytransfers ID
     * @returns Promise with the inventorytransfers data
     */
    async get(id) {
        this.logger.info('Getting inventorytransfers', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a inventorytransfers
     * @param id - The inventorytransfers ID
     * @param inventoryTransfers - The updated inventorytransfers data
     * @returns Promise with the updated inventorytransfers
     */
    async update(id, inventoryTransfers) {
        this.logger.info('Updating inventorytransfers', { id, inventoryTransfers });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, inventoryTransfers), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a inventorytransfers
     * @param id - The inventorytransfers ID
     * @param inventoryTransfers - The partial inventorytransfers data to update
     * @returns Promise with the updated inventorytransfers
     */
    async patch(id, inventoryTransfers) {
        this.logger.info('Patching inventorytransfers', { id, inventoryTransfers });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, inventoryTransfers), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a inventorytransfers
     * @param id - The inventorytransfers ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting inventorytransfers', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List inventorytransfers with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of inventorytransfers
     */
    async list(query = {}) {
        this.logger.info('Listing inventorytransfers', { query });
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
exports.InventoryTransfers = InventoryTransfers;
//# sourceMappingURL=inventorytransfers.js.map