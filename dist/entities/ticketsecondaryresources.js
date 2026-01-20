"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketSecondaryResources = void 0;
const base_1 = require("./base");
/**
 * TicketSecondaryResources entity class for Autotask API
 *
 * Secondary resource assignments for tickets
 * Supported Operations: GET, POST, DELETE
 * Category: ticketing
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketSecondaryResourcesEntity.htm}
 */
class TicketSecondaryResources extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/TicketSecondaryResources';
    }
    static getMetadata() {
        return [
            {
                operation: 'createTicketSecondaryResources',
                requiredParams: ['ticketSecondaryResources'],
                optionalParams: [],
                returnType: 'ITicketSecondaryResources',
                endpoint: '/TicketSecondaryResources',
            },
            {
                operation: 'getTicketSecondaryResources',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'ITicketSecondaryResources',
                endpoint: '/TicketSecondaryResources/{id}',
            },
            {
                operation: 'deleteTicketSecondaryResources',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/TicketSecondaryResources/{id}',
            },
            {
                operation: 'listTicketSecondaryResources',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'ITicketSecondaryResources[]',
                endpoint: '/TicketSecondaryResources',
            }
        ];
    }
    /**
     * Create a new ticketsecondaryresources
     * @param ticketSecondaryResources - The ticketsecondaryresources data to create
     * @returns Promise with the created ticketsecondaryresources
     */
    async create(ticketSecondaryResources) {
        this.logger.info('Creating ticketsecondaryresources', { ticketSecondaryResources });
        return this.executeRequest(async () => this.axios.post(this.endpoint, ticketSecondaryResources), this.endpoint, 'POST');
    }
    /**
     * Get a ticketsecondaryresources by ID
     * @param id - The ticketsecondaryresources ID
     * @returns Promise with the ticketsecondaryresources data
     */
    async get(id) {
        this.logger.info('Getting ticketsecondaryresources', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a ticketsecondaryresources
     * @param id - The ticketsecondaryresources ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting ticketsecondaryresources', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List ticketsecondaryresources with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of ticketsecondaryresources
     */
    async list(query = {}) {
        this.logger.info('Listing ticketsecondaryresources', { query });
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
exports.TicketSecondaryResources = TicketSecondaryResources;
//# sourceMappingURL=ticketsecondaryresources.js.map