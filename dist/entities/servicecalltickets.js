"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceCallTickets = void 0;
const base_1 = require("./base");
/**
 * ServiceCallTickets entity class for Autotask API
 *
 * Tickets associated with service calls
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: service_calls
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ServiceCallTicketsEntity.htm}
 */
class ServiceCallTickets extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ServiceCallTickets';
    }
    static getMetadata() {
        return [
            {
                operation: 'createServiceCallTickets',
                requiredParams: ['serviceCallTickets'],
                optionalParams: [],
                returnType: 'IServiceCallTickets',
                endpoint: '/ServiceCallTickets',
            },
            {
                operation: 'getServiceCallTickets',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IServiceCallTickets',
                endpoint: '/ServiceCallTickets/{id}',
            },
            {
                operation: 'updateServiceCallTickets',
                requiredParams: ['id', 'serviceCallTickets'],
                optionalParams: [],
                returnType: 'IServiceCallTickets',
                endpoint: '/ServiceCallTickets/{id}',
            },
            {
                operation: 'deleteServiceCallTickets',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ServiceCallTickets/{id}',
            },
            {
                operation: 'listServiceCallTickets',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IServiceCallTickets[]',
                endpoint: '/ServiceCallTickets',
            }
        ];
    }
    /**
     * Create a new servicecalltickets
     * @param serviceCallTickets - The servicecalltickets data to create
     * @returns Promise with the created servicecalltickets
     */
    async create(serviceCallTickets) {
        this.logger.info('Creating servicecalltickets', { serviceCallTickets });
        return this.executeRequest(async () => this.axios.post(this.endpoint, serviceCallTickets), this.endpoint, 'POST');
    }
    /**
     * Get a servicecalltickets by ID
     * @param id - The servicecalltickets ID
     * @returns Promise with the servicecalltickets data
     */
    async get(id) {
        this.logger.info('Getting servicecalltickets', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a servicecalltickets
     * @param id - The servicecalltickets ID
     * @param serviceCallTickets - The updated servicecalltickets data
     * @returns Promise with the updated servicecalltickets
     */
    async update(id, serviceCallTickets) {
        this.logger.info('Updating servicecalltickets', { id, serviceCallTickets });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, serviceCallTickets), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a servicecalltickets
     * @param id - The servicecalltickets ID
     * @param serviceCallTickets - The partial servicecalltickets data to update
     * @returns Promise with the updated servicecalltickets
     */
    async patch(id, serviceCallTickets) {
        this.logger.info('Patching servicecalltickets', { id, serviceCallTickets });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, serviceCallTickets), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a servicecalltickets
     * @param id - The servicecalltickets ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting servicecalltickets', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List servicecalltickets with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of servicecalltickets
     */
    async list(query = {}) {
        this.logger.info('Listing servicecalltickets', { query });
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
exports.ServiceCallTickets = ServiceCallTickets;
//# sourceMappingURL=servicecalltickets.js.map