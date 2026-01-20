"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryStockedItemsRemove = void 0;
const base_1 = require("./base");
/**
 * InventoryStockedItemsRemove entity class for Autotask API
 *
 * Remove items from inventory stock
 * Supported Operations: POST
 * Category: inventory
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InventoryStockedItemsRemove.htm}
 */
class InventoryStockedItemsRemove extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/InventoryStockedItemsRemove';
    }
    static getMetadata() {
        return [
            {
                operation: 'createInventoryStockedItemsRemove',
                requiredParams: ['inventoryStockedItemsRemove'],
                optionalParams: [],
                returnType: 'IInventoryStockedItemsRemove',
                endpoint: '/InventoryStockedItemsRemove',
            },
            {
                operation: 'listInventoryStockedItemsRemove',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IInventoryStockedItemsRemove[]',
                endpoint: '/InventoryStockedItemsRemove',
            }
        ];
    }
    /**
     * Create a new inventorystockeditemsremove
     * @param inventoryStockedItemsRemove - The inventorystockeditemsremove data to create
     * @returns Promise with the created inventorystockeditemsremove
     */
    async create(inventoryStockedItemsRemove) {
        this.logger.info('Creating inventorystockeditemsremove', { inventoryStockedItemsRemove });
        return this.executeRequest(async () => this.axios.post(this.endpoint, inventoryStockedItemsRemove), this.endpoint, 'POST');
    }
    /**
     * List inventorystockeditemsremove with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of inventorystockeditemsremove
     */
    async list(query = {}) {
        this.logger.info('Listing inventorystockeditemsremove', { query });
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
exports.InventoryStockedItemsRemove = InventoryStockedItemsRemove;
//# sourceMappingURL=inventorystockeditemsremove.js.map