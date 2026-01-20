"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractServiceAdjustments = void 0;
const base_1 = require("./base");
/**
 * ContractServiceAdjustments entity class for Autotask API
 *
 * Adjustments to contract services
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractServiceAdjustmentsEntity.htm}
 */
class ContractServiceAdjustments extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ContractServiceAdjustments';
    }
    static getMetadata() {
        return [
            {
                operation: 'createContractServiceAdjustments',
                requiredParams: ['contractServiceAdjustments'],
                optionalParams: [],
                returnType: 'IContractServiceAdjustments',
                endpoint: '/ContractServiceAdjustments',
            },
            {
                operation: 'getContractServiceAdjustments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IContractServiceAdjustments',
                endpoint: '/ContractServiceAdjustments/{id}',
            },
            {
                operation: 'updateContractServiceAdjustments',
                requiredParams: ['id', 'contractServiceAdjustments'],
                optionalParams: [],
                returnType: 'IContractServiceAdjustments',
                endpoint: '/ContractServiceAdjustments/{id}',
            },
            {
                operation: 'deleteContractServiceAdjustments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ContractServiceAdjustments/{id}',
            },
            {
                operation: 'listContractServiceAdjustments',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IContractServiceAdjustments[]',
                endpoint: '/ContractServiceAdjustments',
            }
        ];
    }
    /**
     * Create a new contractserviceadjustments
     * @param contractServiceAdjustments - The contractserviceadjustments data to create
     * @returns Promise with the created contractserviceadjustments
     */
    async create(contractServiceAdjustments) {
        this.logger.info('Creating contractserviceadjustments', { contractServiceAdjustments });
        return this.executeRequest(async () => this.axios.post(this.endpoint, contractServiceAdjustments), this.endpoint, 'POST');
    }
    /**
     * Get a contractserviceadjustments by ID
     * @param id - The contractserviceadjustments ID
     * @returns Promise with the contractserviceadjustments data
     */
    async get(id) {
        this.logger.info('Getting contractserviceadjustments', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a contractserviceadjustments
     * @param id - The contractserviceadjustments ID
     * @param contractServiceAdjustments - The updated contractserviceadjustments data
     * @returns Promise with the updated contractserviceadjustments
     */
    async update(id, contractServiceAdjustments) {
        this.logger.info('Updating contractserviceadjustments', { id, contractServiceAdjustments });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, contractServiceAdjustments), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a contractserviceadjustments
     * @param id - The contractserviceadjustments ID
     * @param contractServiceAdjustments - The partial contractserviceadjustments data to update
     * @returns Promise with the updated contractserviceadjustments
     */
    async patch(id, contractServiceAdjustments) {
        this.logger.info('Patching contractserviceadjustments', { id, contractServiceAdjustments });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, contractServiceAdjustments), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a contractserviceadjustments
     * @param id - The contractserviceadjustments ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting contractserviceadjustments', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List contractserviceadjustments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractserviceadjustments
     */
    async list(query = {}) {
        this.logger.info('Listing contractserviceadjustments', { query });
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
exports.ContractServiceAdjustments = ContractServiceAdjustments;
//# sourceMappingURL=contractserviceadjustments.js.map