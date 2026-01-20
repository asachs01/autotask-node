"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tickets = void 0;
const base_1 = require("./base");
/**
 * Tickets entity class for Autotask API
 *
 * Service tickets and support requests
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: core
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketsEntity.htm}
 */
class Tickets extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/Tickets';
    }
    static getMetadata() {
        return [
            {
                operation: 'createTickets',
                requiredParams: ['tickets'],
                optionalParams: [],
                returnType: 'ITickets',
                endpoint: '/Tickets',
            },
            {
                operation: 'getTickets',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'ITickets',
                endpoint: '/Tickets/{id}',
            },
            {
                operation: 'updateTickets',
                requiredParams: ['id', 'tickets'],
                optionalParams: [],
                returnType: 'ITickets',
                endpoint: '/Tickets/{id}',
            },
            {
                operation: 'listTickets',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'ITickets[]',
                endpoint: '/Tickets',
            },
        ];
    }
    /**
     * Create a new tickets
     * @param tickets - The tickets data to create
     * @returns Promise with the created tickets
     */
    async create(tickets) {
        this.logger.info('Creating tickets', { tickets });
        return this.executeRequest(async () => this.axios.post(this.endpoint, tickets), this.endpoint, 'POST');
    }
    /**
     * Get a tickets by ID
     * @param id - The tickets ID
     * @returns Promise with the tickets data
     */
    async get(id) {
        this.logger.info('Getting tickets', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a tickets
     * @param id - The tickets ID
     * @param tickets - The updated tickets data
     * @returns Promise with the updated tickets
     */
    async update(id, tickets) {
        this.logger.info('Updating tickets', { id, tickets });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, tickets), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a tickets
     * @param id - The tickets ID
     * @param tickets - The partial tickets data to update
     * @returns Promise with the updated tickets
     */
    async patch(id, tickets) {
        this.logger.info('Patching tickets', { id, tickets });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, tickets), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a tickets
     * @param id - The tickets ID to delete
     * @returns Promise with void response
     */
    async delete(id) {
        this.logger.info('Deleting tickets', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List tickets with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of tickets
     */
    async list(query = {}) {
        this.logger.info('Listing tickets', { query });
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
exports.Tickets = Tickets;
//# sourceMappingURL=tickets.js.map