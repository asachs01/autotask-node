import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ContractBlock {
  id?: number;
  contractId?: number;
  dateBegin?: string;
  dateEnd?: string;
  hours?: number;
  hoursApproved?: number;
  hoursUsed?: number;
  status?: number;
  isPaid?: boolean;
  paymentNumber?: string;
  paymentDate?: string;
  invoiceNumber?: string;
  [key: string]: any;
}

export interface ContractBlockQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export class ContractBlocks extends BaseEntity {
  private readonly endpoint = '/ContractBlocks';

  constructor(
    axios: AxiosInstance, 
    logger: winston.Logger, 
    requestHandler?: RequestHandler
  ) {
    super(axios, logger, requestHandler);
  }

  static getMetadata(): MethodMetadata[] {
    return [
      {
        operation: 'createContractBlock',
        requiredParams: ['contractBlock'],
        optionalParams: [],
        returnType: 'ContractBlock',
        endpoint: '/ContractBlocks',
      },
      {
        operation: 'getContractBlock',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ContractBlock',
        endpoint: '/ContractBlocks/{id}',
      },
      {
        operation: 'updateContractBlock',
        requiredParams: ['id', 'contractBlock'],
        optionalParams: [],
        returnType: 'ContractBlock',
        endpoint: '/ContractBlocks/{id}',
      },
      {
        operation: 'deleteContractBlock',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ContractBlocks/{id}',
      },
      {
        operation: 'listContractBlocks',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ContractBlock[]',
        endpoint: '/ContractBlocks',
      },
    ];
  }

  async create(contractBlock: ContractBlock): Promise<ApiResponse<ContractBlock>> {
    this.logger.info('Creating contract block', { contractBlock });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contractBlock),
      this.endpoint,
      'POST'
    );
  }

  async get(id: number): Promise<ApiResponse<ContractBlock>> {
    this.logger.info('Getting contract block', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  async update(id: number, contractBlock: Partial<ContractBlock>): Promise<ApiResponse<ContractBlock>> {
    this.logger.info('Updating contract block', { id, contractBlock });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, contractBlock),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contract block', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  async list(query: ContractBlockQuery = {}): Promise<ApiResponse<ContractBlock[]>> {
    this.logger.info('Listing contract blocks', { query });
    const searchBody: Record<string, any> = {};
    
    // Ensure there's a filter - Autotask API requires a filter
    if (!query.filter || Object.keys(query.filter).length === 0) {
      searchBody.filter = [
        {
          "op": "gte",
          "field": "id",
          "value": 0
        }
      ];
    } else {
      // If filter is provided as an object, convert to array format expected by API
      if (!Array.isArray(query.filter)) {
        const filterArray = [];
        for (const [field, value] of Object.entries(query.filter)) {
          filterArray.push({
            "op": "eq",
            "field": field,
            "value": value
          });
        }
        searchBody.filter = filterArray;
      } else {
        searchBody.filter = query.filter;
      }
    }
    
    if (query.sort) searchBody.sort = query.sort;
    if (query.page) searchBody.page = query.page;
    if (query.pageSize) searchBody.pageSize = query.pageSize;
    
    this.logger.info('Listing contract blocks with search body', { searchBody });
    
    return this.executeRequest(
      async () => this.axios.post(`${this.endpoint}/query`, searchBody),
      `${this.endpoint}/query`,
      'POST'
    );
  }

  /**
   * Get all blocks for a specific contract
   */
  async getByContract(contractId: number): Promise<ApiResponse<ContractBlock[]>> {
    this.logger.info('Getting contract blocks by contract ID', { contractId });
    return this.list({
      filter: { contractId }
    });
  }

  /**
   * Get blocks within a date range
   */
  async getByDateRange(startDate: string, endDate: string): Promise<ApiResponse<ContractBlock[]>> {
    this.logger.info('Getting contract blocks by date range', { startDate, endDate });
    return this.list({
      filter: [
        { "op": "gte", "field": "dateBegin", "value": startDate },
        { "op": "lte", "field": "dateEnd", "value": endDate }
      ]
    });
  }
} 