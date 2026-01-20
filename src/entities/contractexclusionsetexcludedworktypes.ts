import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IContractExclusionSetExcludedWorkTypes {
  id?: number;
  [key: string]: any;
}

export interface IContractExclusionSetExcludedWorkTypesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ContractExclusionSetExcludedWorkTypes entity class for Autotask API
 * 
 * Excluded work types within contract exclusion sets
 * Supported Operations: GET, POST, DELETE
 * Category: contracts
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractExclusionSetExcludedWorkTypesEntity.htm}
 */
export class ContractExclusionSetExcludedWorkTypes extends BaseEntity {
  private readonly endpoint = '/ContractExclusionSetExcludedWorkTypes';

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
        operation: 'createContractExclusionSetExcludedWorkTypes',
        requiredParams: ['contractExclusionSetExcludedWorkTypes'],
        optionalParams: [],
        returnType: 'IContractExclusionSetExcludedWorkTypes',
        endpoint: '/ContractExclusionSetExcludedWorkTypes',
      },
      {
        operation: 'getContractExclusionSetExcludedWorkTypes',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IContractExclusionSetExcludedWorkTypes',
        endpoint: '/ContractExclusionSetExcludedWorkTypes/{id}',
      },
      {
        operation: 'deleteContractExclusionSetExcludedWorkTypes',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ContractExclusionSetExcludedWorkTypes/{id}',
      },
      {
        operation: 'listContractExclusionSetExcludedWorkTypes',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IContractExclusionSetExcludedWorkTypes[]',
        endpoint: '/ContractExclusionSetExcludedWorkTypes',
      }
    ];
  }

  /**
   * Create a new contractexclusionsetexcludedworktypes
   * @param contractExclusionSetExcludedWorkTypes - The contractexclusionsetexcludedworktypes data to create
   * @returns Promise with the created contractexclusionsetexcludedworktypes
   */
  async create(contractExclusionSetExcludedWorkTypes: IContractExclusionSetExcludedWorkTypes): Promise<ApiResponse<IContractExclusionSetExcludedWorkTypes>> {
    this.logger.info('Creating contractexclusionsetexcludedworktypes', { contractExclusionSetExcludedWorkTypes });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contractExclusionSetExcludedWorkTypes),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a contractexclusionsetexcludedworktypes by ID
   * @param id - The contractexclusionsetexcludedworktypes ID
   * @returns Promise with the contractexclusionsetexcludedworktypes data
   */
  async get(id: number): Promise<ApiResponse<IContractExclusionSetExcludedWorkTypes>> {
    this.logger.info('Getting contractexclusionsetexcludedworktypes', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a contractexclusionsetexcludedworktypes
   * @param id - The contractexclusionsetexcludedworktypes ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contractexclusionsetexcludedworktypes', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List contractexclusionsetexcludedworktypes with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of contractexclusionsetexcludedworktypes
   */
  async list(query: IContractExclusionSetExcludedWorkTypesQuery = {}): Promise<ApiResponse<IContractExclusionSetExcludedWorkTypes[]>> {
    this.logger.info('Listing contractexclusionsetexcludedworktypes', { query });
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