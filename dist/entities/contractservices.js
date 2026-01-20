"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractServices = void 0;
const base_1 = require("./base");
/**
 * ContractServices entity class for Autotask API
 *
 * Services included in contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractServicesEntity.htm}
 */
class ContractServices extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ContractServices';
    }
    static getMetadata() {
        return [
            {
                operation: 'createContractServices',
                requiredParams: ['contractServices'],
                optionalParams: [],
                returnType: 'IContractServices',
                endpoint: '/ContractServices',
            },
            {
                operation: 'getContractServices',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IContractServices',
                endpoint: '/ContractServices/{id}',
            },
            {
                operation: 'updateContractServices',
                requiredParams: ['id', 'contractServices'],
                optionalParams: [],
                returnType: 'IContractServices',
                endpoint: '/ContractServices/{id}',
            },
            {
                operation: 'deleteContractServices',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ContractServices/{id}',
            },
            {
                operation: 'listContractServices',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IContractServices[]',
                endpoint: '/ContractServices',
            }
        ];
    }
    /**
     * Create a new contractservices
     * @param contractServices - The contractservices data to create
     * @returns Promise with the created contractservices
     */
    async create(contractServices) {
        this.logger.info('Creating contractservices', { contractServices });
        return this.executeRequest(async () => this.axios.post(this.endpoint, contractServices), this.endpoint, 'POST');
    }
    /**
     * Get a contractservices by ID
     * @param id - The contractservices ID
     * @returns Promise with the contractservices data
     */
    async get(id) {
        this.logger.info('Getting contractservices', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a contractservices
     * @param id - The contractservices ID
     * @param contractServices - The updated contractservices data
     * @returns Promise with the updated contractservices
     */
    async update(id, contractServices) {
        this.logger.info('Updating contractservices', { id, contractServices });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, contractServices), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a contractservices
     * @param id - The contractservices ID
     * @param contractServices - The partial contractservices data to update
     * @returns Promise with the updated contractservices
     */
    async patch(id, contractServices) {
        this.logger.info('Patching contractservices', { id, contractServices });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, contractServices), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a contractservices
     * @param id - The contractservices ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting contractservices', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List contractservices with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractservices
     */
    async list(query = {}) {
        this.logger.info('Listing contractservices', { query });
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
exports.ContractServices = ContractServices;
//# sourceMappingURL=contractservices.js.map