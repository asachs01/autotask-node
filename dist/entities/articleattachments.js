"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleAttachments = void 0;
const base_1 = require("./base");
/**
 * ArticleAttachments entity class for Autotask API
 *
 * File attachments for knowledge base articles
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ArticleAttachmentsEntity.htm}
 */
class ArticleAttachments extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ArticleAttachments';
    }
    static getMetadata() {
        return [
            {
                operation: 'createArticleAttachments',
                requiredParams: ['articleAttachments'],
                optionalParams: [],
                returnType: 'IArticleAttachments',
                endpoint: '/ArticleAttachments',
            },
            {
                operation: 'getArticleAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IArticleAttachments',
                endpoint: '/ArticleAttachments/{id}',
            },
            {
                operation: 'deleteArticleAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ArticleAttachments/{id}',
            },
            {
                operation: 'listArticleAttachments',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IArticleAttachments[]',
                endpoint: '/ArticleAttachments',
            }
        ];
    }
    /**
     * Create a new articleattachments
     * @param articleAttachments - The articleattachments data to create
     * @returns Promise with the created articleattachments
     */
    async create(articleAttachments) {
        this.logger.info('Creating articleattachments', { articleAttachments });
        return this.executeRequest(async () => this.axios.post(this.endpoint, articleAttachments), this.endpoint, 'POST');
    }
    /**
     * Get a articleattachments by ID
     * @param id - The articleattachments ID
     * @returns Promise with the articleattachments data
     */
    async get(id) {
        this.logger.info('Getting articleattachments', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a articleattachments
     * @param id - The articleattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting articleattachments', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List articleattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of articleattachments
     */
    async list(query = {}) {
        this.logger.info('Listing articleattachments', { query });
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
exports.ArticleAttachments = ArticleAttachments;
//# sourceMappingURL=articleattachments.js.map