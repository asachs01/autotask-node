"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceTimeOffBalances = void 0;
const base_1 = require("./base");
/**
 * ResourceTimeOffBalances entity class for Autotask API
 *
 * Time off balances for resources
 * Supported Operations: GET
 * Category: time
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourceTimeOffBalanceEntity.htm}
 */
class ResourceTimeOffBalances extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ResourceTimeOffBalances';
    }
    static getMetadata() {
        return [
            {
                operation: 'getResourceTimeOffBalances',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IResourceTimeOffBalances',
                endpoint: '/ResourceTimeOffBalances/{id}',
            },
            {
                operation: 'listResourceTimeOffBalances',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IResourceTimeOffBalances[]',
                endpoint: '/ResourceTimeOffBalances',
            }
        ];
    }
    /**
     * Get a resourcetimeoffbalances by ID
     * @param id - The resourcetimeoffbalances ID
     * @returns Promise with the resourcetimeoffbalances data
     */
    async get(id) {
        this.logger.info('Getting resourcetimeoffbalances', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * List resourcetimeoffbalances with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of resourcetimeoffbalances
     */
    async list(query = {}) {
        this.logger.info('Listing resourcetimeoffbalances', { query });
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
exports.ResourceTimeOffBalances = ResourceTimeOffBalances;
//# sourceMappingURL=resourcetimeoffbalances.js.map