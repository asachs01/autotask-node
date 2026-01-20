"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractServiceBundles = void 0;
const base_1 = require("./base");
/**
 * ContractServiceBundles entity class for Autotask API
 *
 * Service bundles within contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractServiceBundlesEntity.htm}
 */
class ContractServiceBundles extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ContractServiceBundles';
    }
    static getMetadata() {
        return [
            {
                operation: 'createContractServiceBundles',
                requiredParams: ['contractServiceBundles'],
                optionalParams: [],
                returnType: 'IContractServiceBundles',
                endpoint: '/ContractServiceBundles',
            },
            {
                operation: 'getContractServiceBundles',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IContractServiceBundles',
                endpoint: '/ContractServiceBundles/{id}',
            },
            {
                operation: 'updateContractServiceBundles',
                requiredParams: ['id', 'contractServiceBundles'],
                optionalParams: [],
                returnType: 'IContractServiceBundles',
                endpoint: '/ContractServiceBundles/{id}',
            },
            {
                operation: 'deleteContractServiceBundles',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ContractServiceBundles/{id}',
            },
            {
                operation: 'listContractServiceBundles',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IContractServiceBundles[]',
                endpoint: '/ContractServiceBundles',
            }
        ];
    }
    /**
     * Create a new contractservicebundles
     * @param contractServiceBundles - The contractservicebundles data to create
     * @returns Promise with the created contractservicebundles
     */
    async create(contractServiceBundles) {
        this.logger.info('Creating contractservicebundles', { contractServiceBundles });
        return this.executeRequest(async () => this.axios.post(this.endpoint, contractServiceBundles), this.endpoint, 'POST');
    }
    /**
     * Get a contractservicebundles by ID
     * @param id - The contractservicebundles ID
     * @returns Promise with the contractservicebundles data
     */
    async get(id) {
        this.logger.info('Getting contractservicebundles', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a contractservicebundles
     * @param id - The contractservicebundles ID
     * @param contractServiceBundles - The updated contractservicebundles data
     * @returns Promise with the updated contractservicebundles
     */
    async update(id, contractServiceBundles) {
        this.logger.info('Updating contractservicebundles', { id, contractServiceBundles });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, contractServiceBundles), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a contractservicebundles
     * @param id - The contractservicebundles ID
     * @param contractServiceBundles - The partial contractservicebundles data to update
     * @returns Promise with the updated contractservicebundles
     */
    async patch(id, contractServiceBundles) {
        this.logger.info('Patching contractservicebundles', { id, contractServiceBundles });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, contractServiceBundles), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a contractservicebundles
     * @param id - The contractservicebundles ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting contractservicebundles', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List contractservicebundles with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractservicebundles
     */
    async list(query = {}) {
        this.logger.info('Listing contractservicebundles', { query });
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
exports.ContractServiceBundles = ContractServiceBundles;
//# sourceMappingURL=contractservicebundles.js.map