import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IContractExclusionSets {
  id?: number;
  [key: string]: any;
}

export interface IContractExclusionSetsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ContractExclusionSets entity class for Autotask API
 * 
 * Sets of exclusions for contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractExclusionSetsEntity.htm}
 */
export class ContractExclusionSets extends BaseEntity {
  private readonly endpoint = '/ContractExclusionSets';

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
        operation: 'createContractExclusionSets',
        requiredParams: ['contractExclusionSets'],
        optionalParams: [],
        returnType: 'IContractExclusionSets',
        endpoint: '/ContractExclusionSets',
      },
      {
        operation: 'getContractExclusionSets',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IContractExclusionSets',
        endpoint: '/ContractExclusionSets/{id}',
      },
      {
        operation: 'updateContractExclusionSets',
        requiredParams: ['id', 'contractExclusionSets'],
        optionalParams: [],
        returnType: 'IContractExclusionSets',
        endpoint: '/ContractExclusionSets/{id}',
      },
      {
        operation: 'deleteContractExclusionSets',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ContractExclusionSets/{id}',
      },
      {
        operation: 'listContractExclusionSets',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IContractExclusionSets[]',
        endpoint: '/ContractExclusionSets',
      }
    ];
  }

  /**
   * Create a new contractexclusionsets
   * @param contractExclusionSets - The contractexclusionsets data to create
   * @returns Promise with the created contractexclusionsets
   */
  async create(contractExclusionSets: IContractExclusionSets): Promise<ApiResponse<IContractExclusionSets>> {
    this.logger.info('Creating contractexclusionsets', { contractExclusionSets });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contractExclusionSets),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a contractexclusionsets by ID
   * @param id - The contractexclusionsets ID
   * @returns Promise with the contractexclusionsets data
   */
  async get(id: number): Promise<ApiResponse<IContractExclusionSets>> {
    this.logger.info('Getting contractexclusionsets', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a contractexclusionsets
   * @param id - The contractexclusionsets ID
   * @param contractExclusionSets - The updated contractexclusionsets data
   * @returns Promise with the updated contractexclusionsets
   */
  async update(
    id: number,
    contractExclusionSets: Partial<IContractExclusionSets>
  ): Promise<ApiResponse<IContractExclusionSets>> {
    this.logger.info('Updating contractexclusionsets', { id, contractExclusionSets });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, contractExclusionSets),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a contractexclusionsets
   * @param id - The contractexclusionsets ID
   * @param contractExclusionSets - The partial contractexclusionsets data to update
   * @returns Promise with the updated contractexclusionsets
   */
  async patch(
    id: number,
    contractExclusionSets: Partial<IContractExclusionSets>
  ): Promise<ApiResponse<IContractExclusionSets>> {
    this.logger.info('Patching contractexclusionsets', { id, contractExclusionSets });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, contractExclusionSets),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a contractexclusionsets
   * @param id - The contractexclusionsets ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contractexclusionsets', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List contractexclusionsets with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of contractexclusionsets
   */
  async list(query: IContractExclusionSetsQuery = {}): Promise<ApiResponse<IContractExclusionSets[]>> {
    this.logger.info('Listing contractexclusionsets', { query });
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