"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketStatuses = void 0;
const base_1 = require("./base");
/**
 * TicketStatuses entity class for Autotask API (Compatibility Shim)
 *
 * @deprecated This entity was removed from the official Autotask API.
 * This compatibility shim is provided to maintain test compatibility.
 * Use ticket entity methods or static lookup values instead.
 *
 * Status values for organizing tickets
 * Supported Operations: GET, POST, PUT, DELETE (simulated)
 * Category: ticketing-lookup
 */
class TicketStatuses extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/TicketStatuses';
    }
    static getMetadata() {
        return [
            {
                operation: 'createTicketStatus',
                requiredParams: ['data'],
                optionalParams: [],
                returnType: 'TicketStatus',
                endpoint: '/TicketStatuses',
            },
            {
                operation: 'getTicketStatus',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'TicketStatus',
                endpoint: '/TicketStatuses/{id}',
            },
            {
                operation: 'updateTicketStatus',
                requiredParams: ['id', 'data'],
                optionalParams: [],
                returnType: 'TicketStatus',
                endpoint: '/TicketStatuses/{id}',
            },
            {
                operation: 'deleteTicketStatus',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/TicketStatuses/{id}',
            },
            {
                operation: 'listTicketStatuses',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'TicketStatus[]',
                endpoint: '/TicketStatuses',
            },
        ];
    }
    /**
     * Get a ticket status by ID
     * @param id - The ticket status ID
     * @returns Promise with the ticket status data
     */
    async get(id) {
        this.logger.info('Getting ticket status', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * List ticket statuses with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of ticket statuses
     */
    async list(query = {}) {
        this.logger.info('Listing ticket statuses', { query });
        const params = {};
        // Handle simple page and pageSize parameters
        if (query.page)
            params.page = query.page;
        if (query.pageSize)
            params.pageSize = query.pageSize;
        // Handle filters and sorting
        if (query.filter && Object.keys(query.filter).length > 0) {
            params.search = JSON.stringify(query.filter);
        }
        if (query.sort)
            params.sort = query.sort;
        return this.executeRequest(async () => this.axios.get(this.endpoint, { params }), this.endpoint, 'GET');
    }
    /**
     * Create a new ticket status
     * @param data - Ticket status data
     * @returns Promise with the created ticket status
     */
    async create(data) {
        this.logger.info('Creating ticket status', { data });
        return this.executeRequest(async () => this.axios.post(this.endpoint, data), this.endpoint, 'POST');
    }
    /**
     * Update a ticket status
     * @param id - The ticket status ID
     * @param data - Updated ticket status data
     * @returns Promise with the updated ticket status
     */
    async update(id, data) {
        this.logger.info('Updating ticket status', { id, data });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, data), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Delete a ticket status
     * @param id - The ticket status ID
     * @returns Promise that resolves when the status is deleted
     */
    async delete(id) {
        this.logger.info('Deleting ticket status', { id });
        return this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
}
exports.TicketStatuses = TicketStatuses;
//# sourceMappingURL=ticketStatuses.js.map