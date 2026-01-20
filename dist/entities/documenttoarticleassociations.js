"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentToArticleAssociations = void 0;
const base_1 = require("./base");
/**
 * DocumentToArticleAssociations entity class for Autotask API
 *
 * Associations between documents and articles
 * Supported Operations: GET, POST, DELETE
 * Category: knowledge
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DocumentToArticleAssociationsEntity.htm}
 */
class DocumentToArticleAssociations extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/DocumentToArticleAssociations';
    }
    static getMetadata() {
        return [
            {
                operation: 'createDocumentToArticleAssociations',
                requiredParams: ['documentToArticleAssociations'],
                optionalParams: [],
                returnType: 'IDocumentToArticleAssociations',
                endpoint: '/DocumentToArticleAssociations',
            },
            {
                operation: 'getDocumentToArticleAssociations',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IDocumentToArticleAssociations',
                endpoint: '/DocumentToArticleAssociations/{id}',
            },
            {
                operation: 'deleteDocumentToArticleAssociations',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/DocumentToArticleAssociations/{id}',
            },
            {
                operation: 'listDocumentToArticleAssociations',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IDocumentToArticleAssociations[]',
                endpoint: '/DocumentToArticleAssociations',
            }
        ];
    }
    /**
     * Create a new documenttoarticleassociations
     * @param documentToArticleAssociations - The documenttoarticleassociations data to create
     * @returns Promise with the created documenttoarticleassociations
     */
    async create(documentToArticleAssociations) {
        this.logger.info('Creating documenttoarticleassociations', { documentToArticleAssociations });
        return this.executeRequest(async () => this.axios.post(this.endpoint, documentToArticleAssociations), this.endpoint, 'POST');
    }
    /**
     * Get a documenttoarticleassociations by ID
     * @param id - The documenttoarticleassociations ID
     * @returns Promise with the documenttoarticleassociations data
     */
    async get(id) {
        this.logger.info('Getting documenttoarticleassociations', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a documenttoarticleassociations
     * @param id - The documenttoarticleassociations ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting documenttoarticleassociations', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List documenttoarticleassociations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of documenttoarticleassociations
     */
    async list(query = {}) {
        this.logger.info('Listing documenttoarticleassociations', { query });
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
exports.DocumentToArticleAssociations = DocumentToArticleAssociations;
//# sourceMappingURL=documenttoarticleassociations.js.map