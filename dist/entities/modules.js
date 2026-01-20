"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Modules = void 0;
const base_1 = require("./base");
/**
 * Modules entity class for Autotask API
 *
 * System modules and features
 * Supported Operations: GET
 * Category: lookup
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ModulesEntity.htm}
 */
class Modules extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/Modules';
    }
    static getMetadata() {
        return [
            {
                operation: 'getModules',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IModules',
                endpoint: '/Modules/{id}',
            },
            {
                operation: 'listModules',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IModules[]',
                endpoint: '/Modules',
            }
        ];
    }
    /**
     * Get a modules by ID
     * @param id - The modules ID
     * @returns Promise with the modules data
     */
    async get(id) {
        this.logger.info('Getting modules', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * List modules with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of modules
     */
    async list(query = {}) {
        this.logger.info('Listing modules', { query });
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
exports.Modules = Modules;
//# sourceMappingURL=modules.js.map