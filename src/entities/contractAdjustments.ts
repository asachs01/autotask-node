import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ContractAdjustment {
  id?: number;
  contractId?: number;
  adjustmentType?: number;
  adjustmentValue?: number;
  adjustmentPercentage?: number;
  effectiveDate?: string;
  endDate?: string;
  description?: string;
  isActive?: boolean;
  createdDate?: string;
  createdBy?: number;
  lastModifiedDate?: string;
  lastModifiedBy?: number;
  [key: string]: any;
}

export interface ContractAdjustmentQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export class ContractAdjustments extends BaseEntity {
  private readonly endpoint = '/ContractAdjustments';

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
        operation: 'createContractAdjustment',
        requiredParams: ['contractAdjustment'],
        optionalParams: [],
        returnType: 'ContractAdjustment',
        endpoint: '/ContractAdjustments',
      },
      {
        operation: 'getContractAdjustment',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ContractAdjustment',
        endpoint: '/ContractAdjustments/{id}',
      },
      {
        operation: 'updateContractAdjustment',
        requiredParams: ['id', 'contractAdjustment'],
        optionalParams: [],
        returnType: 'ContractAdjustment',
        endpoint: '/ContractAdjustments/{id}',
      },
      {
        operation: 'deleteContractAdjustment',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ContractAdjustments/{id}',
      },
      {
        operation: 'listContractAdjustments',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ContractAdjustment[]',
        endpoint: '/ContractAdjustments',
      },
    ];
  }

  async create(contractAdjustment: ContractAdjustment): Promise<ApiResponse<ContractAdjustment>> {
    this.logger.info('Creating contract adjustment', { contractAdjustment });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contractAdjustment),
      this.endpoint,
      'POST'
    );
  }

  async get(id: number): Promise<ApiResponse<ContractAdjustment>> {
    this.logger.info('Getting contract adjustment', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  async update(id: number, contractAdjustment: Partial<ContractAdjustment>): Promise<ApiResponse<ContractAdjustment>> {
    this.logger.info('Updating contract adjustment', { id, contractAdjustment });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, contractAdjustment),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contract adjustment', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  async list(query: ContractAdjustmentQuery = {}): Promise<ApiResponse<ContractAdjustment[]>> {
    this.logger.info('Listing contract adjustments', { query });
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
    
    this.logger.info('Listing contract adjustments with search body', { searchBody });
    
    return this.executeQueryRequest(
      async () => this.axios.post(`${this.endpoint}/query`, searchBody),
      `${this.endpoint}/query`,
      'POST'
    );
  }

  /**
   * Get all adjustments for a specific contract
   */
  async getByContract(contractId: number): Promise<ApiResponse<ContractAdjustment[]>> {
    this.logger.info('Getting contract adjustments by contract ID', { contractId });
    return this.list({
      filter: { contractId }
    });
  }

  /**
   * Get active adjustments for a specific contract
   */
  async getActiveByContract(contractId: number): Promise<ApiResponse<ContractAdjustment[]>> {
    this.logger.info('Getting active contract adjustments by contract ID', { contractId });
    return this.list({
      filter: [
        { "op": "eq", "field": "contractId", "value": contractId },
        { "op": "eq", "field": "isActive", "value": true }
      ]
    });
  }
} 