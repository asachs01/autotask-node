"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractRates = void 0;
const base_1 = require("./base");
/**
 * ContractRates entity class for Autotask API
 *
 * Billing rates for contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractRatesEntity.htm}
 */
class ContractRates extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ContractRates';
    }
    static getMetadata() {
        return [
            {
                operation: 'createContractRates',
                requiredParams: ['contractRates'],
                optionalParams: [],
                returnType: 'IContractRates',
                endpoint: '/ContractRates',
            },
            {
                operation: 'getContractRates',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IContractRates',
                endpoint: '/ContractRates/{id}',
            },
            {
                operation: 'updateContractRates',
                requiredParams: ['id', 'contractRates'],
                optionalParams: [],
                returnType: 'IContractRates',
                endpoint: '/ContractRates/{id}',
            },
            {
                operation: 'deleteContractRates',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ContractRates/{id}',
            },
            {
                operation: 'listContractRates',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IContractRates[]',
                endpoint: '/ContractRates',
            }
        ];
    }
    /**
     * Create a new contractrates
     * @param contractRates - The contractrates data to create
     * @returns Promise with the created contractrates
     */
    async create(contractRates) {
        this.logger.info('Creating contractrates', { contractRates });
        return this.executeRequest(async () => this.axios.post(this.endpoint, contractRates), this.endpoint, 'POST');
    }
    /**
     * Get a contractrates by ID
     * @param id - The contractrates ID
     * @returns Promise with the contractrates data
     */
    async get(id) {
        this.logger.info('Getting contractrates', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a contractrates
     * @param id - The contractrates ID
     * @param contractRates - The updated contractrates data
     * @returns Promise with the updated contractrates
     */
    async update(id, contractRates) {
        this.logger.info('Updating contractrates', { id, contractRates });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, contractRates), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a contractrates
     * @param id - The contractrates ID
     * @param contractRates - The partial contractrates data to update
     * @returns Promise with the updated contractrates
     */
    async patch(id, contractRates) {
        this.logger.info('Patching contractrates', { id, contractRates });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, contractRates), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a contractrates
     * @param id - The contractrates ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting contractrates', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List contractrates with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractrates
     */
    async list(query = {}) {
        this.logger.info('Listing contractrates', { query });
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
exports.ContractRates = ContractRates;
//# sourceMappingURL=contractrates.js.map