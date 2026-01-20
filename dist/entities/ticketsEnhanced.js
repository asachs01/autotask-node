"use strict";
/**
 * Enhanced Tickets Entity with Advanced Query Builder Support
 * Demonstrates the new query capabilities for Autotask API
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsEnhanced = void 0;
const queryableEntity_1 = require("../utils/queryableEntity");
/**
 * Enhanced Tickets entity with advanced query capabilities
 */
class TicketsEnhanced extends queryableEntity_1.QueryableEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger);
        this.requestHandler = requestHandler;
        this.endpoint = '/Tickets';
        this.entityName = 'Tickets';
    }
    static getMetadata() {
        return [
            {
                operation: 'createTicket',
                requiredParams: ['ticket'],
                optionalParams: [],
                returnType: 'Ticket',
                endpoint: '/Tickets',
            },
            {
                operation: 'getTicket',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'Ticket',
                endpoint: '/Tickets/{id}',
            },
            {
                operation: 'updateTicket',
                requiredParams: ['id', 'ticket'],
                optionalParams: [],
                returnType: 'Ticket',
                endpoint: '/Tickets/{id}',
            },
            {
                operation: 'deleteTicket',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/Tickets/{id}',
            },
            {
                operation: 'listTickets',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'Ticket[]',
                endpoint: '/Tickets',
            },
            {
                operation: 'queryTickets',
                requiredParams: [],
                optionalParams: ['queryBuilder'],
                returnType: 'QueryResult<Ticket>',
                endpoint: '/Tickets/query',
            },
        ];
    }
    // TRADITIONAL CRUD OPERATIONS
    async create(ticket) {
        this.logger.info('Creating ticket', { ticket });
        const response = await this.axios.post(this.endpoint, ticket);
        return { data: response.data };
    }
    async get(id) {
        this.logger.info('Getting ticket', { id });
        const response = await this.axios.get(`${this.endpoint}/${id}`);
        return { data: response.data };
    }
    async update(id, ticket) {
        this.logger.info('Updating ticket', { id, ticket });
        const response = await this.axios.put(`${this.endpoint}/${id}`, ticket);
        return { data: response.data };
    }
    async delete(id) {
        this.logger.info('Deleting ticket', { id });
        await this.axios.delete(`${this.endpoint}/${id}`);
    }
    async list(query = {}) {
        this.logger.info('Listing tickets', { query });
        const searchBody = {};
        // Ensure there's a filter - Autotask API requires a filter
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
            // If filter is provided as an object, convert to array format expected by API
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
        this.logger.info('Listing tickets with search body', { searchBody });
        const response = await this.axios.post(`${this.endpoint}/query`, searchBody);
        return { data: response.data };
    }
    // ENHANCED QUERY METHODS
    /**
     * Find tickets by status
     */
    async findByStatus(status) {
        return this.query()
            .where('status', 'eq', status)
            .orderBy('createdDate', 'desc')
            .execute();
    }
    /**
     * Find tickets by account
     */
    async findByAccount(accountId) {
        return this.query()
            .where('accountId', 'eq', accountId)
            .orderBy('lastActivityDate', 'desc')
            .execute();
    }
    /**
     * Find open tickets assigned to a resource
     */
    async findOpenTicketsForResource(resourceId) {
        return this.query()
            .where('assignedResourceId', 'eq', resourceId)
            .whereIn('status', [1, 5, 8]) // Common open status IDs
            .orderBy('priority', 'desc')
            .orderBy('dueDateTime', 'asc')
            .execute();
    }
    /**
     * Find overdue tickets
     */
    async findOverdueTickets() {
        const now = new Date().toISOString();
        return this.query()
            .where('dueDateTime', 'lt', now)
            .whereIn('status', [1, 5, 8]) // Open statuses
            .orderBy('dueDateTime', 'asc')
            .execute();
    }
    /**
     * Find tickets created in date range
     */
    async findTicketsInDateRange(startDate, endDate) {
        return this.query()
            .whereBetween('createdDate', startDate, endDate)
            .orderBy('createdDate', 'desc')
            .execute();
    }
    /**
     * Find high priority tickets
     */
    async findHighPriorityTickets() {
        return this.query()
            .whereIn('priority', [1, 2]) // High and Critical priorities
            .whereIn('status', [1, 5, 8]) // Open statuses
            .orderBy('priority', 'asc')
            .orderBy('createdDate', 'asc')
            .execute();
    }
    /**
     * Find tickets with complex conditions
     */
    async findComplexTickets() {
        return this.query()
            .where('accountId', 'eq', 123)
            .and(builder => {
            builder.where('priority', 'eq', 1).or(subBuilder => {
                subBuilder.where('status', 'eq', 1).where('estimatedHours', 'gt', 10);
            });
        })
            .orderBy('createdDate', 'desc')
            .limit(50)
            .execute();
    }
    /**
     * Search tickets by title or description
     */
    async searchTickets(searchTerm) {
        return this.query()
            .or(builder => {
            builder
                .where('title', 'contains', searchTerm)
                .where('description', 'contains', searchTerm);
        })
            .orderBy('lastActivityDate', 'desc')
            .execute();
    }
    /**
     * Find tickets with specific custom field values
     */
    async findTicketsWithCustomField(fieldName, value) {
        return this.query()
            .where(fieldName, 'eq', value)
            .orderBy('createdDate', 'desc')
            .execute();
    }
    /**
     * Get ticket statistics
     */
    async getTicketStats() {
        const [totalCount, openCount, closedCount, overdueCount] = await Promise.all([
            this.countAll(),
            this.query().whereIn('status', [1, 5, 8]).count(),
            this.query().where('status', 'eq', 5).count(), // Assuming 5 is closed
            this.query()
                .where('dueDateTime', 'lt', new Date().toISOString())
                .whereIn('status', [1, 5, 8])
                .count(),
        ]);
        return {
            total: totalCount,
            open: openCount,
            closed: closedCount,
            overdue: overdueCount,
        };
    }
    /**
     * Find tickets with includes (related data)
     */
    async findTicketsWithAccount(accountId) {
        const query = this.query()
            .include('Account', ['companyName', 'phone', 'city'])
            .include('AssignedResource', ['firstName', 'lastName', 'email'])
            .orderBy('createdDate', 'desc');
        if (accountId) {
            query.where('accountId', 'eq', accountId);
        }
        return query.execute();
    }
    /**
     * Advanced pagination example
     */
    async getTicketsPaginated(page = 1, pageSize = 25) {
        return this.query()
            .where('status', 'ne', 5) // Exclude closed tickets
            .orderBy('priority', 'asc')
            .orderBy('createdDate', 'desc')
            .page(page)
            .pageSize(pageSize)
            .execute();
    }
}
exports.TicketsEnhanced = TicketsEnhanced;
//# sourceMappingURL=ticketsEnhanced.js.map