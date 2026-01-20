"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractExclusionSetExcludedRoles = void 0;
const base_1 = require("./base");
/**
 * ContractExclusionSetExcludedRoles entity class for Autotask API
 *
 * Excluded roles within contract exclusion sets
 * Supported Operations: GET, POST, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractExclusionSetExcludedRolesEntity.htm}
 */
class ContractExclusionSetExcludedRoles extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ContractExclusionSetExcludedRoles';
    }
    static getMetadata() {
        return [
            {
                operation: 'createContractExclusionSetExcludedRoles',
                requiredParams: ['contractExclusionSetExcludedRoles'],
                optionalParams: [],
                returnType: 'IContractExclusionSetExcludedRoles',
                endpoint: '/ContractExclusionSetExcludedRoles',
            },
            {
                operation: 'getContractExclusionSetExcludedRoles',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IContractExclusionSetExcludedRoles',
                endpoint: '/ContractExclusionSetExcludedRoles/{id}',
            },
            {
                operation: 'deleteContractExclusionSetExcludedRoles',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ContractExclusionSetExcludedRoles/{id}',
            },
            {
                operation: 'listContractExclusionSetExcludedRoles',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IContractExclusionSetExcludedRoles[]',
                endpoint: '/ContractExclusionSetExcludedRoles',
            }
        ];
    }
    /**
     * Create a new contractexclusionsetexcludedroles
     * @param contractExclusionSetExcludedRoles - The contractexclusionsetexcludedroles data to create
     * @returns Promise with the created contractexclusionsetexcludedroles
     */
    async create(contractExclusionSetExcludedRoles) {
        this.logger.info('Creating contractexclusionsetexcludedroles', { contractExclusionSetExcludedRoles });
        return this.executeRequest(async () => this.axios.post(this.endpoint, contractExclusionSetExcludedRoles), this.endpoint, 'POST');
    }
    /**
     * Get a contractexclusionsetexcludedroles by ID
     * @param id - The contractexclusionsetexcludedroles ID
     * @returns Promise with the contractexclusionsetexcludedroles data
     */
    async get(id) {
        this.logger.info('Getting contractexclusionsetexcludedroles', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a contractexclusionsetexcludedroles
     * @param id - The contractexclusionsetexcludedroles ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting contractexclusionsetexcludedroles', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List contractexclusionsetexcludedroles with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractexclusionsetexcludedroles
     */
    async list(query = {}) {
        this.logger.info('Listing contractexclusionsetexcludedroles', { query });
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
exports.ContractExclusionSetExcludedRoles = ContractExclusionSetExcludedRoles;
//# sourceMappingURL=contractexclusionsetexcludedroles.js.map