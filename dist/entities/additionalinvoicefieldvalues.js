"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdditionalInvoiceFieldValues = void 0;
const base_1 = require("./base");
/**
 * AdditionalInvoiceFieldValues entity class for Autotask API
 *
 * Additional invoice field values
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: associations
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/AdditionalInvoiceFieldValuesEntity.htm}
 */
class AdditionalInvoiceFieldValues extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/AdditionalInvoiceFieldValues';
    }
    static getMetadata() {
        return [
            {
                operation: 'createAdditionalInvoiceFieldValues',
                requiredParams: ['additionalInvoiceFieldValues'],
                optionalParams: [],
                returnType: 'IAdditionalInvoiceFieldValues',
                endpoint: '/AdditionalInvoiceFieldValues',
            },
            {
                operation: 'getAdditionalInvoiceFieldValues',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IAdditionalInvoiceFieldValues',
                endpoint: '/AdditionalInvoiceFieldValues/{id}',
            },
            {
                operation: 'updateAdditionalInvoiceFieldValues',
                requiredParams: ['id', 'additionalInvoiceFieldValues'],
                optionalParams: [],
                returnType: 'IAdditionalInvoiceFieldValues',
                endpoint: '/AdditionalInvoiceFieldValues/{id}',
            },
            {
                operation: 'listAdditionalInvoiceFieldValues',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IAdditionalInvoiceFieldValues[]',
                endpoint: '/AdditionalInvoiceFieldValues',
            }
        ];
    }
    /**
     * Create a new additionalinvoicefieldvalues
     * @param additionalInvoiceFieldValues - The additionalinvoicefieldvalues data to create
     * @returns Promise with the created additionalinvoicefieldvalues
     */
    async create(additionalInvoiceFieldValues) {
        this.logger.info('Creating additionalinvoicefieldvalues', { additionalInvoiceFieldValues });
        return this.executeRequest(async () => this.axios.post(this.endpoint, additionalInvoiceFieldValues), this.endpoint, 'POST');
    }
    /**
     * Get a additionalinvoicefieldvalues by ID
     * @param id - The additionalinvoicefieldvalues ID
     * @returns Promise with the additionalinvoicefieldvalues data
     */
    async get(id) {
        this.logger.info('Getting additionalinvoicefieldvalues', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a additionalinvoicefieldvalues
     * @param id - The additionalinvoicefieldvalues ID
     * @param additionalInvoiceFieldValues - The updated additionalinvoicefieldvalues data
     * @returns Promise with the updated additionalinvoicefieldvalues
     */
    async update(id, additionalInvoiceFieldValues) {
        this.logger.info('Updating additionalinvoicefieldvalues', { id, additionalInvoiceFieldValues });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, additionalInvoiceFieldValues), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a additionalinvoicefieldvalues
     * @param id - The additionalinvoicefieldvalues ID
     * @param additionalInvoiceFieldValues - The partial additionalinvoicefieldvalues data to update
     * @returns Promise with the updated additionalinvoicefieldvalues
     */
    async patch(id, additionalInvoiceFieldValues) {
        this.logger.info('Patching additionalinvoicefieldvalues', { id, additionalInvoiceFieldValues });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, additionalInvoiceFieldValues), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * List additionalinvoicefieldvalues with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of additionalinvoicefieldvalues
     */
    async list(query = {}) {
        this.logger.info('Listing additionalinvoicefieldvalues', { query });
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
exports.AdditionalInvoiceFieldValues = AdditionalInvoiceFieldValues;
//# sourceMappingURL=additionalinvoicefieldvalues.js.map