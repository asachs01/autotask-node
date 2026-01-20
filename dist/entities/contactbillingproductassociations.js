"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactBillingProductAssociations = void 0;
const base_1 = require("./base");
/**
 * ContactBillingProductAssociations entity class for Autotask API
 *
 * Associations between contacts and billing products
 * Supported Operations: GET, POST, DELETE
 * Category: associations
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContactBillingProductAssociationsEntity.htm}
 */
class ContactBillingProductAssociations extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ContactBillingProductAssociations';
    }
    static getMetadata() {
        return [
            {
                operation: 'createContactBillingProductAssociations',
                requiredParams: ['contactBillingProductAssociations'],
                optionalParams: [],
                returnType: 'IContactBillingProductAssociations',
                endpoint: '/ContactBillingProductAssociations',
            },
            {
                operation: 'getContactBillingProductAssociations',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IContactBillingProductAssociations',
                endpoint: '/ContactBillingProductAssociations/{id}',
            },
            {
                operation: 'deleteContactBillingProductAssociations',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ContactBillingProductAssociations/{id}',
            },
            {
                operation: 'listContactBillingProductAssociations',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IContactBillingProductAssociations[]',
                endpoint: '/ContactBillingProductAssociations',
            }
        ];
    }
    /**
     * Create a new contactbillingproductassociations
     * @param contactBillingProductAssociations - The contactbillingproductassociations data to create
     * @returns Promise with the created contactbillingproductassociations
     */
    async create(contactBillingProductAssociations) {
        this.logger.info('Creating contactbillingproductassociations', { contactBillingProductAssociations });
        return this.executeRequest(async () => this.axios.post(this.endpoint, contactBillingProductAssociations), this.endpoint, 'POST');
    }
    /**
     * Get a contactbillingproductassociations by ID
     * @param id - The contactbillingproductassociations ID
     * @returns Promise with the contactbillingproductassociations data
     */
    async get(id) {
        this.logger.info('Getting contactbillingproductassociations', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a contactbillingproductassociations
     * @param id - The contactbillingproductassociations ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting contactbillingproductassociations', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List contactbillingproductassociations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contactbillingproductassociations
     */
    async list(query = {}) {
        this.logger.info('Listing contactbillingproductassociations', { query });
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
exports.ContactBillingProductAssociations = ContactBillingProductAssociations;
//# sourceMappingURL=contactbillingproductassociations.js.map