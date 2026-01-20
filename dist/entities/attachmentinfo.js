"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentInfo = void 0;
const base_1 = require("./base");
/**
 * AttachmentInfo entity class for Autotask API
 *
 * Attachment information and metadata
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/AttachmentInfoEntity.htm}
 */
class AttachmentInfo extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/AttachmentInfo';
    }
    static getMetadata() {
        return [
            {
                operation: 'createAttachmentInfo',
                requiredParams: ['attachmentInfo'],
                optionalParams: [],
                returnType: 'IAttachmentInfo',
                endpoint: '/AttachmentInfo',
            },
            {
                operation: 'getAttachmentInfo',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IAttachmentInfo',
                endpoint: '/AttachmentInfo/{id}',
            },
            {
                operation: 'deleteAttachmentInfo',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/AttachmentInfo/{id}',
            },
            {
                operation: 'listAttachmentInfo',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IAttachmentInfo[]',
                endpoint: '/AttachmentInfo',
            }
        ];
    }
    /**
     * Create a new attachmentinfo
     * @param attachmentInfo - The attachmentinfo data to create
     * @returns Promise with the created attachmentinfo
     */
    async create(attachmentInfo) {
        this.logger.info('Creating attachmentinfo', { attachmentInfo });
        return this.executeRequest(async () => this.axios.post(this.endpoint, attachmentInfo), this.endpoint, 'POST');
    }
    /**
     * Get a attachmentinfo by ID
     * @param id - The attachmentinfo ID
     * @returns Promise with the attachmentinfo data
     */
    async get(id) {
        this.logger.info('Getting attachmentinfo', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Delete a attachmentinfo
     * @param id - The attachmentinfo ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting attachmentinfo', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List attachmentinfo with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of attachmentinfo
     */
    async list(query = {}) {
        this.logger.info('Listing attachmentinfo', { query });
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
exports.AttachmentInfo = AttachmentInfo;
//# sourceMappingURL=attachmentinfo.js.map