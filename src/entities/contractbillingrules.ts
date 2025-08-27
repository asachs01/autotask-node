import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IContractBillingRules {
  id?: number;
  [key: string]: any;
}

export interface IContractBillingRulesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ContractBillingRules entity class for Autotask API
 * 
 * Billing rules for contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractBillingRulesEntity.htm}
 */
export class ContractBillingRules extends BaseEntity {
  private readonly endpoint = '/ContractBillingRules';

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
        operation: 'createContractBillingRules',
        requiredParams: ['contractBillingRules'],
        optionalParams: [],
        returnType: 'IContractBillingRules',
        endpoint: '/ContractBillingRules',
      },
      {
        operation: 'getContractBillingRules',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IContractBillingRules',
        endpoint: '/ContractBillingRules/{id}',
      },
      {
        operation: 'updateContractBillingRules',
        requiredParams: ['id', 'contractBillingRules'],
        optionalParams: [],
        returnType: 'IContractBillingRules',
        endpoint: '/ContractBillingRules/{id}',
      },
      {
        operation: 'deleteContractBillingRules',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ContractBillingRules/{id}',
      },
      {
        operation: 'listContractBillingRules',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IContractBillingRules[]',
        endpoint: '/ContractBillingRules',
      }
    ];
  }

  /**
   * Create a new contractbillingrules
   * @param contractBillingRules - The contractbillingrules data to create
   * @returns Promise with the created contractbillingrules
   */
  async create(contractBillingRules: IContractBillingRules): Promise<ApiResponse<IContractBillingRules>> {
    this.logger.info('Creating contractbillingrules', { contractBillingRules });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contractBillingRules),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a contractbillingrules by ID
   * @param id - The contractbillingrules ID
   * @returns Promise with the contractbillingrules data
   */
  async get(id: number): Promise<ApiResponse<IContractBillingRules>> {
    this.logger.info('Getting contractbillingrules', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a contractbillingrules
   * @param id - The contractbillingrules ID
   * @param contractBillingRules - The updated contractbillingrules data
   * @returns Promise with the updated contractbillingrules
   */
  async update(
    id: number,
    contractBillingRules: Partial<IContractBillingRules>
  ): Promise<ApiResponse<IContractBillingRules>> {
    this.logger.info('Updating contractbillingrules', { id, contractBillingRules });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, contractBillingRules),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a contractbillingrules
   * @param id - The contractbillingrules ID
   * @param contractBillingRules - The partial contractbillingrules data to update
   * @returns Promise with the updated contractbillingrules
   */
  async patch(
    id: number,
    contractBillingRules: Partial<IContractBillingRules>
  ): Promise<ApiResponse<IContractBillingRules>> {
    this.logger.info('Patching contractbillingrules', { id, contractBillingRules });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, contractBillingRules),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a contractbillingrules
   * @param id - The contractbillingrules ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contractbillingrules', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List contractbillingrules with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of contractbillingrules
   */
  async list(query: IContractBillingRulesQuery = {}): Promise<ApiResponse<IContractBillingRules[]>> {
    this.logger.info('Listing contractbillingrules', { query });
    const searchBody: Record<string, any> = {};

    // Set up basic filter if none provided
    if (!query.filter || Object.keys(query.filter).length === 0) {
      searchBody.filter = [
        {
          op: 'gte',
          field: 'id',
          value: 0,
        },
      ];
    } else {
      // Convert object filter to array format
      if (!Array.isArray(query.filter)) {
        const filterArray = [];
        for (const [field, value] of Object.entries(query.filter)) {
          filterArray.push({
            op: 'eq',
            field: field,
            value: value,
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

    return this.executeQueryRequest(
      async () => this.axios.get(`${this.endpoint}/query`, { params: searchBody }),
      `${this.endpoint}/query`,
      'GET'
    );
  }
}