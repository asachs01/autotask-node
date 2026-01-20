"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationalLevel2 = void 0;
const base_1 = require("./base");
/**
 * OrganizationalLevel2 entity class for Autotask API
 *
 * Second level of organizational hierarchy
 * Supported Operations: GET
 * Category: organizational
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/OrganizationalLevel2Entity.htm}
 */
class OrganizationalLevel2 extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/OrganizationalLevel2';
    }
    static getMetadata() {
        return [
            {
                operation: 'getOrganizationalLevel2',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IOrganizationalLevel2',
                endpoint: '/OrganizationalLevel2/{id}',
            },
            {
                operation: 'listOrganizationalLevel2',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IOrganizationalLevel2[]',
                endpoint: '/OrganizationalLevel2',
            }
        ];
    }
    /**
     * Get a organizationallevel2 by ID
     * @param id - The organizationallevel2 ID
     * @returns Promise with the organizationallevel2 data
     */
    async get(id) {
        this.logger.info('Getting organizationallevel2', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * List organizationallevel2 with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of organizationallevel2
     */
    async list(query = {}) {
        this.logger.info('Listing organizationallevel2', { query });
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
exports.OrganizationalLevel2 = OrganizationalLevel2;
//# sourceMappingURL=organizationallevel2.js.map