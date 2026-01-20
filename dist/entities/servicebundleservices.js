"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceBundleServices = void 0;
const base_1 = require("./base");
/**
 * ServiceBundleServices entity class for Autotask API
 *
 * Services within service bundles
 * Supported Operations: GET, POST, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ServiceBundleServicesEntity.htm}
 */
class ServiceBundleServices extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ServiceBundleServices';
    }
    static getMetadata() {
        return [
            {
                operation: 'createServiceBundleServices',
                requiredParams: ['serviceBundleServices'],
                optionalParams: [],
                returnType: 'IServiceBundleServices',
                endpoint: '/ServiceBundleServices',
            },
            {
                operation: 'getServiceBundleServices',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IServiceBundleServices',
                endpoint: '/ServiceBundleServices/{id}',
            },
            {
                operation: 'deleteServiceBundleServices',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ServiceBundleServices/{id}',
            },
            {
                operation: 'listServiceBundleServices',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IServiceBundleServices[]',
                endpoint: '/ServiceBundleServices',
            }
        ];
    }
    /**
     * Create a new servicebundleservices
     * @param serviceBundleServices - The servicebundleservices data to create
     * @returns Promise with the created servicebundleservices
     */
    async create(serviceBundleServices) {
        this.logger.info('Creating servicebundleservices', { serviceBundleServices });
        return this.executeRequest(async () => this.axios.post(this.endpoint, serviceBundleServices), this.endpoint, 'POST');
    }
    /**
     * Get a servicebundleservices by ID
     * @param id - The servicebundleservices ID
     * @returns Promise with the servicebundleservices data
     */
    async get(id) {
        this.logger.info('Getting servicebundleservices', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a servicebundleservices
     * @param id - The servicebundleservices ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting servicebundleservices', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List servicebundleservices with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of servicebundleservices
     */
    async list(query = {}) {
        this.logger.info('Listing servicebundleservices', { query });
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
exports.ServiceBundleServices = ServiceBundleServices;
//# sourceMappingURL=servicebundleservices.js.map