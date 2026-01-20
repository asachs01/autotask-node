import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IContractBlocks {
  id?: number;
  [key: string]: any;
}

export interface IContractBlocksQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ContractBlocks entity class for Autotask API
 * 
 * Time blocks for contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractBlocksEntity.htm}
 */
export class ContractBlocks extends BaseEntity {
  private readonly endpoint = '/ContractBlocks';

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
        operation: 'createContractBlocks',
        requiredParams: ['contractBlocks'],
        optionalParams: [],
        returnType: 'IContractBlocks',
        endpoint: '/ContractBlocks',
      },
      {
        operation: 'getContractBlocks',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IContractBlocks',
        endpoint: '/ContractBlocks/{id}',
      },
      {
        operation: 'updateContractBlocks',
        requiredParams: ['id', 'contractBlocks'],
        optionalParams: [],
        returnType: 'IContractBlocks',
        endpoint: '/ContractBlocks/{id}',
      },
      {
        operation: 'deleteContractBlocks',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ContractBlocks/{id}',
      },
      {
        operation: 'listContractBlocks',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IContractBlocks[]',
        endpoint: '/ContractBlocks',
      }
    ];
  }

  /**
   * Create a new contractblocks
   * @param contractBlocks - The contractblocks data to create
   * @returns Promise with the created contractblocks
   */
  async create(contractBlocks: IContractBlocks): Promise<ApiResponse<IContractBlocks>> {
    this.logger.info('Creating contractblocks', { contractBlocks });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contractBlocks),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a contractblocks by ID
   * @param id - The contractblocks ID
   * @returns Promise with the contractblocks data
   */
  async get(id: number): Promise<ApiResponse<IContractBlocks>> {
    this.logger.info('Getting contractblocks', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a contractblocks
   * @param id - The contractblocks ID
   * @param contractBlocks - The updated contractblocks data
   * @returns Promise with the updated contractblocks
   */
  async update(
    id: number,
    contractBlocks: Partial<IContractBlocks>
  ): Promise<ApiResponse<IContractBlocks>> {
    this.logger.info('Updating contractblocks', { id, contractBlocks });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, contractBlocks),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a contractblocks
   * @param id - The contractblocks ID
   * @param contractBlocks - The partial contractblocks data to update
   * @returns Promise with the updated contractblocks
   */
  async patch(
    id: number,
    contractBlocks: Partial<IContractBlocks>
  ): Promise<ApiResponse<IContractBlocks>> {
    this.logger.info('Patching contractblocks', { id, contractBlocks });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, contractBlocks),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a contractblocks
   * @param id - The contractblocks ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contractblocks', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List contractblocks with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of contractblocks
   */
  async list(query: IContractBlocksQuery = {}): Promise<ApiResponse<IContractBlocks[]>> {
    this.logger.info('Listing contractblocks', { query });
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