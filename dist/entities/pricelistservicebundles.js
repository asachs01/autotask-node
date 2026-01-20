"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceListServiceBundles = void 0;
const base_1 = require("./base");
/**
 * PriceListServiceBundles entity class for Autotask API
 *
 * Service bundles in price lists
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: pricing
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PriceListServiceBundlesEntity.htm}
 */
class PriceListServiceBundles extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/PriceListServiceBundles';
    }
    static getMetadata() {
        return [
            {
                operation: 'createPriceListServiceBundles',
                requiredParams: ['priceListServiceBundles'],
                optionalParams: [],
                returnType: 'IPriceListServiceBundles',
                endpoint: '/PriceListServiceBundles',
            },
            {
                operation: 'getPriceListServiceBundles',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IPriceListServiceBundles',
                endpoint: '/PriceListServiceBundles/{id}',
            },
            {
                operation: 'updatePriceListServiceBundles',
                requiredParams: ['id', 'priceListServiceBundles'],
                optionalParams: [],
                returnType: 'IPriceListServiceBundles',
                endpoint: '/PriceListServiceBundles/{id}',
            },
            {
                operation: 'deletePriceListServiceBundles',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/PriceListServiceBundles/{id}',
            },
            {
                operation: 'listPriceListServiceBundles',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IPriceListServiceBundles[]',
                endpoint: '/PriceListServiceBundles',
            }
        ];
    }
    /**
     * Create a new pricelistservicebundles
     * @param priceListServiceBundles - The pricelistservicebundles data to create
     * @returns Promise with the created pricelistservicebundles
     */
    async create(priceListServiceBundles) {
        this.logger.info('Creating pricelistservicebundles', { priceListServiceBundles });
        return this.executeRequest(async () => this.axios.post(this.endpoint, priceListServiceBundles), this.endpoint, 'POST');
    }
    /**
     * Get a pricelistservicebundles by ID
     * @param id - The pricelistservicebundles ID
     * @returns Promise with the pricelistservicebundles data
     */
    async get(id) {
        this.logger.info('Getting pricelistservicebundles', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a pricelistservicebundles
     * @param id - The pricelistservicebundles ID
     * @param priceListServiceBundles - The updated pricelistservicebundles data
     * @returns Promise with the updated pricelistservicebundles
     */
    async update(id, priceListServiceBundles) {
        this.logger.info('Updating pricelistservicebundles', { id, priceListServiceBundles });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, priceListServiceBundles), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a pricelistservicebundles
     * @param id - The pricelistservicebundles ID
     * @param priceListServiceBundles - The partial pricelistservicebundles data to update
     * @returns Promise with the updated pricelistservicebundles
     */
    async patch(id, priceListServiceBundles) {
        this.logger.info('Patching pricelistservicebundles', { id, priceListServiceBundles });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, priceListServiceBundles), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a pricelistservicebundles
     * @param id - The pricelistservicebundles ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting pricelistservicebundles', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List pricelistservicebundles with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of pricelistservicebundles
     */
    async list(query = {}) {
        this.logger.info('Listing pricelistservicebundles', { query });
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
exports.PriceListServiceBundles = PriceListServiceBundles;
//# sourceMappingURL=pricelistservicebundles.js.map