"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeBaseArticles = void 0;
const base_1 = require("./base");
/**
 * KnowledgeBaseArticles entity class for Autotask API
 *
 * Knowledge base articles and documentation
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: knowledge
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/KnowledgeBaseArticlesEntity.htm}
 */
class KnowledgeBaseArticles extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/KnowledgeBaseArticles';
    }
    static getMetadata() {
        return [
            {
                operation: 'createKnowledgeBaseArticles',
                requiredParams: ['knowledgeBaseArticles'],
                optionalParams: [],
                returnType: 'IKnowledgeBaseArticles',
                endpoint: '/KnowledgeBaseArticles',
            },
            {
                operation: 'getKnowledgeBaseArticles',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IKnowledgeBaseArticles',
                endpoint: '/KnowledgeBaseArticles/{id}',
            },
            {
                operation: 'updateKnowledgeBaseArticles',
                requiredParams: ['id', 'knowledgeBaseArticles'],
                optionalParams: [],
                returnType: 'IKnowledgeBaseArticles',
                endpoint: '/KnowledgeBaseArticles/{id}',
            },
            {
                operation: 'deleteKnowledgeBaseArticles',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/KnowledgeBaseArticles/{id}',
            },
            {
                operation: 'listKnowledgeBaseArticles',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IKnowledgeBaseArticles[]',
                endpoint: '/KnowledgeBaseArticles',
            }
        ];
    }
    /**
     * Create a new knowledgebasearticles
     * @param knowledgeBaseArticles - The knowledgebasearticles data to create
     * @returns Promise with the created knowledgebasearticles
     */
    async create(knowledgeBaseArticles) {
        this.logger.info('Creating knowledgebasearticles', { knowledgeBaseArticles });
        return this.executeRequest(async () => this.axios.post(this.endpoint, knowledgeBaseArticles), this.endpoint, 'POST');
    }
    /**
     * Get a knowledgebasearticles by ID
     * @param id - The knowledgebasearticles ID
     * @returns Promise with the knowledgebasearticles data
     */
    async get(id) {
        this.logger.info('Getting knowledgebasearticles', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a knowledgebasearticles
     * @param id - The knowledgebasearticles ID
     * @param knowledgeBaseArticles - The updated knowledgebasearticles data
     * @returns Promise with the updated knowledgebasearticles
     */
    async update(id, knowledgeBaseArticles) {
        this.logger.info('Updating knowledgebasearticles', { id, knowledgeBaseArticles });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, knowledgeBaseArticles), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a knowledgebasearticles
     * @param id - The knowledgebasearticles ID
     * @param knowledgeBaseArticles - The partial knowledgebasearticles data to update
     * @returns Promise with the updated knowledgebasearticles
     */
    async patch(id, knowledgeBaseArticles) {
        this.logger.info('Patching knowledgebasearticles', { id, knowledgeBaseArticles });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, knowledgeBaseArticles), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a knowledgebasearticles
     * @param id - The knowledgebasearticles ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting knowledgebasearticles', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List knowledgebasearticles with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of knowledgebasearticles
     */
    async list(query = {}) {
        this.logger.info('Listing knowledgebasearticles', { query });
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
exports.KnowledgeBaseArticles = KnowledgeBaseArticles;
//# sourceMappingURL=knowledgebasearticles.js.map