"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationItemNoteAttachments = void 0;
const base_1 = require("./base");
/**
 * ConfigurationItemNoteAttachments entity class for Autotask API
 *
 * File attachments for configuration item notes
 * Supported Operations: GET, POST, DELETE
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ConfigurationItemNoteAttachmentsEntity.htm}
 */
class ConfigurationItemNoteAttachments extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ConfigurationItemNoteAttachments';
    }
    static getMetadata() {
        return [
            {
                operation: 'createConfigurationItemNoteAttachments',
                requiredParams: ['configurationItemNoteAttachments'],
                optionalParams: [],
                returnType: 'IConfigurationItemNoteAttachments',
                endpoint: '/ConfigurationItemNoteAttachments',
            },
            {
                operation: 'getConfigurationItemNoteAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IConfigurationItemNoteAttachments',
                endpoint: '/ConfigurationItemNoteAttachments/{id}',
            },
            {
                operation: 'deleteConfigurationItemNoteAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ConfigurationItemNoteAttachments/{id}',
            },
            {
                operation: 'listConfigurationItemNoteAttachments',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IConfigurationItemNoteAttachments[]',
                endpoint: '/ConfigurationItemNoteAttachments',
            }
        ];
    }
    /**
     * Create a new configurationitemnoteattachments
     * @param configurationItemNoteAttachments - The configurationitemnoteattachments data to create
     * @returns Promise with the created configurationitemnoteattachments
     */
    async create(configurationItemNoteAttachments) {
        this.logger.info('Creating configurationitemnoteattachments', { configurationItemNoteAttachments });
        return this.executeRequest(async () => this.axios.post(this.endpoint, configurationItemNoteAttachments), this.endpoint, 'POST');
    }
    /**
     * Get a configurationitemnoteattachments by ID
     * @param id - The configurationitemnoteattachments ID
     * @returns Promise with the configurationitemnoteattachments data
     */
    async get(id) {
        this.logger.info('Getting configurationitemnoteattachments', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a configurationitemnoteattachments
     * @param id - The configurationitemnoteattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting configurationitemnoteattachments', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List configurationitemnoteattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of configurationitemnoteattachments
     */
    async list(query = {}) {
        this.logger.info('Listing configurationitemnoteattachments', { query });
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
exports.ConfigurationItemNoteAttachments = ConfigurationItemNoteAttachments;
//# sourceMappingURL=configurationitemnoteattachments.js.map