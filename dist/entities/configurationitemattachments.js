"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationItemAttachments = void 0;
const base_1 = require("./base");
/**
 * ConfigurationItemAttachments entity class for Autotask API
 *
 * File attachments for configuration items
 * Supported Operations: GET, POST, DELETE
 * Category: configuration
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ConfigurationItemAttachmentsEntity.htm}
 */
class ConfigurationItemAttachments extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ConfigurationItemAttachments';
    }
    static getMetadata() {
        return [
            {
                operation: 'createConfigurationItemAttachments',
                requiredParams: ['configurationItemAttachments'],
                optionalParams: [],
                returnType: 'IConfigurationItemAttachments',
                endpoint: '/ConfigurationItemAttachments',
            },
            {
                operation: 'getConfigurationItemAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IConfigurationItemAttachments',
                endpoint: '/ConfigurationItemAttachments/{id}',
            },
            {
                operation: 'deleteConfigurationItemAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ConfigurationItemAttachments/{id}',
            },
            {
                operation: 'listConfigurationItemAttachments',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IConfigurationItemAttachments[]',
                endpoint: '/ConfigurationItemAttachments',
            }
        ];
    }
    /**
     * Create a new configurationitemattachments
     * @param configurationItemAttachments - The configurationitemattachments data to create
     * @returns Promise with the created configurationitemattachments
     */
    async create(configurationItemAttachments) {
        this.logger.info('Creating configurationitemattachments', { configurationItemAttachments });
        return this.executeRequest(async () => this.axios.post(this.endpoint, configurationItemAttachments), this.endpoint, 'POST');
    }
    /**
     * Get a configurationitemattachments by ID
     * @param id - The configurationitemattachments ID
     * @returns Promise with the configurationitemattachments data
     */
    async get(id) {
        this.logger.info('Getting configurationitemattachments', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a configurationitemattachments
     * @param id - The configurationitemattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting configurationitemattachments', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List configurationitemattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of configurationitemattachments
     */
    async list(query = {}) {
        this.logger.info('Listing configurationitemattachments', { query });
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
exports.ConfigurationItemAttachments = ConfigurationItemAttachments;
//# sourceMappingURL=configurationitemattachments.js.map