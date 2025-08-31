import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ITaskAttachments {
  id?: number;
  [key: string]: any;
}

export interface ITaskAttachmentsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * TaskAttachments entity class for Autotask API
 * 
 * File attachments for tasks
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TaskAttachmentsEntity.htm}
 */
export class TaskAttachments extends BaseEntity {
  private readonly endpoint = '/TaskAttachments';

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
        operation: 'createTaskAttachments',
        requiredParams: ['taskAttachments'],
        optionalParams: [],
        returnType: 'ITaskAttachments',
        endpoint: '/TaskAttachments',
      },
      {
        operation: 'getTaskAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ITaskAttachments',
        endpoint: '/TaskAttachments/{id}',
      },
      {
        operation: 'deleteTaskAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/TaskAttachments/{id}',
      },
      {
        operation: 'listTaskAttachments',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ITaskAttachments[]',
        endpoint: '/TaskAttachments',
      }
    ];
  }

  /**
   * Create a new taskattachments
   * @param taskAttachments - The taskattachments data to create
   * @returns Promise with the created taskattachments
   */
  async create(taskAttachments: ITaskAttachments): Promise<ApiResponse<ITaskAttachments>> {
    this.logger.info('Creating taskattachments', { taskAttachments });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, taskAttachments),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a taskattachments by ID
   * @param id - The taskattachments ID
   * @returns Promise with the taskattachments data
   */
  async get(id: number): Promise<ApiResponse<ITaskAttachments>> {
    this.logger.info('Getting taskattachments', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a taskattachments
   * @param id - The taskattachments ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting taskattachments', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List taskattachments with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of taskattachments
   */
  async list(query: ITaskAttachmentsQuery = {}): Promise<ApiResponse<ITaskAttachments[]>> {
    this.logger.info('Listing taskattachments', { query });
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