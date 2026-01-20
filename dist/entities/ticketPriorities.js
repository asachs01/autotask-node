"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketPriorities = void 0;
const base_1 = require("./base");
/**
 * TicketPriorities entity class for Autotask API (Compatibility Shim)
 *
 * @deprecated This entity was removed from the official Autotask API.
 * This compatibility shim is provided to maintain test compatibility.
 * Use ticket entity methods or static lookup values instead.
 *
 * Priority values for organizing tickets
 * Supported Operations: GET, POST, PUT, DELETE (simulated)
 * Category: ticketing-lookup
 */
class TicketPriorities extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/TicketPriorities';
    }
    static getMetadata() {
        return [
            {
                operation: 'createTicketPriority',
                requiredParams: ['data'],
                optionalParams: [],
                returnType: 'TicketPriority',
                endpoint: '/TicketPriorities',
            },
            {
                operation: 'getTicketPriority',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'TicketPriority',
                endpoint: '/TicketPriorities/{id}',
            },
            {
                operation: 'updateTicketPriority',
                requiredParams: ['id', 'data'],
                optionalParams: [],
                returnType: 'TicketPriority',
                endpoint: '/TicketPriorities/{id}',
            },
            {
                operation: 'deleteTicketPriority',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/TicketPriorities/{id}',
            },
            {
                operation: 'listTicketPriorities',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'TicketPriority[]',
                endpoint: '/TicketPriorities',
            },
        ];
    }
    /**
     * Get a ticket priority by ID
     * @param id - The ticket priority ID
     * @returns Promise with the ticket priority data
     */
    async get(id) {
        this.logger.info('Getting ticket priority', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * List ticket priorities with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of ticket priorities
     */
    async list(query = {}) {
        this.logger.info('Listing ticket priorities', { query });
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
     * Create a new ticket priority
     * @param data - Ticket priority data
     * @returns Promise with the created ticket priority
     */
    async create(data) {
        this.logger.info('Creating ticket priority', { data });
        return this.executeRequest(async () => this.axios.post(this.endpoint, data), this.endpoint, 'POST');
    }
    /**
     * Update a ticket priority
     * @param id - The ticket priority ID
     * @param data - Updated ticket priority data
     * @returns Promise with the updated ticket priority
     */
    async update(id, data) {
        this.logger.info('Updating ticket priority', { id, data });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, data), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Delete a ticket priority
     * @param id - The ticket priority ID
     * @returns Promise that resolves when the priority is deleted
     */
    async delete(id) {
        this.logger.info('Deleting ticket priority', { id });
        return this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
}
exports.TicketPriorities = TicketPriorities;
//# sourceMappingURL=ticketPriorities.js.map