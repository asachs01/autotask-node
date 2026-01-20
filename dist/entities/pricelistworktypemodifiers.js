"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceListWorkTypeModifiers = void 0;
const base_1 = require("./base");
/**
 * PriceListWorkTypeModifiers entity class for Autotask API
 *
 * Work type modifiers in price lists
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: pricing
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PriceListWorkTypeModifiersEntity.htm}
 */
class PriceListWorkTypeModifiers extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/PriceListWorkTypeModifiers';
    }
    static getMetadata() {
        return [
            {
                operation: 'createPriceListWorkTypeModifiers',
                requiredParams: ['priceListWorkTypeModifiers'],
                optionalParams: [],
                returnType: 'IPriceListWorkTypeModifiers',
                endpoint: '/PriceListWorkTypeModifiers',
            },
            {
                operation: 'getPriceListWorkTypeModifiers',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IPriceListWorkTypeModifiers',
                endpoint: '/PriceListWorkTypeModifiers/{id}',
            },
            {
                operation: 'updatePriceListWorkTypeModifiers',
                requiredParams: ['id', 'priceListWorkTypeModifiers'],
                optionalParams: [],
                returnType: 'IPriceListWorkTypeModifiers',
                endpoint: '/PriceListWorkTypeModifiers/{id}',
            },
            {
                operation: 'deletePriceListWorkTypeModifiers',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/PriceListWorkTypeModifiers/{id}',
            },
            {
                operation: 'listPriceListWorkTypeModifiers',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IPriceListWorkTypeModifiers[]',
                endpoint: '/PriceListWorkTypeModifiers',
            }
        ];
    }
    /**
     * Create a new pricelistworktypemodifiers
     * @param priceListWorkTypeModifiers - The pricelistworktypemodifiers data to create
     * @returns Promise with the created pricelistworktypemodifiers
     */
    async create(priceListWorkTypeModifiers) {
        this.logger.info('Creating pricelistworktypemodifiers', { priceListWorkTypeModifiers });
        return this.executeRequest(async () => this.axios.post(this.endpoint, priceListWorkTypeModifiers), this.endpoint, 'POST');
    }
    /**
     * Get a pricelistworktypemodifiers by ID
     * @param id - The pricelistworktypemodifiers ID
     * @returns Promise with the pricelistworktypemodifiers data
     */
    async get(id) {
        this.logger.info('Getting pricelistworktypemodifiers', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a pricelistworktypemodifiers
     * @param id - The pricelistworktypemodifiers ID
     * @param priceListWorkTypeModifiers - The updated pricelistworktypemodifiers data
     * @returns Promise with the updated pricelistworktypemodifiers
     */
    async update(id, priceListWorkTypeModifiers) {
        this.logger.info('Updating pricelistworktypemodifiers', { id, priceListWorkTypeModifiers });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, priceListWorkTypeModifiers), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a pricelistworktypemodifiers
     * @param id - The pricelistworktypemodifiers ID
     * @param priceListWorkTypeModifiers - The partial pricelistworktypemodifiers data to update
     * @returns Promise with the updated pricelistworktypemodifiers
     */
    async patch(id, priceListWorkTypeModifiers) {
        this.logger.info('Patching pricelistworktypemodifiers', { id, priceListWorkTypeModifiers });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, priceListWorkTypeModifiers), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a pricelistworktypemodifiers
     * @param id - The pricelistworktypemodifiers ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting pricelistworktypemodifiers', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List pricelistworktypemodifiers with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of pricelistworktypemodifiers
     */
    async list(query = {}) {
        this.logger.info('Listing pricelistworktypemodifiers', { query });
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
exports.PriceListWorkTypeModifiers = PriceListWorkTypeModifiers;
//# sourceMappingURL=pricelistworktypemodifiers.js.map