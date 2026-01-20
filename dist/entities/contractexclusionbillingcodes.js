"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractExclusionBillingCodes = void 0;
const base_1 = require("./base");
/**
 * ContractExclusionBillingCodes entity class for Autotask API
 *
 * Billing codes excluded from contracts
 * Supported Operations: GET, POST, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractExclusionBillingCodesEntity.htm}
 */
class ContractExclusionBillingCodes extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ContractExclusionBillingCodes';
    }
    static getMetadata() {
        return [
            {
                operation: 'createContractExclusionBillingCodes',
                requiredParams: ['contractExclusionBillingCodes'],
                optionalParams: [],
                returnType: 'IContractExclusionBillingCodes',
                endpoint: '/ContractExclusionBillingCodes',
            },
            {
                operation: 'getContractExclusionBillingCodes',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IContractExclusionBillingCodes',
                endpoint: '/ContractExclusionBillingCodes/{id}',
            },
            {
                operation: 'deleteContractExclusionBillingCodes',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ContractExclusionBillingCodes/{id}',
            },
            {
                operation: 'listContractExclusionBillingCodes',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IContractExclusionBillingCodes[]',
                endpoint: '/ContractExclusionBillingCodes',
            }
        ];
    }
    /**
     * Create a new contractexclusionbillingcodes
     * @param contractExclusionBillingCodes - The contractexclusionbillingcodes data to create
     * @returns Promise with the created contractexclusionbillingcodes
     */
    async create(contractExclusionBillingCodes) {
        this.logger.info('Creating contractexclusionbillingcodes', { contractExclusionBillingCodes });
        return this.executeRequest(async () => this.axios.post(this.endpoint, contractExclusionBillingCodes), this.endpoint, 'POST');
    }
    /**
     * Get a contractexclusionbillingcodes by ID
     * @param id - The contractexclusionbillingcodes ID
     * @returns Promise with the contractexclusionbillingcodes data
     */
    async get(id) {
        this.logger.info('Getting contractexclusionbillingcodes', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a contractexclusionbillingcodes
     * @param id - The contractexclusionbillingcodes ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting contractexclusionbillingcodes', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List contractexclusionbillingcodes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractexclusionbillingcodes
     */
    async list(query = {}) {
        this.logger.info('Listing contractexclusionbillingcodes', { query });
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
exports.ContractExclusionBillingCodes = ContractExclusionBillingCodes;
//# sourceMappingURL=contractexclusionbillingcodes.js.map