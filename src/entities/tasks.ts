import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ITasks {
  id?: number;
  [key: string]: any;
}

export interface ITasksQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Tasks entity class for Autotask API
 *
 * Project tasks and work items
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: core
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TasksEntity.htm}
 */
export class Tasks extends BaseEntity {
  private readonly endpoint = '/Tasks';

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
        operation: 'createTasks',
        requiredParams: ['tasks'],
        optionalParams: [],
        returnType: 'ITasks',
        endpoint: '/Tasks',
      },
      {
        operation: 'getTasks',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ITasks',
        endpoint: '/Tasks/{id}',
      },
      {
        operation: 'updateTasks',
        requiredParams: ['id', 'tasks'],
        optionalParams: [],
        returnType: 'ITasks',
        endpoint: '/Tasks/{id}',
      },
      {
        operation: 'listTasks',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ITasks[]',
        endpoint: '/Tasks',
      },
    ];
  }

  /**
   * Create a new tasks
   * @param tasks - The tasks data to create
   * @returns Promise with the created tasks
   */
  async create(tasks: ITasks): Promise<ApiResponse<ITasks>> {
    this.logger.info('Creating tasks', { tasks });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, tasks),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a tasks by ID
   * @param id - The tasks ID
   * @returns Promise with the tasks data
   */
  async get(id: number): Promise<ApiResponse<ITasks>> {
    this.logger.info('Getting tasks', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a tasks
   * @param id - The tasks ID
   * @param tasks - The updated tasks data
   * @returns Promise with the updated tasks
   */
  async update(
    id: number,
    tasks: Partial<ITasks>
  ): Promise<ApiResponse<ITasks>> {
    this.logger.info('Updating tasks', { id, tasks });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, tasks),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a tasks
   * @param id - The tasks ID
   * @param tasks - The partial tasks data to update
   * @returns Promise with the updated tasks
   */
  async patch(
    id: number,
    tasks: Partial<ITasks>
  ): Promise<ApiResponse<ITasks>> {
    this.logger.info('Patching tasks', { id, tasks });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, tasks),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a tasks
   * @param id - The tasks ID to delete
   * @returns Promise with void response
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting tasks', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List tasks with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of tasks
   */
  async list(query: ITasksQuery = {}): Promise<ApiResponse<ITasks[]>> {
    this.logger.info('Listing tasks', { query });
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
