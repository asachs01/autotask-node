"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractBlockHourFactors = void 0;
const base_1 = require("./base");
/**
 * ContractBlockHourFactors entity class for Autotask API
 *
 * Hour factors for contract blocks
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractBlockHourFactorsEntity.htm}
 */
class ContractBlockHourFactors extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ContractBlockHourFactors';
    }
    static getMetadata() {
        return [
            {
                operation: 'createContractBlockHourFactors',
                requiredParams: ['contractBlockHourFactors'],
                optionalParams: [],
                returnType: 'IContractBlockHourFactors',
                endpoint: '/ContractBlockHourFactors',
            },
            {
                operation: 'getContractBlockHourFactors',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IContractBlockHourFactors',
                endpoint: '/ContractBlockHourFactors/{id}',
            },
            {
                operation: 'updateContractBlockHourFactors',
                requiredParams: ['id', 'contractBlockHourFactors'],
                optionalParams: [],
                returnType: 'IContractBlockHourFactors',
                endpoint: '/ContractBlockHourFactors/{id}',
            },
            {
                operation: 'deleteContractBlockHourFactors',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ContractBlockHourFactors/{id}',
            },
            {
                operation: 'listContractBlockHourFactors',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IContractBlockHourFactors[]',
                endpoint: '/ContractBlockHourFactors',
            }
        ];
    }
    /**
     * Create a new contractblockhourfactors
     * @param contractBlockHourFactors - The contractblockhourfactors data to create
     * @returns Promise with the created contractblockhourfactors
     */
    async create(contractBlockHourFactors) {
        this.logger.info('Creating contractblockhourfactors', { contractBlockHourFactors });
        return this.executeRequest(async () => this.axios.post(this.endpoint, contractBlockHourFactors), this.endpoint, 'POST');
    }
    /**
     * Get a contractblockhourfactors by ID
     * @param id - The contractblockhourfactors ID
     * @returns Promise with the contractblockhourfactors data
     */
    async get(id) {
        this.logger.info('Getting contractblockhourfactors', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a contractblockhourfactors
     * @param id - The contractblockhourfactors ID
     * @param contractBlockHourFactors - The updated contractblockhourfactors data
     * @returns Promise with the updated contractblockhourfactors
     */
    async update(id, contractBlockHourFactors) {
        this.logger.info('Updating contractblockhourfactors', { id, contractBlockHourFactors });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, contractBlockHourFactors), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a contractblockhourfactors
     * @param id - The contractblockhourfactors ID
     * @param contractBlockHourFactors - The partial contractblockhourfactors data to update
     * @returns Promise with the updated contractblockhourfactors
     */
    async patch(id, contractBlockHourFactors) {
        this.logger.info('Patching contractblockhourfactors', { id, contractBlockHourFactors });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, contractBlockHourFactors), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a contractblockhourfactors
     * @param id - The contractblockhourfactors ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting contractblockhourfactors', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List contractblockhourfactors with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractblockhourfactors
     */
    async list(query = {}) {
        this.logger.info('Listing contractblockhourfactors', { query });
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
exports.ContractBlockHourFactors = ContractBlockHourFactors;
//# sourceMappingURL=contractblockhourfactors.js.map