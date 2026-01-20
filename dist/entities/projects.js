"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Projects = void 0;
const base_1 = require("./base");
/**
 * Projects entity class for Autotask API
 *
 * Client projects and work orders
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: core
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ProjectsEntity.htm}
 */
class Projects extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/Projects';
    }
    static getMetadata() {
        return [
            {
                operation: 'createProjects',
                requiredParams: ['projects'],
                optionalParams: [],
                returnType: 'IProjects',
                endpoint: '/Projects',
            },
            {
                operation: 'getProjects',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IProjects',
                endpoint: '/Projects/{id}',
            },
            {
                operation: 'updateProjects',
                requiredParams: ['id', 'projects'],
                optionalParams: [],
                returnType: 'IProjects',
                endpoint: '/Projects/{id}',
            },
            {
                operation: 'listProjects',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IProjects[]',
                endpoint: '/Projects',
            },
        ];
    }
    /**
     * Create a new projects
     * @param projects - The projects data to create
     * @returns Promise with the created projects
     */
    async create(projects) {
        this.logger.info('Creating projects', { projects });
        return this.executeRequest(async () => this.axios.post(this.endpoint, projects), this.endpoint, 'POST');
    }
    /**
     * Get a projects by ID
     * @param id - The projects ID
     * @returns Promise with the projects data
     */
    async get(id) {
        this.logger.info('Getting projects', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a projects
     * @param id - The projects ID
     * @param projects - The updated projects data
     * @returns Promise with the updated projects
     */
    async update(id, projects) {
        this.logger.info('Updating projects', { id, projects });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, projects), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a projects
     * @param id - The projects ID
     * @param projects - The partial projects data to update
     * @returns Promise with the updated projects
     */
    async patch(id, projects) {
        this.logger.info('Patching projects', { id, projects });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, projects), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a projects
     * @param id - The projects ID to delete
     * @returns Promise with void response
     */
    async delete(id) {
        this.logger.info('Deleting projects', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List projects with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of projects
     */
    async list(query = {}) {
        this.logger.info('Listing projects', { query });
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
exports.Projects = Projects;
//# sourceMappingURL=projects.js.map