"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractBillingRules = void 0;
const base_1 = require("./base");
/**
 * ContractBillingRules entity class for Autotask API
 *
 * Billing rules for contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractBillingRulesEntity.htm}
 */
class ContractBillingRules extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ContractBillingRules';
    }
    static getMetadata() {
        return [
            {
                operation: 'createContractBillingRules',
                requiredParams: ['contractBillingRules'],
                optionalParams: [],
                returnType: 'IContractBillingRules',
                endpoint: '/ContractBillingRules',
            },
            {
                operation: 'getContractBillingRules',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IContractBillingRules',
                endpoint: '/ContractBillingRules/{id}',
            },
            {
                operation: 'updateContractBillingRules',
                requiredParams: ['id', 'contractBillingRules'],
                optionalParams: [],
                returnType: 'IContractBillingRules',
                endpoint: '/ContractBillingRules/{id}',
            },
            {
                operation: 'deleteContractBillingRules',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ContractBillingRules/{id}',
            },
            {
                operation: 'listContractBillingRules',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IContractBillingRules[]',
                endpoint: '/ContractBillingRules',
            }
        ];
    }
    /**
     * Create a new contractbillingrules
     * @param contractBillingRules - The contractbillingrules data to create
     * @returns Promise with the created contractbillingrules
     */
    async create(contractBillingRules) {
        this.logger.info('Creating contractbillingrules', { contractBillingRules });
        return this.executeRequest(async () => this.axios.post(this.endpoint, contractBillingRules), this.endpoint, 'POST');
    }
    /**
     * Get a contractbillingrules by ID
     * @param id - The contractbillingrules ID
     * @returns Promise with the contractbillingrules data
     */
    async get(id) {
        this.logger.info('Getting contractbillingrules', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a contractbillingrules
     * @param id - The contractbillingrules ID
     * @param contractBillingRules - The updated contractbillingrules data
     * @returns Promise with the updated contractbillingrules
     */
    async update(id, contractBillingRules) {
        this.logger.info('Updating contractbillingrules', { id, contractBillingRules });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, contractBillingRules), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a contractbillingrules
     * @param id - The contractbillingrules ID
     * @param contractBillingRules - The partial contractbillingrules data to update
     * @returns Promise with the updated contractbillingrules
     */
    async patch(id, contractBillingRules) {
        this.logger.info('Patching contractbillingrules', { id, contractBillingRules });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, contractBillingRules), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a contractbillingrules
     * @param id - The contractbillingrules ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting contractbillingrules', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List contractbillingrules with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractbillingrules
     */
    async list(query = {}) {
        this.logger.info('Listing contractbillingrules', { query });
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
exports.ContractBillingRules = ContractBillingRules;
//# sourceMappingURL=contractbillingrules.js.map