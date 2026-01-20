"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractAdjustments = void 0;
const base_1 = require("./base");
/**
 * ContractAdjustments entity class for Autotask API
 *
 * Provides CRUD operations for contractadjustments
 * Supported Operations: GET, POST, PUT, PATCH
 *
 * Capabilities:
 * - UDFs: Not supported
 * - Webhooks: Not supported
 * - Child Collections: No
 * - Impersonation: Not supported
 *
 * @see {@link https://autotask.net/help/developerhelp/content/apis/rest/Entities/ContractAdjustmentsEntity.htm}
 */
class ContractAdjustments extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ContractAdjustments';
    }
    static getMetadata() {
        return [
            {
                operation: 'createContractAdjustment',
                requiredParams: ['contractAdjustment'],
                optionalParams: [],
                returnType: 'ContractAdjustment',
                endpoint: '/ContractAdjustments',
            },
            {
                operation: 'getContractAdjustment',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'ContractAdjustment',
                endpoint: '/ContractAdjustments/{id}',
            },
            {
                operation: 'updateContractAdjustment',
                requiredParams: ['id', 'contractAdjustment'],
                optionalParams: [],
                returnType: 'ContractAdjustment',
                endpoint: '/ContractAdjustments/{id}',
            },
            {
                operation: 'listContractAdjustments',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'ContractAdjustment[]',
                endpoint: '/ContractAdjustments',
            }
        ];
    }
    /**
     * Create a new contractadjustment
     * @param contractAdjustment - The contractadjustment data to create
     * @returns Promise with the created contractadjustment
     */
    async create(contractAdjustment) {
        this.logger.info('Creating contractadjustment', { contractAdjustment });
        return this.executeRequest(async () => this.axios.post(this.endpoint, contractAdjustment), this.endpoint, 'POST');
    }
    /**
     * Get a contractadjustment by ID
     * @param id - The contractadjustment ID
     * @returns Promise with the contractadjustment data
     */
    async get(id) {
        this.logger.info('Getting contractadjustment', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a contractadjustment
     * @param id - The contractadjustment ID
     * @param contractAdjustment - The updated contractadjustment data
     * @returns Promise with the updated contractadjustment
     */
    async update(id, contractAdjustment) {
        this.logger.info('Updating contractadjustment', { id, contractAdjustment });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, contractAdjustment), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a contractadjustment
     * @param id - The contractadjustment ID
     * @param contractAdjustment - The partial contractadjustment data to update
     * @returns Promise with the updated contractadjustment
     */
    async patch(id, contractAdjustment) {
        this.logger.info('Patching contractadjustment', { id, contractAdjustment });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, contractAdjustment), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * List contractadjustments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractadjustments
     */
    async list(query = {}) {
        this.logger.info('Listing contractadjustments', { query });
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
exports.ContractAdjustments = ContractAdjustments;
//# sourceMappingURL=contractadjustments.js.map