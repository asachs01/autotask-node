"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceCalls = void 0;
const base_1 = require("./base");
/**
 * ServiceCalls entity class for Autotask API
 *
 * Service call dispatching and management
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: service_calls
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ServiceCallsEntity.htm}
 */
class ServiceCalls extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ServiceCalls';
    }
    static getMetadata() {
        return [
            {
                operation: 'createServiceCalls',
                requiredParams: ['serviceCalls'],
                optionalParams: [],
                returnType: 'IServiceCalls',
                endpoint: '/ServiceCalls',
            },
            {
                operation: 'getServiceCalls',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IServiceCalls',
                endpoint: '/ServiceCalls/{id}',
            },
            {
                operation: 'updateServiceCalls',
                requiredParams: ['id', 'serviceCalls'],
                optionalParams: [],
                returnType: 'IServiceCalls',
                endpoint: '/ServiceCalls/{id}',
            },
            {
                operation: 'deleteServiceCalls',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ServiceCalls/{id}',
            },
            {
                operation: 'listServiceCalls',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IServiceCalls[]',
                endpoint: '/ServiceCalls',
            }
        ];
    }
    /**
     * Create a new servicecalls
     * @param serviceCalls - The servicecalls data to create
     * @returns Promise with the created servicecalls
     */
    async create(serviceCalls) {
        this.logger.info('Creating servicecalls', { serviceCalls });
        return this.executeRequest(async () => this.axios.post(this.endpoint, serviceCalls), this.endpoint, 'POST');
    }
    /**
     * Get a servicecalls by ID
     * @param id - The servicecalls ID
     * @returns Promise with the servicecalls data
     */
    async get(id) {
        this.logger.info('Getting servicecalls', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a servicecalls
     * @param id - The servicecalls ID
     * @param serviceCalls - The updated servicecalls data
     * @returns Promise with the updated servicecalls
     */
    async update(id, serviceCalls) {
        this.logger.info('Updating servicecalls', { id, serviceCalls });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, serviceCalls), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a servicecalls
     * @param id - The servicecalls ID
     * @param serviceCalls - The partial servicecalls data to update
     * @returns Promise with the updated servicecalls
     */
    async patch(id, serviceCalls) {
        this.logger.info('Patching servicecalls', { id, serviceCalls });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, serviceCalls), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a servicecalls
     * @param id - The servicecalls ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting servicecalls', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List servicecalls with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of servicecalls
     */
    async list(query = {}) {
        this.logger.info('Listing servicecalls', { query });
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
exports.ServiceCalls = ServiceCalls;
//# sourceMappingURL=servicecalls.js.map