import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ContractService {
  id?: number;
  contractId?: number;
  serviceId?: number;
  unitPrice?: number;
  unitCost?: number;
  unitDiscount?: number;
  adjustedPrice?: number;
  quantity?: number;
  internalCurrencyUnitPrice?: number;
  internalCurrencyUnitCost?: number;
  internalCurrencyAdjustedPrice?: number;
  invoiceDescription?: string;
  isOptional?: boolean;
  quoteItemId?: number;
  [key: string]: any;
}

export interface ContractServiceQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export class ContractServices extends BaseEntity {
  private readonly endpoint = '/ContractServices';

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
        operation: 'createContractService',
        requiredParams: ['contractService'],
        optionalParams: [],
        returnType: 'ContractService',
        endpoint: '/ContractServices',
      },
      {
        operation: 'getContractService',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ContractService',
        endpoint: '/ContractServices/{id}',
      },
      {
        operation: 'updateContractService',
        requiredParams: ['id', 'contractService'],
        optionalParams: [],
        returnType: 'ContractService',
        endpoint: '/ContractServices/{id}',
      },
      {
        operation: 'deleteContractService',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ContractServices/{id}',
      },
      {
        operation: 'listContractServices',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ContractService[]',
        endpoint: '/ContractServices',
      },
    ];
  }

  async create(contractService: ContractService): Promise<ApiResponse<ContractService>> {
    this.logger.info('Creating contract service', { contractService });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contractService),
      this.endpoint,
      'POST'
    );
  }

  async get(id: number): Promise<ApiResponse<ContractService>> {
    this.logger.info('Getting contract service', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  async update(id: number, contractService: Partial<ContractService>): Promise<ApiResponse<ContractService>> {
    this.logger.info('Updating contract service', { id, contractService });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, contractService),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contract service', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  async list(query: ContractServiceQuery = {}): Promise<ApiResponse<ContractService[]>> {
    this.logger.info('Listing contract services', { query });
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
    
    this.logger.info('Listing contract services with search body', { searchBody });
    
    return this.executeRequest(
      async () => this.axios.post(`${this.endpoint}/query`, searchBody),
      `${this.endpoint}/query`,
      'POST'
    );
  }

  /**
   * Get all services for a specific contract
   */
  async getByContract(contractId: number): Promise<ApiResponse<ContractService[]>> {
    this.logger.info('Getting contract services by contract ID', { contractId });
    return this.list({
      filter: { contractId }
    });
  }
} 