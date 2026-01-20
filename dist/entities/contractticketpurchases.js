"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractTicketPurchases = void 0;
const base_1 = require("./base");
/**
 * ContractTicketPurchases entity class for Autotask API
 *
 * Ticket purchases for contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractTicketPurchasesEntity.htm}
 */
class ContractTicketPurchases extends base_1.BaseEntity {
    constructor(axios, logger, requestHandler) {
        super(axios, logger, requestHandler);
        this.endpoint = '/ContractTicketPurchases';
    }
    static getMetadata() {
        return [
            {
                operation: 'createContractTicketPurchases',
                requiredParams: ['contractTicketPurchases'],
                optionalParams: [],
                returnType: 'IContractTicketPurchases',
                endpoint: '/ContractTicketPurchases',
            },
            {
                operation: 'getContractTicketPurchases',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'IContractTicketPurchases',
                endpoint: '/ContractTicketPurchases/{id}',
            },
            {
                operation: 'updateContractTicketPurchases',
                requiredParams: ['id', 'contractTicketPurchases'],
                optionalParams: [],
                returnType: 'IContractTicketPurchases',
                endpoint: '/ContractTicketPurchases/{id}',
            },
            {
                operation: 'deleteContractTicketPurchases',
                requiredParams: ['id'],
                optionalParams: [],
                returnType: 'void',
                endpoint: '/ContractTicketPurchases/{id}',
            },
            {
                operation: 'listContractTicketPurchases',
                requiredParams: [],
                optionalParams: ['filter', 'sort', 'page', 'pageSize'],
                returnType: 'IContractTicketPurchases[]',
                endpoint: '/ContractTicketPurchases',
            }
        ];
    }
    /**
     * Create a new contractticketpurchases
     * @param contractTicketPurchases - The contractticketpurchases data to create
     * @returns Promise with the created contractticketpurchases
     */
    async create(contractTicketPurchases) {
        this.logger.info('Creating contractticketpurchases', { contractTicketPurchases });
        return this.executeRequest(async () => this.axios.post(this.endpoint, contractTicketPurchases), this.endpoint, 'POST');
    }
    /**
     * Get a contractticketpurchases by ID
     * @param id - The contractticketpurchases ID
     * @returns Promise with the contractticketpurchases data
     */
    async get(id) {
        this.logger.info('Getting contractticketpurchases', { id });
        return this.executeRequest(async () => this.axios.get(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'GET');
    }
    /**
     * Update a contractticketpurchases
     * @param id - The contractticketpurchases ID
     * @param contractTicketPurchases - The updated contractticketpurchases data
     * @returns Promise with the updated contractticketpurchases
     */
    async update(id, contractTicketPurchases) {
        this.logger.info('Updating contractticketpurchases', { id, contractTicketPurchases });
        return this.executeRequest(async () => this.axios.put(`${this.endpoint}/${id}`, contractTicketPurchases), `${this.endpoint}/${id}`, 'PUT');
    }
    /**
     * Partially update a contractticketpurchases
     * @param id - The contractticketpurchases ID
     * @param contractTicketPurchases - The partial contractticketpurchases data to update
     * @returns Promise with the updated contractticketpurchases
     */
    async patch(id, contractTicketPurchases) {
        this.logger.info('Patching contractticketpurchases', { id, contractTicketPurchases });
        return this.executeRequest(async () => this.axios.patch(`${this.endpoint}/${id}`, contractTicketPurchases), `${this.endpoint}/${id}`, 'PATCH');
    }
    /**
     * Delete a contractticketpurchases
     * @param id - The contractticketpurchases ID
     * @returns Promise that resolves when deletion is complete
     */
    async delete(id) {
        this.logger.info('Deleting contractticketpurchases', { id });
        await this.executeRequest(async () => this.axios.delete(`${this.endpoint}/${id}`), `${this.endpoint}/${id}`, 'DELETE');
    }
    /**
     * List contractticketpurchases with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractticketpurchases
     */
    async list(query = {}) {
        this.logger.info('Listing contractticketpurchases', { query });
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
exports.ContractTicketPurchases = ContractTicketPurchases;
//# sourceMappingURL=contractticketpurchases.js.map