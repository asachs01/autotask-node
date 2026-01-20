"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeOrderCharges = void 0;
const base_1 = require("./base");
/**
 * ChangeOrderCharges entity class for Autotask API
 *
 * Charges for change orders
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: financial
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ChangeOrderChargesEntity.htm}
 */
class ChangeOrderCharges extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ChangeOrderCharges';
    }
    static getMetadata() {
        return [
            {
                operation: 'createChangeOrderCharges',
                requiredParams: ['changeOrderCharges'],
                optionalParams: [],
                returnType: 'IChangeOrderCharges',
                endpoint: '/ChangeOrderCharges',
            },
            {
                operation: 'getChangeOrderCharges',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IChangeOrderCharges',
                endpoint: '/ChangeOrderCharges/{id}',
            },
            {
                operation: 'updateChangeOrderCharges',
                requiredParams: ['id', 'changeOrderCharges'],
                optionalParams: [],
                returnType: 'IChangeOrderCharges',
                endpoint: '/ChangeOrderCharges/{id}',
            },
            {
                operation: 'deleteChangeOrderCharges',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ChangeOrderCharges/{id}',
            },
            {
                operation: 'listChangeOrderCharges',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IChangeOrderCharges[]',
                endpoint: '/ChangeOrderCharges',
            }
        ];
    }
    /**
     * Create a new changeordercharges
     * @param changeOrderCharges - The changeordercharges data to create
     * @returns Promise with the created changeordercharges
     */
    async create(changeOrderCharges) {
        this.logger.info('Creating changeordercharges', { changeOrderCharges });
        return this.executeRequest(async () => this.axios.post(this.endpoint, changeOrderCharges), this.endpoint, 'POST');
    }
    /**
     * Get a changeordercharges by ID
     * @param id - The changeordercharges ID
     * @returns Promise with the changeordercharges data
     */
    async get(id) {
        this.logger.info('Getting changeordercharges', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a changeordercharges
     * @param id - The changeordercharges ID
     * @param changeOrderCharges - The updated changeordercharges data
     * @returns Promise with the updated changeordercharges
     */
    async update(id, changeOrderCharges) {
        this.logger.info('Updating changeordercharges', { id, changeOrderCharges });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, changeOrderCharges), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a changeordercharges
     * @param id - The changeordercharges ID
     * @param changeOrderCharges - The partial changeordercharges data to update
     * @returns Promise with the updated changeordercharges
     */
    async patch(id, changeOrderCharges) {
        this.logger.info('Patching changeordercharges', { id, changeOrderCharges });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, changeOrderCharges), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a changeordercharges
     * @param id - The changeordercharges ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting changeordercharges', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List changeordercharges with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of changeordercharges
     */
    async list(query = {}) {
        this.logger.info('Listing changeordercharges', { query });
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
exports.ChangeOrderCharges = ChangeOrderCharges;
//# sourceMappingURL=changeordercharges.js.map