import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IResourceTimeOffAdditional {
  id?: number;
  [key: string]: any;
}

export interface IResourceTimeOffAdditionalQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ResourceTimeOffAdditional entity class for Autotask API
 * 
 * Additional time off information for resources
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: time
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourceTimeOffAdditionalEntity.htm}
 */
export class ResourceTimeOffAdditional extends BaseEntity {
  private readonly endpoint = '/ResourceTimeOffAdditional';

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
        operation: 'createResourceTimeOffAdditional',
        requiredParams: ['resourceTimeOffAdditional'],
        optionalParams: [],
        returnType: 'IResourceTimeOffAdditional',
        endpoint: '/ResourceTimeOffAdditional',
      },
      {
        operation: 'getResourceTimeOffAdditional',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IResourceTimeOffAdditional',
        endpoint: '/ResourceTimeOffAdditional/{id}',
      },
      {
        operation: 'updateResourceTimeOffAdditional',
        requiredParams: ['id', 'resourceTimeOffAdditional'],
        optionalParams: [],
        returnType: 'IResourceTimeOffAdditional',
        endpoint: '/ResourceTimeOffAdditional/{id}',
      },
      {
        operation: 'deleteResourceTimeOffAdditional',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ResourceTimeOffAdditional/{id}',
      },
      {
        operation: 'listResourceTimeOffAdditional',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IResourceTimeOffAdditional[]',
        endpoint: '/ResourceTimeOffAdditional',
      }
    ];
  }

  /**
   * Create a new resourcetimeoffadditional
   * @param resourceTimeOffAdditional - The resourcetimeoffadditional data to create
   * @returns Promise with the created resourcetimeoffadditional
   */
  async create(resourceTimeOffAdditional: IResourceTimeOffAdditional): Promise<ApiResponse<IResourceTimeOffAdditional>> {
    this.logger.info('Creating resourcetimeoffadditional', { resourceTimeOffAdditional });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, resourceTimeOffAdditional),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a resourcetimeoffadditional by ID
   * @param id - The resourcetimeoffadditional ID
   * @returns Promise with the resourcetimeoffadditional data
   */
  async get(id: number): Promise<ApiResponse<IResourceTimeOffAdditional>> {
    this.logger.info('Getting resourcetimeoffadditional', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a resourcetimeoffadditional
   * @param id - The resourcetimeoffadditional ID
   * @param resourceTimeOffAdditional - The updated resourcetimeoffadditional data
   * @returns Promise with the updated resourcetimeoffadditional
   */
  async update(
    id: number,
    resourceTimeOffAdditional: Partial<IResourceTimeOffAdditional>
  ): Promise<ApiResponse<IResourceTimeOffAdditional>> {
    this.logger.info('Updating resourcetimeoffadditional', { id, resourceTimeOffAdditional });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, resourceTimeOffAdditional),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a resourcetimeoffadditional
   * @param id - The resourcetimeoffadditional ID
   * @param resourceTimeOffAdditional - The partial resourcetimeoffadditional data to update
   * @returns Promise with the updated resourcetimeoffadditional
   */
  async patch(
    id: number,
    resourceTimeOffAdditional: Partial<IResourceTimeOffAdditional>
  ): Promise<ApiResponse<IResourceTimeOffAdditional>> {
    this.logger.info('Patching resourcetimeoffadditional', { id, resourceTimeOffAdditional });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, resourceTimeOffAdditional),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a resourcetimeoffadditional
   * @param id - The resourcetimeoffadditional ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting resourcetimeoffadditional', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List resourcetimeoffadditional with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of resourcetimeoffadditional
   */
  async list(query: IResourceTimeOffAdditionalQuery = {}): Promise<ApiResponse<IResourceTimeOffAdditional[]>> {
    this.logger.info('Listing resourcetimeoffadditional', { query });
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