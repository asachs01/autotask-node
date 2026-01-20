"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentConfigurationItemAssociations = void 0;
const base_1 = require("./base");
/**
 * DocumentConfigurationItemAssociations entity class for Autotask API
 *
 * Associations between documents and configuration items
 * Supported Operations: GET, POST, DELETE
 * Category: knowledge
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DocumentConfigurationItemAssociationsEntity.htm}
 */
class DocumentConfigurationItemAssociations extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/DocumentConfigurationItemAssociations';
    }
    static getMetadata() {
        return [
            {
                operation: 'createDocumentConfigurationItemAssociations',
                requiredParams: ['documentConfigurationItemAssociations'],
                optionalParams: [],
                returnType: 'IDocumentConfigurationItemAssociations',
                endpoint: '/DocumentConfigurationItemAssociations',
            },
            {
                operation: 'getDocumentConfigurationItemAssociations',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IDocumentConfigurationItemAssociations',
                endpoint: '/DocumentConfigurationItemAssociations/{id}',
            },
            {
                operation: 'deleteDocumentConfigurationItemAssociations',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/DocumentConfigurationItemAssociations/{id}',
            },
            {
                operation: 'listDocumentConfigurationItemAssociations',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IDocumentConfigurationItemAssociations[]',
                endpoint: '/DocumentConfigurationItemAssociations',
            }
        ];
    }
    /**
     * Create a new documentconfigurationitemassociations
     * @param documentConfigurationItemAssociations - The documentconfigurationitemassociations data to create
     * @returns Promise with the created documentconfigurationitemassociations
     */
    async create(documentConfigurationItemAssociations) {
        this.logger.info('Creating documentconfigurationitemassociations', { documentConfigurationItemAssociations });
        return this.executeRequest(async () => this.axios.post(this.endpoint, documentConfigurationItemAssociations), this.endpoint, 'POST');
    }
    /**
     * Get a documentconfigurationitemassociations by ID
     * @param id - The documentconfigurationitemassociations ID
     * @returns Promise with the documentconfigurationitemassociations data
     */
    async get(id) {
        this.logger.info('Getting documentconfigurationitemassociations', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a documentconfigurationitemassociations
     * @param id - The documentconfigurationitemassociations ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting documentconfigurationitemassociations', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List documentconfigurationitemassociations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of documentconfigurationitemassociations
     */
    async list(query = {}) {
        this.logger.info('Listing documentconfigurationitemassociations', { query });
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
exports.DocumentConfigurationItemAssociations = DocumentConfigurationItemAssociations;
//# sourceMappingURL=documentconfigurationitemassociations.js.map