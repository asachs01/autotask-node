"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentChecklistItems = void 0;
const base_1 = require("./base");
/**
 * DocumentChecklistItems entity class for Autotask API
 *
 * Checklist items for documents
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: knowledge
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DocumentChecklistItemsEntity.htm}
 */
class DocumentChecklistItems extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/DocumentChecklistItems';
    }
    static getMetadata() {
        return [
            {
                operation: 'createDocumentChecklistItems',
                requiredParams: ['documentChecklistItems'],
                optionalParams: [],
                returnType: 'IDocumentChecklistItems',
                endpoint: '/DocumentChecklistItems',
            },
            {
                operation: 'getDocumentChecklistItems',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IDocumentChecklistItems',
                endpoint: '/DocumentChecklistItems/{id}',
            },
            {
                operation: 'updateDocumentChecklistItems',
                requiredParams: ['id', 'documentChecklistItems'],
                optionalParams: [],
                returnType: 'IDocumentChecklistItems',
                endpoint: '/DocumentChecklistItems/{id}',
            },
            {
                operation: 'deleteDocumentChecklistItems',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/DocumentChecklistItems/{id}',
            },
            {
                operation: 'listDocumentChecklistItems',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IDocumentChecklistItems[]',
                endpoint: '/DocumentChecklistItems',
            }
        ];
    }
    /**
     * Create a new documentchecklistitems
     * @param documentChecklistItems - The documentchecklistitems data to create
     * @returns Promise with the created documentchecklistitems
     */
    async create(documentChecklistItems) {
        this.logger.info('Creating documentchecklistitems', { documentChecklistItems });
        return this.executeRequest(async () => this.axios.post(this.endpoint, documentChecklistItems), this.endpoint, 'POST');
    }
    /**
     * Get a documentchecklistitems by ID
     * @param id - The documentchecklistitems ID
     * @returns Promise with the documentchecklistitems data
     */
    async get(id) {
        this.logger.info('Getting documentchecklistitems', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a documentchecklistitems
     * @param id - The documentchecklistitems ID
     * @param documentChecklistItems - The updated documentchecklistitems data
     * @returns Promise with the updated documentchecklistitems
     */
    async update(id, documentChecklistItems) {
        this.logger.info('Updating documentchecklistitems', { id, documentChecklistItems });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, documentChecklistItems), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a documentchecklistitems
     * @param id - The documentchecklistitems ID
     * @param documentChecklistItems - The partial documentchecklistitems data to update
     * @returns Promise with the updated documentchecklistitems
     */
    async patch(id, documentChecklistItems) {
        this.logger.info('Patching documentchecklistitems', { id, documentChecklistItems });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, documentChecklistItems), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a documentchecklistitems
     * @param id - The documentchecklistitems ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting documentchecklistitems', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List documentchecklistitems with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of documentchecklistitems
     */
    async list(query = {}) {
        this.logger.info('Listing documentchecklistitems', { query });
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
exports.DocumentChecklistItems = DocumentChecklistItems;
//# sourceMappingURL=documentchecklistitems.js.map