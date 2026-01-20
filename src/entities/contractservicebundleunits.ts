import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IContractServiceBundleUnits {
  id?: number;
  [key: string]: any;
}

export interface IContractServiceBundleUnitsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ContractServiceBundleUnits entity class for Autotask API
 * 
 * Units for contract service bundles
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractServiceBundleUnitsEntity.htm}
 */
export class ContractServiceBundleUnits extends BaseEntity {
  private readonly endpoint = '/ContractServiceBundleUnits';

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
        operation: 'createContractServiceBundleUnits',
        requiredParams: ['contractServiceBundleUnits'],
        optionalParams: [],
        returnType: 'IContractServiceBundleUnits',
        endpoint: '/ContractServiceBundleUnits',
      },
      {
        operation: 'getContractServiceBundleUnits',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IContractServiceBundleUnits',
        endpoint: '/ContractServiceBundleUnits/{id}',
      },
      {
        operation: 'updateContractServiceBundleUnits',
        requiredParams: ['id', 'contractServiceBundleUnits'],
        optionalParams: [],
        returnType: 'IContractServiceBundleUnits',
        endpoint: '/ContractServiceBundleUnits/{id}',
      },
      {
        operation: 'deleteContractServiceBundleUnits',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ContractServiceBundleUnits/{id}',
      },
      {
        operation: 'listContractServiceBundleUnits',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IContractServiceBundleUnits[]',
        endpoint: '/ContractServiceBundleUnits',
      }
    ];
  }

  /**
   * Create a new contractservicebundleunits
   * @param contractServiceBundleUnits - The contractservicebundleunits data to create
   * @returns Promise with the created contractservicebundleunits
   */
  async create(contractServiceBundleUnits: IContractServiceBundleUnits): Promise<ApiResponse<IContractServiceBundleUnits>> {
    this.logger.info('Creating contractservicebundleunits', { contractServiceBundleUnits });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contractServiceBundleUnits),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a contractservicebundleunits by ID
   * @param id - The contractservicebundleunits ID
   * @returns Promise with the contractservicebundleunits data
   */
  async get(id: number): Promise<ApiResponse<IContractServiceBundleUnits>> {
    this.logger.info('Getting contractservicebundleunits', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a contractservicebundleunits
   * @param id - The contractservicebundleunits ID
   * @param contractServiceBundleUnits - The updated contractservicebundleunits data
   * @returns Promise with the updated contractservicebundleunits
   */
  async update(
    id: number,
    contractServiceBundleUnits: Partial<IContractServiceBundleUnits>
  ): Promise<ApiResponse<IContractServiceBundleUnits>> {
    this.logger.info('Updating contractservicebundleunits', { id, contractServiceBundleUnits });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, contractServiceBundleUnits),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a contractservicebundleunits
   * @param id - The contractservicebundleunits ID
   * @param contractServiceBundleUnits - The partial contractservicebundleunits data to update
   * @returns Promise with the updated contractservicebundleunits
   */
  async patch(
    id: number,
    contractServiceBundleUnits: Partial<IContractServiceBundleUnits>
  ): Promise<ApiResponse<IContractServiceBundleUnits>> {
    this.logger.info('Patching contractservicebundleunits', { id, contractServiceBundleUnits });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, contractServiceBundleUnits),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a contractservicebundleunits
   * @param id - The contractservicebundleunits ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contractservicebundleunits', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List contractservicebundleunits with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of contractservicebundleunits
   */
  async list(query: IContractServiceBundleUnitsQuery = {}): Promise<ApiResponse<IContractServiceBundleUnits[]>> {
    this.logger.info('Listing contractservicebundleunits', { query });
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
    if (query.pageSize) searchBody.maxRecords = query.pageSize;

    return this.executeQueryRequest(
      async () => this.axios.post(`${this.endpoint}/query`, searchBody),
      `${this.endpoint}/query`,
      'POST'
    );
  }
}