"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractServiceUnits = void 0;
const base_1 = require("./base");
/**
 * ContractServiceUnits entity class for Autotask API
 *
 * Units for contract services
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractServiceUnitsEntity.htm}
 */
class ContractServiceUnits extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ContractServiceUnits';
    }
    static getMetadata() {
        return [
            {
                operation: 'createContractServiceUnits',
                requiredParams: ['contractServiceUnits'],
                optionalParams: [],
                returnType: 'IContractServiceUnits',
                endpoint: '/ContractServiceUnits',
            },
            {
                operation: 'getContractServiceUnits',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IContractServiceUnits',
                endpoint: '/ContractServiceUnits/{id}',
            },
            {
                operation: 'updateContractServiceUnits',
                requiredParams: ['id', 'contractServiceUnits'],
                optionalParams: [],
                returnType: 'IContractServiceUnits',
                endpoint: '/ContractServiceUnits/{id}',
            },
            {
                operation: 'deleteContractServiceUnits',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ContractServiceUnits/{id}',
            },
            {
                operation: 'listContractServiceUnits',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IContractServiceUnits[]',
                endpoint: '/ContractServiceUnits',
            }
        ];
    }
    /**
     * Create a new contractserviceunits
     * @param contractServiceUnits - The contractserviceunits data to create
     * @returns Promise with the created contractserviceunits
     */
    async create(contractServiceUnits) {
        this.logger.info('Creating contractserviceunits', { contractServiceUnits });
        return this.executeRequest(async () => this.axios.post(this.endpoint, contractServiceUnits), this.endpoint, 'POST');
    }
    /**
     * Get a contractserviceunits by ID
     * @param id - The contractserviceunits ID
     * @returns Promise with the contractserviceunits data
     */
    async get(id) {
        this.logger.info('Getting contractserviceunits', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a contractserviceunits
     * @param id - The contractserviceunits ID
     * @param contractServiceUnits - The updated contractserviceunits data
     * @returns Promise with the updated contractserviceunits
     */
    async update(id, contractServiceUnits) {
        this.logger.info('Updating contractserviceunits', { id, contractServiceUnits });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, contractServiceUnits), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a contractserviceunits
     * @param id - The contractserviceunits ID
     * @param contractServiceUnits - The partial contractserviceunits data to update
     * @returns Promise with the updated contractserviceunits
     */
    async patch(id, contractServiceUnits) {
        this.logger.info('Patching contractserviceunits', { id, contractServiceUnits });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, contractServiceUnits), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a contractserviceunits
     * @param id - The contractserviceunits ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting contractserviceunits', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List contractserviceunits with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractserviceunits
     */
    async list(query = {}) {
        this.logger.info('Listing contractserviceunits', { query });
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
exports.ContractServiceUnits = ContractServiceUnits;
//# sourceMappingURL=contractserviceunits.js.map