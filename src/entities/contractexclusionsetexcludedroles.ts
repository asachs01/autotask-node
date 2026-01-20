import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IContractExclusionSetExcludedRoles {
  id?: number;
  [key: string]: any;
}

export interface IContractExclusionSetExcludedRolesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ContractExclusionSetExcludedRoles entity class for Autotask API
 * 
 * Excluded roles within contract exclusion sets
 * Supported Operations: GET, POST, DELETE
 * Category: contracts
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractExclusionSetExcludedRolesEntity.htm}
 */
export class ContractExclusionSetExcludedRoles extends BaseEntity {
  private readonly endpoint = '/ContractExclusionSetExcludedRoles';

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
        operation: 'createContractExclusionSetExcludedRoles',
        requiredParams: ['contractExclusionSetExcludedRoles'],
        optionalParams: [],
        returnType: 'IContractExclusionSetExcludedRoles',
        endpoint: '/ContractExclusionSetExcludedRoles',
      },
      {
        operation: 'getContractExclusionSetExcludedRoles',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IContractExclusionSetExcludedRoles',
        endpoint: '/ContractExclusionSetExcludedRoles/{id}',
      },
      {
        operation: 'deleteContractExclusionSetExcludedRoles',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ContractExclusionSetExcludedRoles/{id}',
      },
      {
        operation: 'listContractExclusionSetExcludedRoles',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IContractExclusionSetExcludedRoles[]',
        endpoint: '/ContractExclusionSetExcludedRoles',
      }
    ];
  }

  /**
   * Create a new contractexclusionsetexcludedroles
   * @param contractExclusionSetExcludedRoles - The contractexclusionsetexcludedroles data to create
   * @returns Promise with the created contractexclusionsetexcludedroles
   */
  async create(contractExclusionSetExcludedRoles: IContractExclusionSetExcludedRoles): Promise<ApiResponse<IContractExclusionSetExcludedRoles>> {
    this.logger.info('Creating contractexclusionsetexcludedroles', { contractExclusionSetExcludedRoles });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contractExclusionSetExcludedRoles),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a contractexclusionsetexcludedroles by ID
   * @param id - The contractexclusionsetexcludedroles ID
   * @returns Promise with the contractexclusionsetexcludedroles data
   */
  async get(id: number): Promise<ApiResponse<IContractExclusionSetExcludedRoles>> {
    this.logger.info('Getting contractexclusionsetexcludedroles', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a contractexclusionsetexcludedroles
   * @param id - The contractexclusionsetexcludedroles ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contractexclusionsetexcludedroles', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List contractexclusionsetexcludedroles with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of contractexclusionsetexcludedroles
   */
  async list(query: IContractExclusionSetExcludedRolesQuery = {}): Promise<ApiResponse<IContractExclusionSetExcludedRoles[]>> {
    this.logger.info('Listing contractexclusionsetexcludedroles', { query });
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