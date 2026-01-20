"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectNotes = void 0;
const base_1 = require("./base");
/**
 * ProjectNotes entity class for Autotask API
 *
 * Notes for projects
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ProjectNotesEntity.htm}
 */
class ProjectNotes extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ProjectNotes';
    }
    static getMetadata() {
        return [
            {
                operation: 'createProjectNotes',
                requiredParams: ['projectNotes'],
                optionalParams: [],
                returnType: 'IProjectNotes',
                endpoint: '/ProjectNotes',
            },
            {
                operation: 'getProjectNotes',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IProjectNotes',
                endpoint: '/ProjectNotes/{id}',
            },
            {
                operation: 'updateProjectNotes',
                requiredParams: ['id', 'projectNotes'],
                optionalParams: [],
                returnType: 'IProjectNotes',
                endpoint: '/ProjectNotes/{id}',
            },
            {
                operation: 'listProjectNotes',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IProjectNotes[]',
                endpoint: '/ProjectNotes',
            }
        ];
    }
    /**
     * Create a new projectnotes
     * @param projectNotes - The projectnotes data to create
     * @returns Promise with the created projectnotes
     */
    async create(projectNotes) {
        this.logger.info('Creating projectnotes', { projectNotes });
        return this.executeRequest(async () => this.axios.post(this.endpoint, projectNotes), this.endpoint, 'POST');
    }
    /**
     * Get a projectnotes by ID
     * @param id - The projectnotes ID
     * @returns Promise with the projectnotes data
     */
    async get(id) {
        this.logger.info('Getting projectnotes', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a projectnotes
     * @param id - The projectnotes ID
     * @param projectNotes - The updated projectnotes data
     * @returns Promise with the updated projectnotes
     */
    async update(id, projectNotes) {
        this.logger.info('Updating projectnotes', { id, projectNotes });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, projectNotes), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a projectnotes
     * @param id - The projectnotes ID
     * @param projectNotes - The partial projectnotes data to update
     * @returns Promise with the updated projectnotes
     */
    async patch(id, projectNotes) {
        this.logger.info('Patching projectnotes', { id, projectNotes });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, projectNotes), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * List projectnotes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of projectnotes
     */
    async list(query = {}) {
        this.logger.info('Listing projectnotes', { query });
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
exports.ProjectNotes = ProjectNotes;
//# sourceMappingURL=projectnotes.js.map