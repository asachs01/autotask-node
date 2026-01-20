import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IServiceCallTasks {
  id?: number;
  [key: string]: any;
}

export interface IServiceCallTasksQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ServiceCallTasks entity class for Autotask API
 * 
 * Tasks within service calls
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: service_calls
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ServiceCallTasksEntity.htm}
 */
export class ServiceCallTasks extends BaseEntity {
  private readonly endpoint = '/ServiceCallTasks';

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
        operation: 'createServiceCallTasks',
        requiredParams: ['serviceCallTasks'],
        optionalParams: [],
        returnType: 'IServiceCallTasks',
        endpoint: '/ServiceCallTasks',
      },
      {
        operation: 'getServiceCallTasks',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IServiceCallTasks',
        endpoint: '/ServiceCallTasks/{id}',
      },
      {
        operation: 'updateServiceCallTasks',
        requiredParams: ['id', 'serviceCallTasks'],
        optionalParams: [],
        returnType: 'IServiceCallTasks',
        endpoint: '/ServiceCallTasks/{id}',
      },
      {
        operation: 'deleteServiceCallTasks',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ServiceCallTasks/{id}',
      },
      {
        operation: 'listServiceCallTasks',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IServiceCallTasks[]',
        endpoint: '/ServiceCallTasks',
      }
    ];
  }

  /**
   * Create a new servicecalltasks
   * @param serviceCallTasks - The servicecalltasks data to create
   * @returns Promise with the created servicecalltasks
   */
  async create(serviceCallTasks: IServiceCallTasks): Promise<ApiResponse<IServiceCallTasks>> {
    this.logger.info('Creating servicecalltasks', { serviceCallTasks });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, serviceCallTasks),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a servicecalltasks by ID
   * @param id - The servicecalltasks ID
   * @returns Promise with the servicecalltasks data
   */
  async get(id: number): Promise<ApiResponse<IServiceCallTasks>> {
    this.logger.info('Getting servicecalltasks', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a servicecalltasks
   * @param id - The servicecalltasks ID
   * @param serviceCallTasks - The updated servicecalltasks data
   * @returns Promise with the updated servicecalltasks
   */
  async update(
    id: number,
    serviceCallTasks: Partial<IServiceCallTasks>
  ): Promise<ApiResponse<IServiceCallTasks>> {
    this.logger.info('Updating servicecalltasks', { id, serviceCallTasks });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, serviceCallTasks),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a servicecalltasks
   * @param id - The servicecalltasks ID
   * @param serviceCallTasks - The partial servicecalltasks data to update
   * @returns Promise with the updated servicecalltasks
   */
  async patch(
    id: number,
    serviceCallTasks: Partial<IServiceCallTasks>
  ): Promise<ApiResponse<IServiceCallTasks>> {
    this.logger.info('Patching servicecalltasks', { id, serviceCallTasks });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, serviceCallTasks),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a servicecalltasks
   * @param id - The servicecalltasks ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting servicecalltasks', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List servicecalltasks with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of servicecalltasks
   */
  async list(query: IServiceCallTasksQuery = {}): Promise<ApiResponse<IServiceCallTasks[]>> {
    this.logger.info('Listing servicecalltasks', { query });
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