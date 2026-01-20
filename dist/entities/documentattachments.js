"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentAttachments = void 0;
const base_1 = require("./base");
/**
 * DocumentAttachments entity class for Autotask API
 *
 * File attachments for documents
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DocumentAttachmentsEntity.htm}
 */
class DocumentAttachments extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/DocumentAttachments';
    }
    static getMetadata() {
        return [
            {
                operation: 'createDocumentAttachments',
                requiredParams: ['documentAttachments'],
                optionalParams: [],
                returnType: 'IDocumentAttachments',
                endpoint: '/DocumentAttachments',
            },
            {
                operation: 'getDocumentAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IDocumentAttachments',
                endpoint: '/DocumentAttachments/{id}',
            },
            {
                operation: 'deleteDocumentAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/DocumentAttachments/{id}',
            },
            {
                operation: 'listDocumentAttachments',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IDocumentAttachments[]',
                endpoint: '/DocumentAttachments',
            }
        ];
    }
    /**
     * Create a new documentattachments
     * @param documentAttachments - The documentattachments data to create
     * @returns Promise with the created documentattachments
     */
    async create(documentAttachments) {
        this.logger.info('Creating documentattachments', { documentAttachments });
        return this.executeRequest(async () => this.axios.post(this.endpoint, documentAttachments), this.endpoint, 'POST');
    }
    /**
     * Get a documentattachments by ID
     * @param id - The documentattachments ID
     * @returns Promise with the documentattachments data
     */
    async get(id) {
        this.logger.info('Getting documentattachments', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a documentattachments
     * @param id - The documentattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting documentattachments', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List documentattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of documentattachments
     */
    async list(query = {}) {
        this.logger.info('Listing documentattachments', { query });
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
exports.DocumentAttachments = DocumentAttachments;
//# sourceMappingURL=documentattachments.js.map