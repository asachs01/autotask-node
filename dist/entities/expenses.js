"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expenses = void 0;
class Expenses {
    constructor(axios, logger) {
        this.axios = axios;
        this.logger = logger;
        this.endpoint = '/Expenses';
    }
    static getMetadata() {
        return [
            {
                operation: 'createExpense',
                requiredParams: ['expense'],
                optionalParams: [],
                returnType: 'Expense',
                endpoint: '/Expenses',
            },
            {
                operation: 'getExpense',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'Expense',
                endpoint: '/Expenses/{id}',
            },
            {
                operation: 'updateExpense',
                requiredParams: ['id', 'expense'],
                optionalParams: [],
                returnType: 'Expense',
                endpoint: '/Expenses/{id}',
            },
            {
                operation: 'deleteExpense',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/Expenses/{id}',
            },
            {
                operation: 'listExpenses',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'Expense[]',
                endpoint: '/Expenses',
            },
        ];
    }
    async requestWithRetry(fn, retries = 3, delay = 500) {
        let attempt = 0;
        while (true) {
            try {
                return await fn();
            }
            catch (err) {
                attempt++;
                this.logger.warn(`Request failed (attempt ${attempt}): ${err}`);
                if (attempt > retries)
                    throw err;
                await new Promise(res => setTimeout(res, delay * Math.pow(2, attempt - 1)));
            }
        }
    }
    async create(expense) {
        this.logger.info('Creating expense', { expense });
        return this.requestWithRetry(async () => {
            const { data } = await this.axios.post(this.endpoint, expense);
            return { data };
        });
    }
    async get(id) {
        this.logger.info('Getting expense', { id });
        return this.requestWithRetry(async () => {
            const { data } = await this.axios.get(`${this.endpoint}/${id}`);
            return { data };
        });
    }
    async update(id, expense) {
        this.logger.info('Updating expense', { id, expense });
        return this.requestWithRetry(async () => {
            const { data } = await this.axios.put(`${this.endpoint}/${id}`, expense);
            return { data };
        });
    }
    async delete(id) {
        this.logger.info('Deleting expense', { id });
        return this.requestWithRetry(async () => {
            await this.axios.delete(`${this.endpoint}/${id}`);
        });
    }
    async list(query = {}) {
        this.logger.info('Listing expenses', { query });
        const params = {};
        if (query.filter)
            params['search'] = JSON.stringify(query.filter);
        if (query.sort)
            params['sort'] = query.sort;
        if (query.page)
            params['page'] = query.page;
        if (query.pageSize)
            params['pageSize'] = query.pageSize;
        return this.requestWithRetry(async () => {
            const { data } = await this.axios.get(this.endpoint, { params });
            return { data };
        });
    }
}
exports.Expenses = Expenses;
//# sourceMappingURL=expenses.js.map