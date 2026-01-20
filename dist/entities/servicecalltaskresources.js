"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceCallTaskResources = void 0;
const base_1 = require("./base");
/**
 * ServiceCallTaskResources entity class for Autotask API
 *
 * Resource assignments for service call tasks
 * Supported Operations: GET, POST, DELETE
 * Category: service_calls
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ServiceCallTaskResourceEntity.htm}
 */
class ServiceCallTaskResources extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ServiceCallTaskResources';
    }
    static getMetadata() {
        return [
            {
                operation: 'createServiceCallTaskResources',
                requiredParams: ['serviceCallTaskResources'],
                optionalParams: [],
                returnType: 'IServiceCallTaskResources',
                endpoint: '/ServiceCallTaskResources',
            },
            {
                operation: 'getServiceCallTaskResources',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IServiceCallTaskResources',
                endpoint: '/ServiceCallTaskResources/{id}',
            },
            {
                operation: 'deleteServiceCallTaskResources',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ServiceCallTaskResources/{id}',
            },
            {
                operation: 'listServiceCallTaskResources',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IServiceCallTaskResources[]',
                endpoint: '/ServiceCallTaskResources',
            }
        ];
    }
    /**
     * Create a new servicecalltaskresources
     * @param serviceCallTaskResources - The servicecalltaskresources data to create
     * @returns Promise with the created servicecalltaskresources
     */
    async create(serviceCallTaskResources) {
        this.logger.info('Creating servicecalltaskresources', { serviceCallTaskResources });
        return this.executeRequest(async () => this.axios.post(this.endpoint, serviceCallTaskResources), this.endpoint, 'POST');
    }
    /**
     * Get a servicecalltaskresources by ID
     * @param id - The servicecalltaskresources ID
     * @returns Promise with the servicecalltaskresources data
     */
    async get(id) {
        this.logger.info('Getting servicecalltaskresources', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a servicecalltaskresources
     * @param id - The servicecalltaskresources ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting servicecalltaskresources', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List servicecalltaskresources with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of servicecalltaskresources
     */
    async list(query = {}) {
        this.logger.info('Listing servicecalltaskresources', { query });
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
exports.ServiceCallTaskResources = ServiceCallTaskResources;
//# sourceMappingURL=servicecalltaskresources.js.map