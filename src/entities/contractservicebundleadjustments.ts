import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IContractServiceBundleAdjustments {
  id?: number;
  [key: string]: any;
}

export interface IContractServiceBundleAdjustmentsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ContractServiceBundleAdjustments entity class for Autotask API
 * 
 * Adjustments to contract service bundles
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractServiceBundleAdjustmentsEntity.htm}
 */
export class ContractServiceBundleAdjustments extends BaseEntity {
  private readonly endpoint = '/ContractServiceBundleAdjustments';

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
        operation: 'createContractServiceBundleAdjustments',
        requiredParams: ['contractServiceBundleAdjustments'],
        optionalParams: [],
        returnType: 'IContractServiceBundleAdjustments',
        endpoint: '/ContractServiceBundleAdjustments',
      },
      {
        operation: 'getContractServiceBundleAdjustments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IContractServiceBundleAdjustments',
        endpoint: '/ContractServiceBundleAdjustments/{id}',
      },
      {
        operation: 'updateContractServiceBundleAdjustments',
        requiredParams: ['id', 'contractServiceBundleAdjustments'],
        optionalParams: [],
        returnType: 'IContractServiceBundleAdjustments',
        endpoint: '/ContractServiceBundleAdjustments/{id}',
      },
      {
        operation: 'deleteContractServiceBundleAdjustments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ContractServiceBundleAdjustments/{id}',
      },
      {
        operation: 'listContractServiceBundleAdjustments',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IContractServiceBundleAdjustments[]',
        endpoint: '/ContractServiceBundleAdjustments',
      }
    ];
  }

  /**
   * Create a new contractservicebundleadjustments
   * @param contractServiceBundleAdjustments - The contractservicebundleadjustments data to create
   * @returns Promise with the created contractservicebundleadjustments
   */
  async create(contractServiceBundleAdjustments: IContractServiceBundleAdjustments): Promise<ApiResponse<IContractServiceBundleAdjustments>> {
    this.logger.info('Creating contractservicebundleadjustments', { contractServiceBundleAdjustments });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contractServiceBundleAdjustments),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a contractservicebundleadjustments by ID
   * @param id - The contractservicebundleadjustments ID
   * @returns Promise with the contractservicebundleadjustments data
   */
  async get(id: number): Promise<ApiResponse<IContractServiceBundleAdjustments>> {
    this.logger.info('Getting contractservicebundleadjustments', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a contractservicebundleadjustments
   * @param id - The contractservicebundleadjustments ID
   * @param contractServiceBundleAdjustments - The updated contractservicebundleadjustments data
   * @returns Promise with the updated contractservicebundleadjustments
   */
  async update(
    id: number,
    contractServiceBundleAdjustments: Partial<IContractServiceBundleAdjustments>
  ): Promise<ApiResponse<IContractServiceBundleAdjustments>> {
    this.logger.info('Updating contractservicebundleadjustments', { id, contractServiceBundleAdjustments });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, contractServiceBundleAdjustments),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a contractservicebundleadjustments
   * @param id - The contractservicebundleadjustments ID
   * @param contractServiceBundleAdjustments - The partial contractservicebundleadjustments data to update
   * @returns Promise with the updated contractservicebundleadjustments
   */
  async patch(
    id: number,
    contractServiceBundleAdjustments: Partial<IContractServiceBundleAdjustments>
  ): Promise<ApiResponse<IContractServiceBundleAdjustments>> {
    this.logger.info('Patching contractservicebundleadjustments', { id, contractServiceBundleAdjustments });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, contractServiceBundleAdjustments),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a contractservicebundleadjustments
   * @param id - The contractservicebundleadjustments ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contractservicebundleadjustments', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List contractservicebundleadjustments with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of contractservicebundleadjustments
   */
  async list(query: IContractServiceBundleAdjustmentsQuery = {}): Promise<ApiResponse<IContractServiceBundleAdjustments[]>> {
    this.logger.info('Listing contractservicebundleadjustments', { query });
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
          // Handle nested objects like { id: { gte: 0 } }
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // Extract operator and value from nested object
            const [op, val] = Object.entries(value)[0] as [string, any];
            filterArray.push({
              op: op,
              field: field,
              value: val,
            });
          } else {
            filterArray.push({
              op: 'eq',
              field: field,
              value: value,
            });
          }
        }
        searchBody.filter = filterArray;
      } else {
        searchBody.filter = query.filter;
      }
    }

    if (query.sort) searchBody.sort = query.sort;
    if (query.page) searchBody.page = query.page;
    if (query.pageSize) searchBody.MaxRecords = query.pageSize;

    return this.executeQueryRequest(
      async () => this.axios.post(`${this.endpoint}/query`, searchBody),
      `${this.endpoint}/query`,
      'POST'
    );
  }
}