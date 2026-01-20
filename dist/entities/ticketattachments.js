"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketAttachments = void 0;
const base_1 = require("./base");
/**
 * TicketAttachments entity class for Autotask API
 *
 * File attachments for tickets
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketAttachmentsEntity.htm}
 */
class TicketAttachments extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/TicketAttachments';
    }
    static getMetadata() {
        return [
            {
                operation: 'createTicketAttachments',
                requiredParams: ['ticketAttachments'],
                optionalParams: [],
                returnType: 'ITicketAttachments',
                endpoint: '/TicketAttachments',
            },
            {
                operation: 'getTicketAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'ITicketAttachments',
                endpoint: '/TicketAttachments/{id}',
            },
            {
                operation: 'deleteTicketAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/TicketAttachments/{id}',
            },
            {
                operation: 'listTicketAttachments',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'ITicketAttachments[]',
                endpoint: '/TicketAttachments',
            }
        ];
    }
    /**
     * Create a new ticketattachments
     * @param ticketAttachments - The ticketattachments data to create
     * @returns Promise with the created ticketattachments
     */
    async create(ticketAttachments) {
        this.logger.info('Creating ticketattachments', { ticketAttachments });
        return this.executeRequest(async () => this.axios.post(this.endpoint, ticketAttachments), this.endpoint, 'POST');
    }
    /**
     * Get a ticketattachments by ID
     * @param id - The ticketattachments ID
     * @returns Promise with the ticketattachments data
     */
    async get(id) {
        this.logger.info('Getting ticketattachments', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a ticketattachments
     * @param id - The ticketattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting ticketattachments', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List ticketattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of ticketattachments
     */
    async list(query = {}) {
        this.logger.info('Listing ticketattachments', { query });
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
exports.TicketAttachments = TicketAttachments;
//# sourceMappingURL=ticketattachments.js.map