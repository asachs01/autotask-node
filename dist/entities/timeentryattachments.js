"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeEntryAttachments = void 0;
const base_1 = require("./base");
/**
 * TimeEntryAttachments entity class for Autotask API
 *
 * File attachments for time entries
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TimeEntryAttachmentsEntity.htm}
 */
class TimeEntryAttachments extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/TimeEntryAttachments';
    }
    static getMetadata() {
        return [
            {
                operation: 'createTimeEntryAttachments',
                requiredParams: ['timeEntryAttachments'],
                optionalParams: [],
                returnType: 'ITimeEntryAttachments',
                endpoint: '/TimeEntryAttachments',
            },
            {
                operation: 'getTimeEntryAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'ITimeEntryAttachments',
                endpoint: '/TimeEntryAttachments/{id}',
            },
            {
                operation: 'deleteTimeEntryAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/TimeEntryAttachments/{id}',
            },
            {
                operation: 'listTimeEntryAttachments',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'ITimeEntryAttachments[]',
                endpoint: '/TimeEntryAttachments',
            }
        ];
    }
    /**
     * Create a new timeentryattachments
     * @param timeEntryAttachments - The timeentryattachments data to create
     * @returns Promise with the created timeentryattachments
     */
    async create(timeEntryAttachments) {
        this.logger.info('Creating timeentryattachments', { timeEntryAttachments });
        return this.executeRequest(async () => this.axios.post(this.endpoint, timeEntryAttachments), this.endpoint, 'POST');
    }
    /**
     * Get a timeentryattachments by ID
     * @param id - The timeentryattachments ID
     * @returns Promise with the timeentryattachments data
     */
    async get(id) {
        this.logger.info('Getting timeentryattachments', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a timeentryattachments
     * @param id - The timeentryattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting timeentryattachments', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List timeentryattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of timeentryattachments
     */
    async list(query = {}) {
        this.logger.info('Listing timeentryattachments', { query });
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
exports.TimeEntryAttachments = TimeEntryAttachments;
//# sourceMappingURL=timeentryattachments.js.map