import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface Contract {
  id?: number;
  accountId?: number;
  contractName?: string;
  contractNumber?: string;
  contractType?: number;
  status?: number;
  startDate?: string;
  endDate?: string;
  description?: string;
  contractValue?: number;
  setupFee?: number;
  contractPeriodType?: number;
  renewalValue?: number;
  isDefaultContract?: boolean;
  timeReportingRequiresStartAndStopTimes?: boolean;
  serviceLevelAgreementId?: number;
  purchaseOrderNumber?: string;
  opportunityId?: number;
  contactId?: number;
  contractExclusionSetId?: number;
  businessDivisionSubdivisionId?: number;
  [key: string]: any;
}

export interface ContractQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export class Contracts extends BaseEntity {
  private readonly endpoint = '/Contracts';

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
        operation: 'createContract',
        requiredParams: ['contract'],
        optionalParams: [],
        returnType: 'Contract',
        endpoint: '/Contracts',
      },
      {
        operation: 'getContract',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'Contract',
        endpoint: '/Contracts/{id}',
      },
      {
        operation: 'updateContract',
        requiredParams: ['id', 'contract'],
        optionalParams: [],
        returnType: 'Contract',
        endpoint: '/Contracts/{id}',
      },
      {
        operation: 'deleteContract',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/Contracts/{id}',
      },
      {
        operation: 'listContracts',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'Contract[]',
        endpoint: '/Contracts',
      },
    ];
  }

  async create(contract: Contract): Promise<ApiResponse<Contract>> {
    this.logger.info('Creating contract', { contract });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contract),
      this.endpoint,
      'POST'
    );
  }

  async get(id: number): Promise<ApiResponse<Contract>> {
    this.logger.info('Getting contract', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  async update(id: number, contract: Partial<Contract>): Promise<ApiResponse<Contract>> {
    this.logger.info('Updating contract', { id, contract });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, contract),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contract', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  async list(query: ContractQuery = {}): Promise<ApiResponse<Contract[]>> {
    this.logger.info('Listing contracts', { query });
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
    
    this.logger.info('Listing contracts with search body', { searchBody });
    
    return this.executeRequest(
      async () => this.axios.post(`${this.endpoint}/query`, searchBody),
      `${this.endpoint}/query`,
      'POST'
    );
  }
} 