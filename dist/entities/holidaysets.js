"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HolidaySets = void 0;
const base_1 = require("./base");
/**
 * HolidaySets entity class for Autotask API
 *
 * Sets of holidays for different regions
 * Supported Operations: GET
 * Category: time
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/HolidaySetsEntity.htm}
 */
class HolidaySets extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/HolidaySets';
    }
    static getMetadata() {
        return [
            {
                operation: 'getHolidaySets',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IHolidaySets',
                endpoint: '/HolidaySets/{id}',
            },
            {
                operation: 'listHolidaySets',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IHolidaySets[]',
                endpoint: '/HolidaySets',
            }
        ];
    }
    /**
     * Get a holidaysets by ID
     * @param id - The holidaysets ID
     * @returns Promise with the holidaysets data
     */
    async get(id) {
        this.logger.info('Getting holidaysets', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * List holidaysets with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of holidaysets
     */
    async list(query = {}) {
        this.logger.info('Listing holidaysets', { query });
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
exports.HolidaySets = HolidaySets;
//# sourceMappingURL=holidaysets.js.map