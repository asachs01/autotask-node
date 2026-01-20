"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskPredecessors = void 0;
const base_1 = require("./base");
/**
 * TaskPredecessors entity class for Autotask API
 *
 * Predecessor relationships between tasks
 * Supported Operations: GET, POST, DELETE
 * Category: tasks
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TaskPredecessorsEntity.htm}
 */
class TaskPredecessors extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/TaskPredecessors';
    }
    static getMetadata() {
        return [
            {
                operation: 'createTaskPredecessors',
                requiredParams: ['taskPredecessors'],
                optionalParams: [],
                returnType: 'ITaskPredecessors',
                endpoint: '/TaskPredecessors',
            },
            {
                operation: 'getTaskPredecessors',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'ITaskPredecessors',
                endpoint: '/TaskPredecessors/{id}',
            },
            {
                operation: 'deleteTaskPredecessors',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/TaskPredecessors/{id}',
            },
            {
                operation: 'listTaskPredecessors',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'ITaskPredecessors[]',
                endpoint: '/TaskPredecessors',
            }
        ];
    }
    /**
     * Create a new taskpredecessors
     * @param taskPredecessors - The taskpredecessors data to create
     * @returns Promise with the created taskpredecessors
     */
    async create(taskPredecessors) {
        this.logger.info('Creating taskpredecessors', { taskPredecessors });
        return this.executeRequest(async () => this.axios.post(this.endpoint, taskPredecessors), this.endpoint, 'POST');
    }
    /**
     * Get a taskpredecessors by ID
     * @param id - The taskpredecessors ID
     * @returns Promise with the taskpredecessors data
     */
    async get(id) {
        this.logger.info('Getting taskpredecessors', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a taskpredecessors
     * @param id - The taskpredecessors ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting taskpredecessors', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List taskpredecessors with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of taskpredecessors
     */
    async list(query = {}) {
        this.logger.info('Listing taskpredecessors', { query });
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
exports.TaskPredecessors = TaskPredecessors;
//# sourceMappingURL=taskpredecessors.js.map