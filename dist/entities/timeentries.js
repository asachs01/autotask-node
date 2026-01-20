"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeEntries = void 0;
const base_1 = require("./base");
/**
 * TimeEntries entity class for Autotask API
 *
 * Time tracking entries for billing
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: time
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TimeEntriesEntity.htm}
 */
class TimeEntries extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/TimeEntries';
    }
    static getMetadata() {
        return [
            {
                operation: 'createTimeEntries',
                requiredParams: ['timeEntries'],
                optionalParams: [],
                returnType: 'ITimeEntries',
                endpoint: '/TimeEntries',
            },
            {
                operation: 'getTimeEntries',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'ITimeEntries',
                endpoint: '/TimeEntries/{id}',
            },
            {
                operation: 'updateTimeEntries',
                requiredParams: ['id', 'timeEntries'],
                optionalParams: [],
                returnType: 'ITimeEntries',
                endpoint: '/TimeEntries/{id}',
            },
            {
                operation: 'deleteTimeEntries',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/TimeEntries/{id}',
            },
            {
                operation: 'listTimeEntries',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'ITimeEntries[]',
                endpoint: '/TimeEntries',
            }
        ];
    }
    /**
     * Create a new timeentries
     * @param timeEntries - The timeentries data to create
     * @returns Promise with the created timeentries
     */
    async create(timeEntries) {
        this.logger.info('Creating timeentries', { timeEntries });
        return this.executeRequest(async () => this.axios.post(this.endpoint, timeEntries), this.endpoint, 'POST');
    }
    /**
     * Get a timeentries by ID
     * @param id - The timeentries ID
     * @returns Promise with the timeentries data
     */
    async get(id) {
        this.logger.info('Getting timeentries', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a timeentries
     * @param id - The timeentries ID
     * @param timeEntries - The updated timeentries data
     * @returns Promise with the updated timeentries
     */
    async update(id, timeEntries) {
        this.logger.info('Updating timeentries', { id, timeEntries });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, timeEntries), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a timeentries
     * @param id - The timeentries ID
     * @param timeEntries - The partial timeentries data to update
     * @returns Promise with the updated timeentries
     */
    async patch(id, timeEntries) {
        this.logger.info('Patching timeentries', { id, timeEntries });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, timeEntries), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a timeentries
     * @param id - The timeentries ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting timeentries', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List timeentries with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of timeentries
     */
    async list(query = {}) {
        this.logger.info('Listing timeentries', { query });
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
exports.TimeEntries = TimeEntries;
//# sourceMappingURL=timeentries.js.map