"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductNotes = void 0;
const base_1 = require("./base");
/**
 * ProductNotes entity class for Autotask API
 *
 * Notes for products
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ProductNotesEntity.htm}
 */
class ProductNotes extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ProductNotes';
    }
    static getMetadata() {
        return [
            {
                operation: 'createProductNotes',
                requiredParams: ['productNotes'],
                optionalParams: [],
                returnType: 'IProductNotes',
                endpoint: '/ProductNotes',
            },
            {
                operation: 'getProductNotes',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IProductNotes',
                endpoint: '/ProductNotes/{id}',
            },
            {
                operation: 'updateProductNotes',
                requiredParams: ['id', 'productNotes'],
                optionalParams: [],
                returnType: 'IProductNotes',
                endpoint: '/ProductNotes/{id}',
            },
            {
                operation: 'listProductNotes',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IProductNotes[]',
                endpoint: '/ProductNotes',
            }
        ];
    }
    /**
     * Create a new productnotes
     * @param productNotes - The productnotes data to create
     * @returns Promise with the created productnotes
     */
    async create(productNotes) {
        this.logger.info('Creating productnotes', { productNotes });
        return this.executeRequest(async () => this.axios.post(this.endpoint, productNotes), this.endpoint, 'POST');
    }
    /**
     * Get a productnotes by ID
     * @param id - The productnotes ID
     * @returns Promise with the productnotes data
     */
    async get(id) {
        this.logger.info('Getting productnotes', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a productnotes
     * @param id - The productnotes ID
     * @param productNotes - The updated productnotes data
     * @returns Promise with the updated productnotes
     */
    async update(id, productNotes) {
        this.logger.info('Updating productnotes', { id, productNotes });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, productNotes), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a productnotes
     * @param id - The productnotes ID
     * @param productNotes - The partial productnotes data to update
     * @returns Promise with the updated productnotes
     */
    async patch(id, productNotes) {
        this.logger.info('Patching productnotes', { id, productNotes });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, productNotes), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * List productnotes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of productnotes
     */
    async list(query = {}) {
        this.logger.info('Listing productnotes', { query });
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
exports.ProductNotes = ProductNotes;
//# sourceMappingURL=productnotes.js.map