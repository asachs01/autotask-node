"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Quotes = void 0;
const base_1 = require("./base");
/**
 * Quotes entity class for Autotask API
 *
 * Customer quotes and estimates
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: financial
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/QuotesEntity.htm}
 */
class Quotes extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/Quotes';
    }
    static getMetadata() {
        return [
            {
                operation: 'createQuotes',
                requiredParams: ['quotes'],
                optionalParams: [],
                returnType: 'IQuotes',
                endpoint: '/Quotes',
            },
            {
                operation: 'getQuotes',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IQuotes',
                endpoint: '/Quotes/{id}',
            },
            {
                operation: 'updateQuotes',
                requiredParams: ['id', 'quotes'],
                optionalParams: [],
                returnType: 'IQuotes',
                endpoint: '/Quotes/{id}',
            },
            {
                operation: 'listQuotes',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IQuotes[]',
                endpoint: '/Quotes',
            },
        ];
    }
    /**
     * Create a new quotes
     * @param quotes - The quotes data to create
     * @returns Promise with the created quotes
     */
    async create(quotes) {
        this.logger.info('Creating quotes', { quotes });
        return this.executeRequest(async () => this.axios.post(this.endpoint, quotes), this.endpoint, 'POST');
    }
    /**
     * Get a quotes by ID
     * @param id - The quotes ID
     * @returns Promise with the quotes data
     */
    async get(id) {
        this.logger.info('Getting quotes', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a quotes
     * @param id - The quotes ID
     * @param quotes - The updated quotes data
     * @returns Promise with the updated quotes
     */
    async update(id, quotes) {
        this.logger.info('Updating quotes', { id, quotes });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, quotes), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a quotes
     * @param id - The quotes ID
     * @param quotes - The partial quotes data to update
     * @returns Promise with the updated quotes
     */
    async patch(id, quotes) {
        this.logger.info('Patching quotes', { id, quotes });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, quotes), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * List quotes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of quotes
     */
    async list(query = {}) {
        this.logger.info('Listing quotes', { query });
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
exports.Quotes = Quotes;
//# sourceMappingURL=quotes.js.map