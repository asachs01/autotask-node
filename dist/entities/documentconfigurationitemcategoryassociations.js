"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentConfigurationItemCategoryAssociations = void 0;
const base_1 = require("./base");
/**
 * DocumentConfigurationItemCategoryAssociations entity class for Autotask API
 *
 * Associations between documents and configuration item categories
 * Supported Operations: GET, POST, DELETE
 * Category: knowledge
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DocumentConfigurationItemCategoryAssociationsEntity.htm}
 */
class DocumentConfigurationItemCategoryAssociations extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/DocumentConfigurationItemCategoryAssociations';
    }
    static getMetadata() {
        return [
            {
                operation: 'createDocumentConfigurationItemCategoryAssociations',
                requiredParams: ['documentConfigurationItemCategoryAssociations'],
                optionalParams: [],
                returnType: 'IDocumentConfigurationItemCategoryAssociations',
                endpoint: '/DocumentConfigurationItemCategoryAssociations',
            },
            {
                operation: 'getDocumentConfigurationItemCategoryAssociations',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IDocumentConfigurationItemCategoryAssociations',
                endpoint: '/DocumentConfigurationItemCategoryAssociations/{id}',
            },
            {
                operation: 'deleteDocumentConfigurationItemCategoryAssociations',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/DocumentConfigurationItemCategoryAssociations/{id}',
            },
            {
                operation: 'listDocumentConfigurationItemCategoryAssociations',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IDocumentConfigurationItemCategoryAssociations[]',
                endpoint: '/DocumentConfigurationItemCategoryAssociations',
            }
        ];
    }
    /**
     * Create a new documentconfigurationitemcategoryassociations
     * @param documentConfigurationItemCategoryAssociations - The documentconfigurationitemcategoryassociations data to create
     * @returns Promise with the created documentconfigurationitemcategoryassociations
     */
    async create(documentConfigurationItemCategoryAssociations) {
        this.logger.info('Creating documentconfigurationitemcategoryassociations', { documentConfigurationItemCategoryAssociations });
        return this.executeRequest(async () => this.axios.post(this.endpoint, documentConfigurationItemCategoryAssociations), this.endpoint, 'POST');
    }
    /**
     * Get a documentconfigurationitemcategoryassociations by ID
     * @param id - The documentconfigurationitemcategoryassociations ID
     * @returns Promise with the documentconfigurationitemcategoryassociations data
     */
    async get(id) {
        this.logger.info('Getting documentconfigurationitemcategoryassociations', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a documentconfigurationitemcategoryassociations
     * @param id - The documentconfigurationitemcategoryassociations ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting documentconfigurationitemcategoryassociations', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List documentconfigurationitemcategoryassociations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of documentconfigurationitemcategoryassociations
     */
    async list(query = {}) {
        this.logger.info('Listing documentconfigurationitemcategoryassociations', { query });
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
exports.DocumentConfigurationItemCategoryAssociations = DocumentConfigurationItemCategoryAssociations;
//# sourceMappingURL=documentconfigurationitemcategoryassociations.js.map