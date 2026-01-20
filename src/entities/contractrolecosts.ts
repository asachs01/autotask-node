import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IContractRoleCosts {
  id?: number;
  [key: string]: any;
}

export interface IContractRoleCostsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ContractRoleCosts entity class for Autotask API
 * 
 * Role costs for contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractRoleCostsEntity.htm}
 */
export class ContractRoleCosts extends BaseEntity {
  private readonly endpoint = '/ContractRoleCosts';

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
        operation: 'createContractRoleCosts',
        requiredParams: ['contractRoleCosts'],
        optionalParams: [],
        returnType: 'IContractRoleCosts',
        endpoint: '/ContractRoleCosts',
      },
      {
        operation: 'getContractRoleCosts',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IContractRoleCosts',
        endpoint: '/ContractRoleCosts/{id}',
      },
      {
        operation: 'updateContractRoleCosts',
        requiredParams: ['id', 'contractRoleCosts'],
        optionalParams: [],
        returnType: 'IContractRoleCosts',
        endpoint: '/ContractRoleCosts/{id}',
      },
      {
        operation: 'deleteContractRoleCosts',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ContractRoleCosts/{id}',
      },
      {
        operation: 'listContractRoleCosts',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IContractRoleCosts[]',
        endpoint: '/ContractRoleCosts',
      }
    ];
  }

  /**
   * Create a new contractrolecosts
   * @param contractRoleCosts - The contractrolecosts data to create
   * @returns Promise with the created contractrolecosts
   */
  async create(contractRoleCosts: IContractRoleCosts): Promise<ApiResponse<IContractRoleCosts>> {
    this.logger.info('Creating contractrolecosts', { contractRoleCosts });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contractRoleCosts),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a contractrolecosts by ID
   * @param id - The contractrolecosts ID
   * @returns Promise with the contractrolecosts data
   */
  async get(id: number): Promise<ApiResponse<IContractRoleCosts>> {
    this.logger.info('Getting contractrolecosts', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a contractrolecosts
   * @param id - The contractrolecosts ID
   * @param contractRoleCosts - The updated contractrolecosts data
   * @returns Promise with the updated contractrolecosts
   */
  async update(
    id: number,
    contractRoleCosts: Partial<IContractRoleCosts>
  ): Promise<ApiResponse<IContractRoleCosts>> {
    this.logger.info('Updating contractrolecosts', { id, contractRoleCosts });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, contractRoleCosts),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a contractrolecosts
   * @param id - The contractrolecosts ID
   * @param contractRoleCosts - The partial contractrolecosts data to update
   * @returns Promise with the updated contractrolecosts
   */
  async patch(
    id: number,
    contractRoleCosts: Partial<IContractRoleCosts>
  ): Promise<ApiResponse<IContractRoleCosts>> {
    this.logger.info('Patching contractrolecosts', { id, contractRoleCosts });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, contractRoleCosts),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a contractrolecosts
   * @param id - The contractrolecosts ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contractrolecosts', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List contractrolecosts with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of contractrolecosts
   */
  async list(query: IContractRoleCostsQuery = {}): Promise<ApiResponse<IContractRoleCosts[]>> {
    this.logger.info('Listing contractrolecosts', { query });
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