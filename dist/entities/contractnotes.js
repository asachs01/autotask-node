"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractNotes = void 0;
const base_1 = require("./base");
/**
 * ContractNotes entity class for Autotask API
 *
 * Notes for contracts
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractNotesEntity.htm}
 */
class ContractNotes extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ContractNotes';
    }
    static getMetadata() {
        return [
            {
                operation: 'createContractNotes',
                requiredParams: ['contractNotes'],
                optionalParams: [],
                returnType: 'IContractNotes',
                endpoint: '/ContractNotes',
            },
            {
                operation: 'getContractNotes',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IContractNotes',
                endpoint: '/ContractNotes/{id}',
            },
            {
                operation: 'updateContractNotes',
                requiredParams: ['id', 'contractNotes'],
                optionalParams: [],
                returnType: 'IContractNotes',
                endpoint: '/ContractNotes/{id}',
            },
            {
                operation: 'listContractNotes',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IContractNotes[]',
                endpoint: '/ContractNotes',
            }
        ];
    }
    /**
     * Create a new contractnotes
     * @param contractNotes - The contractnotes data to create
     * @returns Promise with the created contractnotes
     */
    async create(contractNotes) {
        this.logger.info('Creating contractnotes', { contractNotes });
        return this.executeRequest(async () => this.axios.post(this.endpoint, contractNotes), this.endpoint, 'POST');
    }
    /**
     * Get a contractnotes by ID
     * @param id - The contractnotes ID
     * @returns Promise with the contractnotes data
     */
    async get(id) {
        this.logger.info('Getting contractnotes', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a contractnotes
     * @param id - The contractnotes ID
     * @param contractNotes - The updated contractnotes data
     * @returns Promise with the updated contractnotes
     */
    async update(id, contractNotes) {
        this.logger.info('Updating contractnotes', { id, contractNotes });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, contractNotes), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a contractnotes
     * @param id - The contractnotes ID
     * @param contractNotes - The partial contractnotes data to update
     * @returns Promise with the updated contractnotes
     */
    async patch(id, contractNotes) {
        this.logger.info('Patching contractnotes', { id, contractNotes });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, contractNotes), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * List contractnotes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractnotes
     */
    async list(query = {}) {
        this.logger.info('Listing contractnotes', { query });
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
exports.ContractNotes = ContractNotes;
//# sourceMappingURL=contractnotes.js.map