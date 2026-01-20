"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketNotes = void 0;
const base_1 = require("./base");
/**
 * TicketNotes entity class for Autotask API
 *
 * Notes for tickets
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketNotesEntity.htm}
 */
class TicketNotes extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/TicketNotes';
    }
    static getMetadata() {
        return [
            {
                operation: 'createTicketNotes',
                requiredParams: ['ticketNotes'],
                optionalParams: [],
                returnType: 'ITicketNotes',
                endpoint: '/TicketNotes',
            },
            {
                operation: 'getTicketNotes',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'ITicketNotes',
                endpoint: '/TicketNotes/{id}',
            },
            {
                operation: 'updateTicketNotes',
                requiredParams: ['id', 'ticketNotes'],
                optionalParams: [],
                returnType: 'ITicketNotes',
                endpoint: '/TicketNotes/{id}',
            },
            {
                operation: 'listTicketNotes',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'ITicketNotes[]',
                endpoint: '/TicketNotes',
            }
        ];
    }
    /**
     * Create a new ticketnotes
     * @param ticketNotes - The ticketnotes data to create
     * @returns Promise with the created ticketnotes
     */
    async create(ticketNotes) {
        this.logger.info('Creating ticketnotes', { ticketNotes });
        return this.executeRequest(async () => this.axios.post(this.endpoint, ticketNotes), this.endpoint, 'POST');
    }
    /**
     * Get a ticketnotes by ID
     * @param id - The ticketnotes ID
     * @returns Promise with the ticketnotes data
     */
    async get(id) {
        this.logger.info('Getting ticketnotes', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a ticketnotes
     * @param id - The ticketnotes ID
     * @param ticketNotes - The updated ticketnotes data
     * @returns Promise with the updated ticketnotes
     */
    async update(id, ticketNotes) {
        this.logger.info('Updating ticketnotes', { id, ticketNotes });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, ticketNotes), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a ticketnotes
     * @param id - The ticketnotes ID
     * @param ticketNotes - The partial ticketnotes data to update
     * @returns Promise with the updated ticketnotes
     */
    async patch(id, ticketNotes) {
        this.logger.info('Patching ticketnotes', { id, ticketNotes });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, ticketNotes), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * List ticketnotes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of ticketnotes
     */
    async list(query = {}) {
        this.logger.info('Listing ticketnotes', { query });
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
exports.TicketNotes = TicketNotes;
//# sourceMappingURL=ticketnotes.js.map