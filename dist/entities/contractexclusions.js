"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractExclusions = void 0;
const base_1 = require("./base");
/**
 * ContractExclusions entity class for Autotask API
 *
 * Provides CRUD operations for contractexclusions
 * Supported Operations: GET, POST, PUT, PATCH
 *
 * Capabilities:
 * - UDFs: Not supported
 * - Webhooks: Not supported
 * - Child Collections: No
 * - Impersonation: Not supported
 *
 * @see {@link https://autotask.net/help/developerhelp/content/apis/rest/Entities/ContractExclusionsEntity.htm}
 */
class ContractExclusions extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ContractExclusions';
    }
    static getMetadata() {
        return [
            {
                operation: 'createContractExclusion',
                requiredParams: ['contractExclusion'],
                optionalParams: [],
                returnType: 'ContractExclusion',
                endpoint: '/ContractExclusions',
            },
            {
                operation: 'getContractExclusion',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'ContractExclusion',
                endpoint: '/ContractExclusions/{id}',
            },
            {
                operation: 'updateContractExclusion',
                requiredParams: ['id', 'contractExclusion'],
                optionalParams: [],
                returnType: 'ContractExclusion',
                endpoint: '/ContractExclusions/{id}',
            },
            {
                operation: 'listContractExclusions',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'ContractExclusion[]',
                endpoint: '/ContractExclusions',
            }
        ];
    }
    /**
     * Create a new contractexclusion
     * @param contractExclusion - The contractexclusion data to create
     * @returns Promise with the created contractexclusion
     */
    async create(contractExclusion) {
        this.logger.info('Creating contractexclusion', { contractExclusion });
        return this.executeRequest(async () => this.axios.post(this.endpoint, contractExclusion), this.endpoint, 'POST');
    }
    /**
     * Get a contractexclusion by ID
     * @param id - The contractexclusion ID
     * @returns Promise with the contractexclusion data
     */
    async get(id) {
        this.logger.info('Getting contractexclusion', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a contractexclusion
     * @param id - The contractexclusion ID
     * @param contractExclusion - The updated contractexclusion data
     * @returns Promise with the updated contractexclusion
     */
    async update(id, contractExclusion) {
        this.logger.info('Updating contractexclusion', { id, contractExclusion });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, contractExclusion), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a contractexclusion
     * @param id - The contractexclusion ID
     * @param contractExclusion - The partial contractexclusion data to update
     * @returns Promise with the updated contractexclusion
     */
    async patch(id, contractExclusion) {
        this.logger.info('Patching contractexclusion', { id, contractExclusion });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, contractExclusion), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * List contractexclusions with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractexclusions
     */
    async list(query = {}) {
        this.logger.info('Listing contractexclusions', { query });
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
exports.ContractExclusions = ContractExclusions;
//# sourceMappingURL=contractexclusions.js.map