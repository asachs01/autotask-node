"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeOffRequests = void 0;
const base_1 = require("./base");
/**
 * TimeOffRequests entity class for Autotask API
 *
 * Requests for time off
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: time
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TimeOffRequestsEntity.htm}
 */
class TimeOffRequests extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/TimeOffRequests';
    }
    static getMetadata() {
        return [
            {
                operation: 'createTimeOffRequests',
                requiredParams: ['timeOffRequests'],
                optionalParams: [],
                returnType: 'ITimeOffRequests',
                endpoint: '/TimeOffRequests',
            },
            {
                operation: 'getTimeOffRequests',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'ITimeOffRequests',
                endpoint: '/TimeOffRequests/{id}',
            },
            {
                operation: 'updateTimeOffRequests',
                requiredParams: ['id', 'timeOffRequests'],
                optionalParams: [],
                returnType: 'ITimeOffRequests',
                endpoint: '/TimeOffRequests/{id}',
            },
            {
                operation: 'deleteTimeOffRequests',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/TimeOffRequests/{id}',
            },
            {
                operation: 'listTimeOffRequests',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'ITimeOffRequests[]',
                endpoint: '/TimeOffRequests',
            }
        ];
    }
    /**
     * Create a new timeoffrequests
     * @param timeOffRequests - The timeoffrequests data to create
     * @returns Promise with the created timeoffrequests
     */
    async create(timeOffRequests) {
        this.logger.info('Creating timeoffrequests', { timeOffRequests });
        return this.executeRequest(async () => this.axios.post(this.endpoint, timeOffRequests), this.endpoint, 'POST');
    }
    /**
     * Get a timeoffrequests by ID
     * @param id - The timeoffrequests ID
     * @returns Promise with the timeoffrequests data
     */
    async get(id) {
        this.logger.info('Getting timeoffrequests', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a timeoffrequests
     * @param id - The timeoffrequests ID
     * @param timeOffRequests - The updated timeoffrequests data
     * @returns Promise with the updated timeoffrequests
     */
    async update(id, timeOffRequests) {
        this.logger.info('Updating timeoffrequests', { id, timeOffRequests });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, timeOffRequests), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a timeoffrequests
     * @param id - The timeoffrequests ID
     * @param timeOffRequests - The partial timeoffrequests data to update
     * @returns Promise with the updated timeoffrequests
     */
    async patch(id, timeOffRequests) {
        this.logger.info('Patching timeoffrequests', { id, timeOffRequests });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, timeOffRequests), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a timeoffrequests
     * @param id - The timeoffrequests ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting timeoffrequests', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List timeoffrequests with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of timeoffrequests
     */
    async list(query = {}) {
        this.logger.info('Listing timeoffrequests', { query });
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
exports.TimeOffRequests = TimeOffRequests;
//# sourceMappingURL=timeoffrequests.js.map