"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractNoteAttachments = void 0;
const base_1 = require("./base");
/**
 * ContractNoteAttachments entity class for Autotask API
 *
 * File attachments for contract notes
 * Supported Operations: GET, POST, DELETE
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractNoteAttachmentsEntity.htm}
 */
class ContractNoteAttachments extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ContractNoteAttachments';
    }
    static getMetadata() {
        return [
            {
                operation: 'createContractNoteAttachments',
                requiredParams: ['contractNoteAttachments'],
                optionalParams: [],
                returnType: 'IContractNoteAttachments',
                endpoint: '/ContractNoteAttachments',
            },
            {
                operation: 'getContractNoteAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IContractNoteAttachments',
                endpoint: '/ContractNoteAttachments/{id}',
            },
            {
                operation: 'deleteContractNoteAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ContractNoteAttachments/{id}',
            },
            {
                operation: 'listContractNoteAttachments',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IContractNoteAttachments[]',
                endpoint: '/ContractNoteAttachments',
            }
        ];
    }
    /**
     * Create a new contractnoteattachments
     * @param contractNoteAttachments - The contractnoteattachments data to create
     * @returns Promise with the created contractnoteattachments
     */
    async create(contractNoteAttachments) {
        this.logger.info('Creating contractnoteattachments', { contractNoteAttachments });
        return this.executeRequest(async () => this.axios.post(this.endpoint, contractNoteAttachments), this.endpoint, 'POST');
    }
    /**
     * Get a contractnoteattachments by ID
     * @param id - The contractnoteattachments ID
     * @returns Promise with the contractnoteattachments data
     */
    async get(id) {
        this.logger.info('Getting contractnoteattachments', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a contractnoteattachments
     * @param id - The contractnoteattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting contractnoteattachments', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List contractnoteattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractnoteattachments
     */
    async list(query = {}) {
        this.logger.info('Listing contractnoteattachments', { query });
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
exports.ContractNoteAttachments = ContractNoteAttachments;
//# sourceMappingURL=contractnoteattachments.js.map