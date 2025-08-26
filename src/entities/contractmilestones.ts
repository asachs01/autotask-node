import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IContractMilestones {
  id?: number;
  [key: string]: any;
}

export interface IContractMilestonesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ContractMilestones entity class for Autotask API
 * 
 * Milestones for contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractMilestonesEntity.htm}
 */
export class ContractMilestones extends BaseEntity {
  private readonly endpoint = '/ContractMilestones';

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
        operation: 'createContractMilestones',
        requiredParams: ['contractMilestones'],
        optionalParams: [],
        returnType: 'IContractMilestones',
        endpoint: '/ContractMilestones',
      },
      {
        operation: 'getContractMilestones',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IContractMilestones',
        endpoint: '/ContractMilestones/{id}',
      },
      {
        operation: 'updateContractMilestones',
        requiredParams: ['id', 'contractMilestones'],
        optionalParams: [],
        returnType: 'IContractMilestones',
        endpoint: '/ContractMilestones/{id}',
      },
      {
        operation: 'deleteContractMilestones',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ContractMilestones/{id}',
      },
      {
        operation: 'listContractMilestones',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IContractMilestones[]',
        endpoint: '/ContractMilestones',
      }
    ];
  }

  /**
   * Create a new contractmilestones
   * @param contractMilestones - The contractmilestones data to create
   * @returns Promise with the created contractmilestones
   */
  async create(contractMilestones: IContractMilestones): Promise<ApiResponse<IContractMilestones>> {
    this.logger.info('Creating contractmilestones', { contractMilestones });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contractMilestones),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a contractmilestones by ID
   * @param id - The contractmilestones ID
   * @returns Promise with the contractmilestones data
   */
  async get(id: number): Promise<ApiResponse<IContractMilestones>> {
    this.logger.info('Getting contractmilestones', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a contractmilestones
   * @param id - The contractmilestones ID
   * @param contractMilestones - The updated contractmilestones data
   * @returns Promise with the updated contractmilestones
   */
  async update(
    id: number,
    contractMilestones: Partial<IContractMilestones>
  ): Promise<ApiResponse<IContractMilestones>> {
    this.logger.info('Updating contractmilestones', { id, contractMilestones });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, contractMilestones),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a contractmilestones
   * @param id - The contractmilestones ID
   * @param contractMilestones - The partial contractmilestones data to update
   * @returns Promise with the updated contractmilestones
   */
  async patch(
    id: number,
    contractMilestones: Partial<IContractMilestones>
  ): Promise<ApiResponse<IContractMilestones>> {
    this.logger.info('Patching contractmilestones', { id, contractMilestones });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, contractMilestones),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a contractmilestones
   * @param id - The contractmilestones ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contractmilestones', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List contractmilestones with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of contractmilestones
   */
  async list(query: IContractMilestonesQuery = {}): Promise<ApiResponse<IContractMilestones[]>> {
    this.logger.info('Listing contractmilestones', { query });
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
      async () => this.axios.get(`${this.endpoint}/query`, { params: searchBody }),
      `${this.endpoint}/query`,
      'GET'
    );
  }
}