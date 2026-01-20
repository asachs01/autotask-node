"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketNoteAttachments = void 0;
const base_1 = require("./base");
/**
 * TicketNoteAttachments entity class for Autotask API
 *
 * File attachments for ticket notes
 * Supported Operations: GET, POST, DELETE
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketNoteAttachmentsEntity.htm}
 */
class TicketNoteAttachments extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/TicketNoteAttachments';
    }
    static getMetadata() {
        return [
            {
                operation: 'createTicketNoteAttachments',
                requiredParams: ['ticketNoteAttachments'],
                optionalParams: [],
                returnType: 'ITicketNoteAttachments',
                endpoint: '/TicketNoteAttachments',
            },
            {
                operation: 'getTicketNoteAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'ITicketNoteAttachments',
                endpoint: '/TicketNoteAttachments/{id}',
            },
            {
                operation: 'deleteTicketNoteAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/TicketNoteAttachments/{id}',
            },
            {
                operation: 'listTicketNoteAttachments',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'ITicketNoteAttachments[]',
                endpoint: '/TicketNoteAttachments',
            }
        ];
    }
    /**
     * Create a new ticketnoteattachments
     * @param ticketNoteAttachments - The ticketnoteattachments data to create
     * @returns Promise with the created ticketnoteattachments
     */
    async create(ticketNoteAttachments) {
        this.logger.info('Creating ticketnoteattachments', { ticketNoteAttachments });
        return this.executeRequest(async () => this.axios.post(this.endpoint, ticketNoteAttachments), this.endpoint, 'POST');
    }
    /**
     * Get a ticketnoteattachments by ID
     * @param id - The ticketnoteattachments ID
     * @returns Promise with the ticketnoteattachments data
     */
    async get(id) {
        this.logger.info('Getting ticketnoteattachments', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a ticketnoteattachments
     * @param id - The ticketnoteattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting ticketnoteattachments', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List ticketnoteattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of ticketnoteattachments
     */
    async list(query = {}) {
        this.logger.info('Listing ticketnoteattachments', { query });
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
exports.TicketNoteAttachments = TicketNoteAttachments;
//# sourceMappingURL=ticketnoteattachments.js.map