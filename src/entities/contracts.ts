import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IContracts {
  id?: number;
  [key: string]: any;
}

export interface IContractsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Contracts entity class for Autotask API
 *
 * Service contracts and agreements
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractsEntity.htm}
 */
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
        operation: 'createContracts',
        requiredParams: ['contracts'],
        optionalParams: [],
        returnType: 'IContracts',
        endpoint: '/Contracts',
      },
      {
        operation: 'getContracts',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IContracts',
        endpoint: '/Contracts/{id}',
      },
      {
        operation: 'updateContracts',
        requiredParams: ['id', 'contracts'],
        optionalParams: [],
        returnType: 'IContracts',
        endpoint: '/Contracts/{id}',
      },
      {
        operation: 'listContracts',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IContracts[]',
        endpoint: '/Contracts',
      },
    ];
  }

  /**
   * Create a new contracts
   * @param contracts - The contracts data to create
   * @returns Promise with the created contracts
   */
  async create(contracts: IContracts): Promise<ApiResponse<IContracts>> {
    this.logger.info('Creating contracts', { contracts });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contracts),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a contracts by ID
   * @param id - The contracts ID
   * @returns Promise with the contracts data
   */
  async get(id: number): Promise<ApiResponse<IContracts>> {
    this.logger.info('Getting contracts', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a contracts
   * @param id - The contracts ID
   * @param contracts - The updated contracts data
   * @returns Promise with the updated contracts
   */
  async update(
    id: number,
    contracts: Partial<IContracts>
  ): Promise<ApiResponse<IContracts>> {
    this.logger.info('Updating contracts', { id, contracts });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, contracts),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a contracts
   * @param id - The contracts ID
   * @param contracts - The partial contracts data to update
   * @returns Promise with the updated contracts
   */
  async patch(
    id: number,
    contracts: Partial<IContracts>
  ): Promise<ApiResponse<IContracts>> {
    this.logger.info('Patching contracts', { id, contracts });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, contracts),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a contracts
   * @param id - The contracts ID to delete
   * @returns Promise with void response
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contracts', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List contracts with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of contracts
   */
  async list(query: IContractsQuery = {}): Promise<ApiResponse<IContracts[]>> {
    this.logger.info('Listing contracts', { query });
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
      async () =>
        this.axios.get(`${this.endpoint}/query`, { params: searchBody }),
      `${this.endpoint}/query`,
      'GET'
    );
  }
}
