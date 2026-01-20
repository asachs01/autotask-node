"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryStockedItemsAdd = void 0;
const base_1 = require("./base");
/**
 * InventoryStockedItemsAdd entity class for Autotask API
 *
 * Add items to inventory stock
 * Supported Operations: POST
 * Category: inventory
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InventoryStockedItemsAdd.htm}
 */
class InventoryStockedItemsAdd extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/InventoryStockedItemsAdd';
    }
    static getMetadata() {
        return [
            {
                operation: 'createInventoryStockedItemsAdd',
                requiredParams: ['inventoryStockedItemsAdd'],
                optionalParams: [],
                returnType: 'IInventoryStockedItemsAdd',
                endpoint: '/InventoryStockedItemsAdd',
            },
            {
                operation: 'listInventoryStockedItemsAdd',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IInventoryStockedItemsAdd[]',
                endpoint: '/InventoryStockedItemsAdd',
            }
        ];
    }
    /**
     * Create a new inventorystockeditemsadd
     * @param inventoryStockedItemsAdd - The inventorystockeditemsadd data to create
     * @returns Promise with the created inventorystockeditemsadd
     */
    async create(inventoryStockedItemsAdd) {
        this.logger.info('Creating inventorystockeditemsadd', { inventoryStockedItemsAdd });
        return this.executeRequest(async () => this.axios.post(this.endpoint, inventoryStockedItemsAdd), this.endpoint, 'POST');
    }
    /**
     * List inventorystockeditemsadd with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of inventorystockeditemsadd
     */
    async list(query = {}) {
        this.logger.info('Listing inventorystockeditemsadd', { query });
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
exports.InventoryStockedItemsAdd = InventoryStockedItemsAdd;
//# sourceMappingURL=inventorystockeditemsadd.js.map