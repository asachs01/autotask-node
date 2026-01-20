"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletedTicketLogs = void 0;
const base_1 = require("./base");
/**
 * DeletedTicketLogs entity class for Autotask API
 *
 * Audit logs for deleted tickets
 * Supported Operations: GET
 * Category: logs
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DeletedTicketLogsEntity.htm}
 */
class DeletedTicketLogs extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/DeletedTicketLogs';
    }
    static getMetadata() {
        return [
            {
                operation: 'getDeletedTicketLogs',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IDeletedTicketLogs',
                endpoint: '/DeletedTicketLogs/{id}',
            },
            {
                operation: 'listDeletedTicketLogs',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IDeletedTicketLogs[]',
                endpoint: '/DeletedTicketLogs',
            }
        ];
    }
    /**
     * Get a deletedticketlogs by ID
     * @param id - The deletedticketlogs ID
     * @returns Promise with the deletedticketlogs data
     */
    async get(id) {
        this.logger.info('Getting deletedticketlogs', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * List deletedticketlogs with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of deletedticketlogs
     */
    async list(query = {}) {
        this.logger.info('Listing deletedticketlogs', { query });
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
exports.DeletedTicketLogs = DeletedTicketLogs;
//# sourceMappingURL=deletedticketlogs.js.map