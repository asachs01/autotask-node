"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationalLevel1 = void 0;
const base_1 = require("./base");
/**
 * OrganizationalLevel1 entity class for Autotask API
 *
 * First level of organizational hierarchy
 * Supported Operations: GET
 * Category: organizational
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/OrganizationalLevel1Entity.htm}
 */
class OrganizationalLevel1 extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/OrganizationalLevel1';
    }
    static getMetadata() {
        return [
            {
                operation: 'getOrganizationalLevel1',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IOrganizationalLevel1',
                endpoint: '/OrganizationalLevel1/{id}',
            },
            {
                operation: 'listOrganizationalLevel1',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IOrganizationalLevel1[]',
                endpoint: '/OrganizationalLevel1',
            }
        ];
    }
    /**
     * Get a organizationallevel1 by ID
     * @param id - The organizationallevel1 ID
     * @returns Promise with the organizationallevel1 data
     */
    async get(id) {
        this.logger.info('Getting organizationallevel1', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * List organizationallevel1 with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of organizationallevel1
     */
    async list(query = {}) {
        this.logger.info('Listing organizationallevel1', { query });
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
exports.OrganizationalLevel1 = OrganizationalLevel1;
//# sourceMappingURL=organizationallevel1.js.map