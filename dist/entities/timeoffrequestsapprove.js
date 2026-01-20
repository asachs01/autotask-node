"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeOffRequestsApprove = void 0;
const base_1 = require("./base");
/**
 * TimeOffRequestsApprove entity class for Autotask API
 *
 * Approve time off requests
 * Supported Operations: POST
 * Category: time
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TimeOffRequestsApproveEntity.htm}
 */
class TimeOffRequestsApprove extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/TimeOffRequestsApprove';
    }
    static getMetadata() {
        return [
            {
                operation: 'createTimeOffRequestsApprove',
                requiredParams: ['timeOffRequestsApprove'],
                optionalParams: [],
                returnType: 'ITimeOffRequestsApprove',
                endpoint: '/TimeOffRequestsApprove',
            },
            {
                operation: 'listTimeOffRequestsApprove',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'ITimeOffRequestsApprove[]',
                endpoint: '/TimeOffRequestsApprove',
            }
        ];
    }
    /**
     * Create a new timeoffrequestsapprove
     * @param timeOffRequestsApprove - The timeoffrequestsapprove data to create
     * @returns Promise with the created timeoffrequestsapprove
     */
    async create(timeOffRequestsApprove) {
        this.logger.info('Creating timeoffrequestsapprove', { timeOffRequestsApprove });
        return this.executeRequest(async () => this.axios.post(this.endpoint, timeOffRequestsApprove), this.endpoint, 'POST');
    }
    /**
     * List timeoffrequestsapprove with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of timeoffrequestsapprove
     */
    async list(query = {}) {
        this.logger.info('Listing timeoffrequestsapprove', { query });
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
exports.TimeOffRequestsApprove = TimeOffRequestsApprove;
//# sourceMappingURL=timeoffrequestsapprove.js.map