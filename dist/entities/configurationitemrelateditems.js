"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationItemRelatedItems = void 0;
const base_1 = require("./base");
/**
 * ConfigurationItemRelatedItems entity class for Autotask API
 *
 * Related items for configuration items
 * Supported Operations: GET, POST, DELETE
 * Category: configuration
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ConfigurationItemRelatedItemsEntity.htm}
 */
class ConfigurationItemRelatedItems extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ConfigurationItemRelatedItems';
    }
    static getMetadata() {
        return [
            {
                operation: 'createConfigurationItemRelatedItems',
                requiredParams: ['configurationItemRelatedItems'],
                optionalParams: [],
                returnType: 'IConfigurationItemRelatedItems',
                endpoint: '/ConfigurationItemRelatedItems',
            },
            {
                operation: 'getConfigurationItemRelatedItems',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IConfigurationItemRelatedItems',
                endpoint: '/ConfigurationItemRelatedItems/{id}',
            },
            {
                operation: 'deleteConfigurationItemRelatedItems',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ConfigurationItemRelatedItems/{id}',
            },
            {
                operation: 'listConfigurationItemRelatedItems',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IConfigurationItemRelatedItems[]',
                endpoint: '/ConfigurationItemRelatedItems',
            }
        ];
    }
    /**
     * Create a new configurationitemrelateditems
     * @param configurationItemRelatedItems - The configurationitemrelateditems data to create
     * @returns Promise with the created configurationitemrelateditems
     */
    async create(configurationItemRelatedItems) {
        this.logger.info('Creating configurationitemrelateditems', { configurationItemRelatedItems });
        return this.executeRequest(async () => this.axios.post(this.endpoint, configurationItemRelatedItems), this.endpoint, 'POST');
    }
    /**
     * Get a configurationitemrelateditems by ID
     * @param id - The configurationitemrelateditems ID
     * @returns Promise with the configurationitemrelateditems data
     */
    async get(id) {
        this.logger.info('Getting configurationitemrelateditems', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a configurationitemrelateditems
     * @param id - The configurationitemrelateditems ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting configurationitemrelateditems', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List configurationitemrelateditems with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of configurationitemrelateditems
     */
    async list(query = {}) {
        this.logger.info('Listing configurationitemrelateditems', { query });
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
exports.ConfigurationItemRelatedItems = ConfigurationItemRelatedItems;
//# sourceMappingURL=configurationitemrelateditems.js.map