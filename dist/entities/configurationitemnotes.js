"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationItemNotes = void 0;
const base_1 = require("./base");
/**
 * ConfigurationItemNotes entity class for Autotask API
 *
 * Notes for configuration items
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ConfigurationItemNotesEntity.htm}
 */
class ConfigurationItemNotes extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ConfigurationItemNotes';
    }
    static getMetadata() {
        return [
            {
                operation: 'createConfigurationItemNotes',
                requiredParams: ['configurationItemNotes'],
                optionalParams: [],
                returnType: 'IConfigurationItemNotes',
                endpoint: '/ConfigurationItemNotes',
            },
            {
                operation: 'getConfigurationItemNotes',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IConfigurationItemNotes',
                endpoint: '/ConfigurationItemNotes/{id}',
            },
            {
                operation: 'updateConfigurationItemNotes',
                requiredParams: ['id', 'configurationItemNotes'],
                optionalParams: [],
                returnType: 'IConfigurationItemNotes',
                endpoint: '/ConfigurationItemNotes/{id}',
            },
            {
                operation: 'listConfigurationItemNotes',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IConfigurationItemNotes[]',
                endpoint: '/ConfigurationItemNotes',
            }
        ];
    }
    /**
     * Create a new configurationitemnotes
     * @param configurationItemNotes - The configurationitemnotes data to create
     * @returns Promise with the created configurationitemnotes
     */
    async create(configurationItemNotes) {
        this.logger.info('Creating configurationitemnotes', { configurationItemNotes });
        return this.executeRequest(async () => this.axios.post(this.endpoint, configurationItemNotes), this.endpoint, 'POST');
    }
    /**
     * Get a configurationitemnotes by ID
     * @param id - The configurationitemnotes ID
     * @returns Promise with the configurationitemnotes data
     */
    async get(id) {
        this.logger.info('Getting configurationitemnotes', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a configurationitemnotes
     * @param id - The configurationitemnotes ID
     * @param configurationItemNotes - The updated configurationitemnotes data
     * @returns Promise with the updated configurationitemnotes
     */
    async update(id, configurationItemNotes) {
        this.logger.info('Updating configurationitemnotes', { id, configurationItemNotes });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, configurationItemNotes), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a configurationitemnotes
     * @param id - The configurationitemnotes ID
     * @param configurationItemNotes - The partial configurationitemnotes data to update
     * @returns Promise with the updated configurationitemnotes
     */
    async patch(id, configurationItemNotes) {
        this.logger.info('Patching configurationitemnotes', { id, configurationItemNotes });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, configurationItemNotes), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * List configurationitemnotes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of configurationitemnotes
     */
    async list(query = {}) {
        this.logger.info('Listing configurationitemnotes', { query });
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
exports.ConfigurationItemNotes = ConfigurationItemNotes;
//# sourceMappingURL=configurationitemnotes.js.map