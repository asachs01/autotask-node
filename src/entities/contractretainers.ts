import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IContractRetainers {
  id?: number;
  [key: string]: any;
}

export interface IContractRetainersQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ContractRetainers entity class for Autotask API
 * 
 * Retainers for contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractRetainersEntity.htm}
 */
export class ContractRetainers extends BaseEntity {
  private readonly endpoint = '/ContractRetainers';

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
        operation: 'createContractRetainers',
        requiredParams: ['contractRetainers'],
        optionalParams: [],
        returnType: 'IContractRetainers',
        endpoint: '/ContractRetainers',
      },
      {
        operation: 'getContractRetainers',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IContractRetainers',
        endpoint: '/ContractRetainers/{id}',
      },
      {
        operation: 'updateContractRetainers',
        requiredParams: ['id', 'contractRetainers'],
        optionalParams: [],
        returnType: 'IContractRetainers',
        endpoint: '/ContractRetainers/{id}',
      },
      {
        operation: 'deleteContractRetainers',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ContractRetainers/{id}',
      },
      {
        operation: 'listContractRetainers',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IContractRetainers[]',
        endpoint: '/ContractRetainers',
      }
    ];
  }

  /**
   * Create a new contractretainers
   * @param contractRetainers - The contractretainers data to create
   * @returns Promise with the created contractretainers
   */
  async create(contractRetainers: IContractRetainers): Promise<ApiResponse<IContractRetainers>> {
    this.logger.info('Creating contractretainers', { contractRetainers });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contractRetainers),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a contractretainers by ID
   * @param id - The contractretainers ID
   * @returns Promise with the contractretainers data
   */
  async get(id: number): Promise<ApiResponse<IContractRetainers>> {
    this.logger.info('Getting contractretainers', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a contractretainers
   * @param id - The contractretainers ID
   * @param contractRetainers - The updated contractretainers data
   * @returns Promise with the updated contractretainers
   */
  async update(
    id: number,
    contractRetainers: Partial<IContractRetainers>
  ): Promise<ApiResponse<IContractRetainers>> {
    this.logger.info('Updating contractretainers', { id, contractRetainers });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, contractRetainers),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a contractretainers
   * @param id - The contractretainers ID
   * @param contractRetainers - The partial contractretainers data to update
   * @returns Promise with the updated contractretainers
   */
  async patch(
    id: number,
    contractRetainers: Partial<IContractRetainers>
  ): Promise<ApiResponse<IContractRetainers>> {
    this.logger.info('Patching contractretainers', { id, contractRetainers });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, contractRetainers),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a contractretainers
   * @param id - The contractretainers ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contractretainers', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List contractretainers with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of contractretainers
   */
  async list(query: IContractRetainersQuery = {}): Promise<ApiResponse<IContractRetainers[]>> {
    this.logger.info('Listing contractretainers', { query });
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