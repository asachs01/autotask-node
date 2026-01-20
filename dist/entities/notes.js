"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notes = void 0;
class Notes {
    constructor(axios, logger) {
        this.axios = axios;
        this.logger = logger;
        this.endpoint = '/Notes';
    }
    static getMetadata() {
        return [
            {
                operation: 'createNote',
                requiredParams: ['note'],
                optionalParams: [],
                returnType: 'Note',
                endpoint: '/Notes',
            },
            {
                operation: 'getNote',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'Note',
                endpoint: '/Notes/{id}',
            },
            {
                operation: 'updateNote',
                requiredParams: ['id', 'note'],
                optionalParams: [],
                returnType: 'Note',
                endpoint: '/Notes/{id}',
            },
            {
                operation: 'deleteNote',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/Notes/{id}',
            },
            {
                operation: 'listNotes',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'Note[]',
                endpoint: '/Notes',
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
    async create(note) {
        this.logger.info('Creating note', { note });
        return this.requestWithRetry(async () => {
            const { data } = await this.axios.post(this.endpoint, note);
            return { data };
        });
    }
    async get(id) {
        this.logger.info('Getting note', { id });
        return this.requestWithRetry(async () => {
            const { data } = await this.axios.get(`${this.endpoint}/${id}`);
            return { data };
        });
    }
    async update(id, note) {
        this.logger.info('Updating note', { id, note });
        return this.requestWithRetry(async () => {
            const { data } = await this.axios.put(`${this.endpoint}/${id}`, note);
            return { data };
        });
    }
    async delete(id) {
        this.logger.info('Deleting note', { id });
        return this.requestWithRetry(async () => {
            await this.axios.delete(`${this.endpoint}/${id}`);
        });
    }
    async list(query = {}) {
        this.logger.info('Listing notes', { query });
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
exports.Notes = Notes;
//# sourceMappingURL=notes.js.map