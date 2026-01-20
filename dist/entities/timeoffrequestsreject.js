"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeOffRequestsReject = void 0;
const base_1 = require("./base");
/**
 * TimeOffRequestsReject entity class for Autotask API
 *
 * Reject time off requests
 * Supported Operations: POST
 * Category: time
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TimeOffRequestsRejectEntity.htm}
 */
class TimeOffRequestsReject extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/TimeOffRequestsReject';
    }
    static getMetadata() {
        return [
            {
                operation: 'createTimeOffRequestsReject',
                requiredParams: ['timeOffRequestsReject'],
                optionalParams: [],
                returnType: 'ITimeOffRequestsReject',
                endpoint: '/TimeOffRequestsReject',
            },
            {
                operation: 'listTimeOffRequestsReject',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'ITimeOffRequestsReject[]',
                endpoint: '/TimeOffRequestsReject',
            }
        ];
    }
    /**
     * Create a new timeoffrequestsreject
     * @param timeOffRequestsReject - The timeoffrequestsreject data to create
     * @returns Promise with the created timeoffrequestsreject
     */
    async create(timeOffRequestsReject) {
        this.logger.info('Creating timeoffrequestsreject', { timeOffRequestsReject });
        return this.executeRequest(async () => this.axios.post(this.endpoint, timeOffRequestsReject), this.endpoint, 'POST');
    }
    /**
     * List timeoffrequestsreject with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of timeoffrequestsreject
     */
    async list(query = {}) {
        this.logger.info('Listing timeoffrequestsreject', { query });
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
exports.TimeOffRequestsReject = TimeOffRequestsReject;
//# sourceMappingURL=timeoffrequestsreject.js.map