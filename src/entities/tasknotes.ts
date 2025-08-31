import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ITaskNotes {
  id?: number;
  [key: string]: any;
}

export interface ITaskNotesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * TaskNotes entity class for Autotask API
 * 
 * Notes for tasks
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: notes
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TaskNotesEntity.htm}
 */
export class TaskNotes extends BaseEntity {
  private readonly endpoint = '/TaskNotes';

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
        operation: 'createTaskNotes',
        requiredParams: ['taskNotes'],
        optionalParams: [],
        returnType: 'ITaskNotes',
        endpoint: '/TaskNotes',
      },
      {
        operation: 'getTaskNotes',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ITaskNotes',
        endpoint: '/TaskNotes/{id}',
      },
      {
        operation: 'updateTaskNotes',
        requiredParams: ['id', 'taskNotes'],
        optionalParams: [],
        returnType: 'ITaskNotes',
        endpoint: '/TaskNotes/{id}',
      },
      {
        operation: 'listTaskNotes',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ITaskNotes[]',
        endpoint: '/TaskNotes',
      }
    ];
  }

  /**
   * Create a new tasknotes
   * @param taskNotes - The tasknotes data to create
   * @returns Promise with the created tasknotes
   */
  async create(taskNotes: ITaskNotes): Promise<ApiResponse<ITaskNotes>> {
    this.logger.info('Creating tasknotes', { taskNotes });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, taskNotes),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a tasknotes by ID
   * @param id - The tasknotes ID
   * @returns Promise with the tasknotes data
   */
  async get(id: number): Promise<ApiResponse<ITaskNotes>> {
    this.logger.info('Getting tasknotes', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a tasknotes
   * @param id - The tasknotes ID
   * @param taskNotes - The updated tasknotes data
   * @returns Promise with the updated tasknotes
   */
  async update(
    id: number,
    taskNotes: Partial<ITaskNotes>
  ): Promise<ApiResponse<ITaskNotes>> {
    this.logger.info('Updating tasknotes', { id, taskNotes });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, taskNotes),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a tasknotes
   * @param id - The tasknotes ID
   * @param taskNotes - The partial tasknotes data to update
   * @returns Promise with the updated tasknotes
   */
  async patch(
    id: number,
    taskNotes: Partial<ITaskNotes>
  ): Promise<ApiResponse<ITaskNotes>> {
    this.logger.info('Patching tasknotes', { id, taskNotes });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, taskNotes),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * List tasknotes with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of tasknotes
   */
  async list(query: ITaskNotesQuery = {}): Promise<ApiResponse<ITaskNotes[]>> {
    this.logger.info('Listing tasknotes', { query });
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