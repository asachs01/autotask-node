"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleTicketAssociations = void 0;
const base_1 = require("./base");
/**
 * ArticleTicketAssociations entity class for Autotask API
 *
 * Associations between articles and tickets
 * Supported Operations: GET, POST, DELETE
 * Category: knowledge
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ArticleTicketAssociationsEntity.htm}
 */
class ArticleTicketAssociations extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ArticleTicketAssociations';
    }
    static getMetadata() {
        return [
            {
                operation: 'createArticleTicketAssociations',
                requiredParams: ['articleTicketAssociations'],
                optionalParams: [],
                returnType: 'IArticleTicketAssociations',
                endpoint: '/ArticleTicketAssociations',
            },
            {
                operation: 'getArticleTicketAssociations',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IArticleTicketAssociations',
                endpoint: '/ArticleTicketAssociations/{id}',
            },
            {
                operation: 'deleteArticleTicketAssociations',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ArticleTicketAssociations/{id}',
            },
            {
                operation: 'listArticleTicketAssociations',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IArticleTicketAssociations[]',
                endpoint: '/ArticleTicketAssociations',
            }
        ];
    }
    /**
     * Create a new articleticketassociations
     * @param articleTicketAssociations - The articleticketassociations data to create
     * @returns Promise with the created articleticketassociations
     */
    async create(articleTicketAssociations) {
        this.logger.info('Creating articleticketassociations', { articleTicketAssociations });
        return this.executeRequest(async () => this.axios.post(this.endpoint, articleTicketAssociations), this.endpoint, 'POST');
    }
    /**
     * Get a articleticketassociations by ID
     * @param id - The articleticketassociations ID
     * @returns Promise with the articleticketassociations data
     */
    async get(id) {
        this.logger.info('Getting articleticketassociations', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a articleticketassociations
     * @param id - The articleticketassociations ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting articleticketassociations', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List articleticketassociations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of articleticketassociations
     */
    async list(query = {}) {
        this.logger.info('Listing articleticketassociations', { query });
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
exports.ArticleTicketAssociations = ArticleTicketAssociations;
//# sourceMappingURL=articleticketassociations.js.map