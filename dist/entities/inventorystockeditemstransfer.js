"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryStockedItemsTransfer = void 0;
const base_1 = require("./base");
/**
 * InventoryStockedItemsTransfer entity class for Autotask API
 *
 * Transfer items between inventory locations
 * Supported Operations: POST
 * Category: inventory
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InventoryStockedItemsTransfer.htm}
 */
class InventoryStockedItemsTransfer extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/InventoryStockedItemsTransfer';
    }
    static getMetadata() {
        return [
            {
                operation: 'createInventoryStockedItemsTransfer',
                requiredParams: ['inventoryStockedItemsTransfer'],
                optionalParams: [],
                returnType: 'IInventoryStockedItemsTransfer',
                endpoint: '/InventoryStockedItemsTransfer',
            },
            {
                operation: 'listInventoryStockedItemsTransfer',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IInventoryStockedItemsTransfer[]',
                endpoint: '/InventoryStockedItemsTransfer',
            }
        ];
    }
    /**
     * Create a new inventorystockeditemstransfer
     * @param inventoryStockedItemsTransfer - The inventorystockeditemstransfer data to create
     * @returns Promise with the created inventorystockeditemstransfer
     */
    async create(inventoryStockedItemsTransfer) {
        this.logger.info('Creating inventorystockeditemstransfer', { inventoryStockedItemsTransfer });
        return this.executeRequest(async () => this.axios.post(this.endpoint, inventoryStockedItemsTransfer), this.endpoint, 'POST');
    }
    /**
     * List inventorystockeditemstransfer with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of inventorystockeditemstransfer
     */
    async list(query = {}) {
        this.logger.info('Listing inventorystockeditemstransfer', { query });
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
exports.InventoryStockedItemsTransfer = InventoryStockedItemsTransfer;
//# sourceMappingURL=inventorystockeditemstransfer.js.map