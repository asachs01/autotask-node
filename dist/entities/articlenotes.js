"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleNotes = void 0;
const base_1 = require("./base");
/**
 * ArticleNotes entity class for Autotask API
 *
 * Notes for knowledge base articles
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ArticleNotesEntity.htm}
 */
class ArticleNotes extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ArticleNotes';
    }
    static getMetadata() {
        return [
            {
                operation: 'createArticleNotes',
                requiredParams: ['articleNotes'],
                optionalParams: [],
                returnType: 'IArticleNotes',
                endpoint: '/ArticleNotes',
            },
            {
                operation: 'getArticleNotes',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IArticleNotes',
                endpoint: '/ArticleNotes/{id}',
            },
            {
                operation: 'updateArticleNotes',
                requiredParams: ['id', 'articleNotes'],
                optionalParams: [],
                returnType: 'IArticleNotes',
                endpoint: '/ArticleNotes/{id}',
            },
            {
                operation: 'listArticleNotes',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IArticleNotes[]',
                endpoint: '/ArticleNotes',
            }
        ];
    }
    /**
     * Create a new articlenotes
     * @param articleNotes - The articlenotes data to create
     * @returns Promise with the created articlenotes
     */
    async create(articleNotes) {
        this.logger.info('Creating articlenotes', { articleNotes });
        return this.executeRequest(async () => this.axios.post(this.endpoint, articleNotes), this.endpoint, 'POST');
    }
    /**
     * Get a articlenotes by ID
     * @param id - The articlenotes ID
     * @returns Promise with the articlenotes data
     */
    async get(id) {
        this.logger.info('Getting articlenotes', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a articlenotes
     * @param id - The articlenotes ID
     * @param articleNotes - The updated articlenotes data
     * @returns Promise with the updated articlenotes
     */
    async update(id, articleNotes) {
        this.logger.info('Updating articlenotes', { id, articleNotes });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, articleNotes), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a articlenotes
     * @param id - The articlenotes ID
     * @param articleNotes - The partial articlenotes data to update
     * @returns Promise with the updated articlenotes
     */
    async patch(id, articleNotes) {
        this.logger.info('Patching articlenotes', { id, articleNotes });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, articleNotes), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * List articlenotes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of articlenotes
     */
    async list(query = {}) {
        this.logger.info('Listing articlenotes', { query });
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
exports.ArticleNotes = ArticleNotes;
//# sourceMappingURL=articlenotes.js.map