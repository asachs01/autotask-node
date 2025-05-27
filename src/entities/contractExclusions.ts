import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ContractExclusion {
  id?: number;
  contractId?: number;
  exclusionType?: number;
  exclusionValue?: string;
  description?: string;
  isActive?: boolean;
  createdDate?: string;
  createdBy?: number;
  lastModifiedDate?: string;
  lastModifiedBy?: number;
  [key: string]: any;
}

export interface ContractExclusionQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export class ContractExclusions extends BaseEntity {
  private readonly endpoint = '/ContractExclusions';

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
        operation: 'createContractExclusion',
        requiredParams: ['contractExclusion'],
        optionalParams: [],
        returnType: 'ContractExclusion',
        endpoint: '/ContractExclusions',
      },
      {
        operation: 'getContractExclusion',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ContractExclusion',
        endpoint: '/ContractExclusions/{id}',
      },
      {
        operation: 'updateContractExclusion',
        requiredParams: ['id', 'contractExclusion'],
        optionalParams: [],
        returnType: 'ContractExclusion',
        endpoint: '/ContractExclusions/{id}',
      },
      {
        operation: 'deleteContractExclusion',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ContractExclusions/{id}',
      },
      {
        operation: 'listContractExclusions',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ContractExclusion[]',
        endpoint: '/ContractExclusions',
      },
    ];
  }

  async create(contractExclusion: ContractExclusion): Promise<ApiResponse<ContractExclusion>> {
    this.logger.info('Creating contract exclusion', { contractExclusion });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contractExclusion),
      this.endpoint,
      'POST'
    );
  }

  async get(id: number): Promise<ApiResponse<ContractExclusion>> {
    this.logger.info('Getting contract exclusion', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  async update(id: number, contractExclusion: Partial<ContractExclusion>): Promise<ApiResponse<ContractExclusion>> {
    this.logger.info('Updating contract exclusion', { id, contractExclusion });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, contractExclusion),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contract exclusion', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  async list(query: ContractExclusionQuery = {}): Promise<ApiResponse<ContractExclusion[]>> {
    this.logger.info('Listing contract exclusions', { query });
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
    
    this.logger.info('Listing contract exclusions with search body', { searchBody });
    
    return this.executeRequest(
      async () => this.axios.post(`${this.endpoint}/query`, searchBody),
      `${this.endpoint}/query`,
      'POST'
    );
  }

  /**
   * Get all exclusions for a specific contract
   */
  async getByContract(contractId: number): Promise<ApiResponse<ContractExclusion[]>> {
    this.logger.info('Getting contract exclusions by contract ID', { contractId });
    return this.list({
      filter: { contractId }
    });
  }

  /**
   * Get active exclusions for a specific contract
   */
  async getActiveByContract(contractId: number): Promise<ApiResponse<ContractExclusion[]>> {
    this.logger.info('Getting active contract exclusions by contract ID', { contractId });
    return this.list({
      filter: [
        { "op": "eq", "field": "contractId", "value": contractId },
        { "op": "eq", "field": "isActive", "value": true }
      ]
    });
  }
} 