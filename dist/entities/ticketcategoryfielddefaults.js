"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketCategoryFieldDefaults = void 0;
const base_1 = require("./base");
/**
 * TicketCategoryFieldDefaults entity class for Autotask API
 *
 * Default field values for ticket categories
 * Supported Operations: GET
 * Category: ticketing
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketCategoryFieldDefaultsEntity.htm}
 */
class TicketCategoryFieldDefaults extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/TicketCategoryFieldDefaults';
    }
    static getMetadata() {
        return [
            {
                operation: 'getTicketCategoryFieldDefaults',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'ITicketCategoryFieldDefaults',
                endpoint: '/TicketCategoryFieldDefaults/{id}',
            },
            {
                operation: 'listTicketCategoryFieldDefaults',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'ITicketCategoryFieldDefaults[]',
                endpoint: '/TicketCategoryFieldDefaults',
            }
        ];
    }
    /**
     * Get a ticketcategoryfielddefaults by ID
     * @param id - The ticketcategoryfielddefaults ID
     * @returns Promise with the ticketcategoryfielddefaults data
     */
    async get(id) {
        this.logger.info('Getting ticketcategoryfielddefaults', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * List ticketcategoryfielddefaults with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of ticketcategoryfielddefaults
     */
    async list(query = {}) {
        this.logger.info('Listing ticketcategoryfielddefaults', { query });
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
exports.TicketCategoryFieldDefaults = TicketCategoryFieldDefaults;
//# sourceMappingURL=ticketcategoryfielddefaults.js.map