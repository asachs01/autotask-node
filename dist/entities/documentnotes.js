"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentNotes = void 0;
const base_1 = require("./base");
/**
 * DocumentNotes entity class for Autotask API
 *
 * Notes for documents
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DocumentNotesEntity.htm}
 */
class DocumentNotes extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/DocumentNotes';
    }
    static getMetadata() {
        return [
            {
                operation: 'createDocumentNotes',
                requiredParams: ['documentNotes'],
                optionalParams: [],
                returnType: 'IDocumentNotes',
                endpoint: '/DocumentNotes',
            },
            {
                operation: 'getDocumentNotes',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IDocumentNotes',
                endpoint: '/DocumentNotes/{id}',
            },
            {
                operation: 'updateDocumentNotes',
                requiredParams: ['id', 'documentNotes'],
                optionalParams: [],
                returnType: 'IDocumentNotes',
                endpoint: '/DocumentNotes/{id}',
            },
            {
                operation: 'listDocumentNotes',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IDocumentNotes[]',
                endpoint: '/DocumentNotes',
            }
        ];
    }
    /**
     * Create a new documentnotes
     * @param documentNotes - The documentnotes data to create
     * @returns Promise with the created documentnotes
     */
    async create(documentNotes) {
        this.logger.info('Creating documentnotes', { documentNotes });
        return this.executeRequest(async () => this.axios.post(this.endpoint, documentNotes), this.endpoint, 'POST');
    }
    /**
     * Get a documentnotes by ID
     * @param id - The documentnotes ID
     * @returns Promise with the documentnotes data
     */
    async get(id) {
        this.logger.info('Getting documentnotes', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a documentnotes
     * @param id - The documentnotes ID
     * @param documentNotes - The updated documentnotes data
     * @returns Promise with the updated documentnotes
     */
    async update(id, documentNotes) {
        this.logger.info('Updating documentnotes', { id, documentNotes });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, documentNotes), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a documentnotes
     * @param id - The documentnotes ID
     * @param documentNotes - The partial documentnotes data to update
     * @returns Promise with the updated documentnotes
     */
    async patch(id, documentNotes) {
        this.logger.info('Patching documentnotes', { id, documentNotes });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, documentNotes), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * List documentnotes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of documentnotes
     */
    async list(query = {}) {
        this.logger.info('Listing documentnotes', { query });
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
exports.DocumentNotes = DocumentNotes;
//# sourceMappingURL=documentnotes.js.map