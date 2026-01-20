"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskAttachments = void 0;
const base_1 = require("./base");
/**
 * TaskAttachments entity class for Autotask API
 *
 * File attachments for tasks
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TaskAttachmentsEntity.htm}
 */
class TaskAttachments extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/TaskAttachments';
    }
    static getMetadata() {
        return [
            {
                operation: 'createTaskAttachments',
                requiredParams: ['taskAttachments'],
                optionalParams: [],
                returnType: 'ITaskAttachments',
                endpoint: '/TaskAttachments',
            },
            {
                operation: 'getTaskAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'ITaskAttachments',
                endpoint: '/TaskAttachments/{id}',
            },
            {
                operation: 'deleteTaskAttachments',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/TaskAttachments/{id}',
            },
            {
                operation: 'listTaskAttachments',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'ITaskAttachments[]',
                endpoint: '/TaskAttachments',
            }
        ];
    }
    /**
     * Create a new taskattachments
     * @param taskAttachments - The taskattachments data to create
     * @returns Promise with the created taskattachments
     */
    async create(taskAttachments) {
        this.logger.info('Creating taskattachments', { taskAttachments });
        return this.executeRequest(async () => this.axios.post(this.endpoint, taskAttachments), this.endpoint, 'POST');
    }
    /**
     * Get a taskattachments by ID
     * @param id - The taskattachments ID
     * @returns Promise with the taskattachments data
     */
    async get(id) {
        this.logger.info('Getting taskattachments', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a taskattachments
     * @param id - The taskattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting taskattachments', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List taskattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of taskattachments
     */
    async list(query = {}) {
        this.logger.info('Listing taskattachments', { query });
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
exports.TaskAttachments = TaskAttachments;
//# sourceMappingURL=taskattachments.js.map