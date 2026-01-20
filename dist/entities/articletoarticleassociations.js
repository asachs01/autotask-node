"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleToArticleAssociations = void 0;
const base_1 = require("./base");
/**
 * ArticleToArticleAssociations entity class for Autotask API
 *
 * Associations between articles
 * Supported Operations: GET, POST, DELETE
 * Category: knowledge
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ArticleToArticleAssociationsEntity.htm}
 */
class ArticleToArticleAssociations extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ArticleToArticleAssociations';
    }
    static getMetadata() {
        return [
            {
                operation: 'createArticleToArticleAssociations',
                requiredParams: ['articleToArticleAssociations'],
                optionalParams: [],
                returnType: 'IArticleToArticleAssociations',
                endpoint: '/ArticleToArticleAssociations',
            },
            {
                operation: 'getArticleToArticleAssociations',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IArticleToArticleAssociations',
                endpoint: '/ArticleToArticleAssociations/{id}',
            },
            {
                operation: 'deleteArticleToArticleAssociations',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ArticleToArticleAssociations/{id}',
            },
            {
                operation: 'listArticleToArticleAssociations',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IArticleToArticleAssociations[]',
                endpoint: '/ArticleToArticleAssociations',
            }
        ];
    }
    /**
     * Create a new articletoarticleassociations
     * @param articleToArticleAssociations - The articletoarticleassociations data to create
     * @returns Promise with the created articletoarticleassociations
     */
    async create(articleToArticleAssociations) {
        this.logger.info('Creating articletoarticleassociations', { articleToArticleAssociations });
        return this.executeRequest(async () => this.axios.post(this.endpoint, articleToArticleAssociations), this.endpoint, 'POST');
    }
    /**
     * Get a articletoarticleassociations by ID
     * @param id - The articletoarticleassociations ID
     * @returns Promise with the articletoarticleassociations data
     */
    async get(id) {
        this.logger.info('Getting articletoarticleassociations', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a articletoarticleassociations
     * @param id - The articletoarticleassociations ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting articletoarticleassociations', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List articletoarticleassociations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of articletoarticleassociations
     */
    async list(query = {}) {
        this.logger.info('Listing articletoarticleassociations', { query });
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
exports.ArticleToArticleAssociations = ArticleToArticleAssociations;
//# sourceMappingURL=articletoarticleassociations.js.map