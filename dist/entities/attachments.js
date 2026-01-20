"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attachments = void 0;
class Attachments {
    constructor(axios, logger) {
        this.axios = axios;
        this.logger = logger;
        this.endpoint = '/Attachments';
    }
    static getMetadata() {
        return [
            {
                operation: 'createAttachment',
                requiredParams: ['attachment'],
                optionalParams: [],
                returnType: 'Attachment',
                endpoint: '/Attachments',
            },
            {
                operation: 'getAttachment',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'Attachment',
                endpoint: '/Attachments/{id}',
            },
            {
                operation: 'updateAttachment',
                requiredParams: ['id', 'attachment'],
                optionalParams: [],
                returnType: 'Attachment',
                endpoint: '/Attachments/{id}',
            },
            {
                operation: 'deleteAttachment',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/Attachments/{id}',
            },
            {
                operation: 'listAttachments',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'Attachment[]',
                endpoint: '/Attachments',
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
    async create(attachment) {
        this.logger.info('Creating attachment', { attachment });
        return this.requestWithRetry(async () => {
            const { data } = await this.axios.post(this.endpoint, attachment);
            return { data };
        });
    }
    async get(id) {
        this.logger.info('Getting attachment', { id });
        return this.requestWithRetry(async () => {
            const { data } = await this.axios.get(`${this.endpoint}/${id}`);
            return { data };
        });
    }
    async update(id, attachment) {
        this.logger.info('Updating attachment', { id, attachment });
        return this.requestWithRetry(async () => {
            const { data } = await this.axios.put(`${this.endpoint}/${id}`, attachment);
            return { data };
        });
    }
    async delete(id) {
        this.logger.info('Deleting attachment', { id });
        return this.requestWithRetry(async () => {
            await this.axios.delete(`${this.endpoint}/${id}`);
        });
    }
    async list(query = {}) {
        this.logger.info('Listing attachments', { query });
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
exports.Attachments = Attachments;
//# sourceMappingURL=attachments.js.map