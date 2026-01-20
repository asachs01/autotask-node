import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IContractExclusionRoles {
  id?: number;
  [key: string]: any;
}

export interface IContractExclusionRolesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ContractExclusionRoles entity class for Autotask API
 * 
 * Roles excluded from contracts
 * Supported Operations: GET, POST, DELETE
 * Category: contracts
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractExclusionRolesEntity.htm}
 */
export class ContractExclusionRoles extends BaseEntity {
  private readonly endpoint = '/ContractExclusionRoles';

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
        operation: 'createContractExclusionRoles',
        requiredParams: ['contractExclusionRoles'],
        optionalParams: [],
        returnType: 'IContractExclusionRoles',
        endpoint: '/ContractExclusionRoles',
      },
      {
        operation: 'getContractExclusionRoles',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IContractExclusionRoles',
        endpoint: '/ContractExclusionRoles/{id}',
      },
      {
        operation: 'deleteContractExclusionRoles',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ContractExclusionRoles/{id}',
      },
      {
        operation: 'listContractExclusionRoles',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IContractExclusionRoles[]',
        endpoint: '/ContractExclusionRoles',
      }
    ];
  }

  /**
   * Create a new contractexclusionroles
   * @param contractExclusionRoles - The contractexclusionroles data to create
   * @returns Promise with the created contractexclusionroles
   */
  async create(contractExclusionRoles: IContractExclusionRoles): Promise<ApiResponse<IContractExclusionRoles>> {
    this.logger.info('Creating contractexclusionroles', { contractExclusionRoles });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contractExclusionRoles),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a contractexclusionroles by ID
   * @param id - The contractexclusionroles ID
   * @returns Promise with the contractexclusionroles data
   */
  async get(id: number): Promise<ApiResponse<IContractExclusionRoles>> {
    this.logger.info('Getting contractexclusionroles', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a contractexclusionroles
   * @param id - The contractexclusionroles ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contractexclusionroles', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List contractexclusionroles with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of contractexclusionroles
   */
  async list(query: IContractExclusionRolesQuery = {}): Promise<ApiResponse<IContractExclusionRoles[]>> {
    this.logger.info('Listing contractexclusionroles', { query });
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