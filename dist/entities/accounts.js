"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Accounts = void 0;
const base_1 = require("./base");
class Accounts extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/Companies';
    }
    static getMetadata() {
        return [
            {
                operation: 'createAccount',
                requiredParams: ['account'],
                optionalParams: [],
                returnType: 'Account',
                endpoint: '/Companies',
            },
            {
                operation: 'getAccount',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'Account',
                endpoint: '/Companies/{id}',
            },
            {
                operation: 'updateAccount',
                requiredParams: ['id', 'account'],
                optionalParams: [],
                returnType: 'Account',
                endpoint: '/Companies/{id}',
            },
            {
                operation: 'deleteAccount',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/Companies/{id}',
            },
            {
                operation: 'listAccounts',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'Account[]',
                endpoint: '/Companies',
            },
        ];
    }
    async create(account) {
        this.logger.info('Creating account', { account });
        return this.executeRequest(async () => this.axios.post(this.endpoint, account), this.endpoint, 'POST');
    }
    async get(id) {
        this.logger.info('Getting account', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    async update(id, account) {
        this.logger.info('Updating account', { id, account });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, account), `${this.endpoint}/${id}`, 'PUT');
    }
    async delete(id) {
        this.logger.info('Deleting account', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    async list(query = {}) {
        this.logger.info('Listing accounts', { query });
        const searchBody = {};
        // Ensure there's a filter - Autotask API requires a filter
        if (!query.filter || Object.keys(query.filter).length === 0) {
            searchBody.filter = [
                {
                    "op": "gte",
                    "field": "id",
                    "value": 0
                }
            ];
        }
        else {
            // If filter is provided as an object, convert to array format expected by API
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
        this.logger.info('Listing accounts with search body', { searchBody });
        return this.executeQueryRequest(async () => this.axios.post(`${this.endpoint}/query`, searchBody), `${this.endpoint}/query`, 'POST');
    }
}
exports.Accounts = Accounts;
//# sourceMappingURL=accounts.js.map