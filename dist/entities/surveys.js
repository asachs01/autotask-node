"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Surveys = void 0;
const base_1 = require("./base");
/**
 * Surveys entity class for Autotask API
 *
 * Customer satisfaction surveys
 * Supported Operations: GET
 * Category: surveys
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/SurveysEntity.htm}
 */
class Surveys extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/Surveys';
    }
    static getMetadata() {
        return [
            {
                operation: 'getSurveys',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'ISurveys',
                endpoint: '/Surveys/{id}',
            },
            {
                operation: 'listSurveys',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'ISurveys[]',
                endpoint: '/Surveys',
            }
        ];
    }
    /**
     * Get a surveys by ID
     * @param id - The surveys ID
     * @returns Promise with the surveys data
     */
    async get(id) {
        this.logger.info('Getting surveys', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * List surveys with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of surveys
     */
    async list(query = {}) {
        this.logger.info('Listing surveys', { query });
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
exports.Surveys = Surveys;
//# sourceMappingURL=surveys.js.map