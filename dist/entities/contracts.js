"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contracts = void 0;
const base_1 = require("./base");
/**
 * Contracts entity class for Autotask API
 *
 * Service contracts and agreements
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractsEntity.htm}
 */
class Contracts extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/Contracts';
    }
    static getMetadata() {
        return [
            {
                operation: 'createContracts',
                requiredParams: ['contracts'],
                optionalParams: [],
                returnType: 'IContracts',
                endpoint: '/Contracts',
            },
            {
                operation: 'getContracts',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IContracts',
                endpoint: '/Contracts/{id}',
            },
            {
                operation: 'updateContracts',
                requiredParams: ['id', 'contracts'],
                optionalParams: [],
                returnType: 'IContracts',
                endpoint: '/Contracts/{id}',
            },
            {
                operation: 'listContracts',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IContracts[]',
                endpoint: '/Contracts',
            },
        ];
    }
    /**
     * Create a new contracts
     * @param contracts - The contracts data to create
     * @returns Promise with the created contracts
     */
    async create(contracts) {
        this.logger.info('Creating contracts', { contracts });
        return this.executeRequest(async () => this.axios.post(this.endpoint, contracts), this.endpoint, 'POST');
    }
    /**
     * Get a contracts by ID
     * @param id - The contracts ID
     * @returns Promise with the contracts data
     */
    async get(id) {
        this.logger.info('Getting contracts', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a contracts
     * @param id - The contracts ID
     * @param contracts - The updated contracts data
     * @returns Promise with the updated contracts
     */
    async update(id, contracts) {
        this.logger.info('Updating contracts', { id, contracts });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, contracts), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a contracts
     * @param id - The contracts ID
     * @param contracts - The partial contracts data to update
     * @returns Promise with the updated contracts
     */
    async patch(id, contracts) {
        this.logger.info('Patching contracts', { id, contracts });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, contracts), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a contracts
     * @param id - The contracts ID to delete
     * @returns Promise with void response
     */
    async delete(id) {
        this.logger.info('Deleting contracts', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List contracts with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contracts
     */
    async list(query = {}) {
        this.logger.info('Listing contracts', { query });
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
exports.Contracts = Contracts;
//# sourceMappingURL=contracts.js.map