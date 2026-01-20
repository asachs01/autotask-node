import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ITaskSecondaryResources {
  id?: number;
  [key: string]: any;
}

export interface ITaskSecondaryResourcesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * TaskSecondaryResources entity class for Autotask API
 * 
 * Secondary resource assignments for tasks
 * Supported Operations: GET, POST, DELETE
 * Category: tasks
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TaskSecondaryResourcesEntity.htm}
 */
export class TaskSecondaryResources extends BaseEntity {
  private readonly endpoint = '/TaskSecondaryResources';

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
        operation: 'createTaskSecondaryResources',
        requiredParams: ['taskSecondaryResources'],
        optionalParams: [],
        returnType: 'ITaskSecondaryResources',
        endpoint: '/TaskSecondaryResources',
      },
      {
        operation: 'getTaskSecondaryResources',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ITaskSecondaryResources',
        endpoint: '/TaskSecondaryResources/{id}',
      },
      {
        operation: 'deleteTaskSecondaryResources',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/TaskSecondaryResources/{id}',
      },
      {
        operation: 'listTaskSecondaryResources',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ITaskSecondaryResources[]',
        endpoint: '/TaskSecondaryResources',
      }
    ];
  }

  /**
   * Create a new tasksecondaryresources
   * @param taskSecondaryResources - The tasksecondaryresources data to create
   * @returns Promise with the created tasksecondaryresources
   */
  async create(taskSecondaryResources: ITaskSecondaryResources): Promise<ApiResponse<ITaskSecondaryResources>> {
    this.logger.info('Creating tasksecondaryresources', { taskSecondaryResources });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, taskSecondaryResources),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a tasksecondaryresources by ID
   * @param id - The tasksecondaryresources ID
   * @returns Promise with the tasksecondaryresources data
   */
  async get(id: number): Promise<ApiResponse<ITaskSecondaryResources>> {
    this.logger.info('Getting tasksecondaryresources', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a tasksecondaryresources
   * @param id - The tasksecondaryresources ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting tasksecondaryresources', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List tasksecondaryresources with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of tasksecondaryresources
   */
  async list(query: ITaskSecondaryResourcesQuery = {}): Promise<ApiResponse<ITaskSecondaryResources[]>> {
    this.logger.info('Listing tasksecondaryresources', { query });
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