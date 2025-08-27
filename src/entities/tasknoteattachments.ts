import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ITaskNoteAttachments {
  id?: number;
  [key: string]: any;
}

export interface ITaskNoteAttachmentsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * TaskNoteAttachments entity class for Autotask API
 * 
 * File attachments for task notes
 * Supported Operations: GET, POST, DELETE
 * Category: notes
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TaskNoteAttachmentsEntity.htm}
 */
export class TaskNoteAttachments extends BaseEntity {
  private readonly endpoint = '/TaskNoteAttachments';

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
        operation: 'createTaskNoteAttachments',
        requiredParams: ['taskNoteAttachments'],
        optionalParams: [],
        returnType: 'ITaskNoteAttachments',
        endpoint: '/TaskNoteAttachments',
      },
      {
        operation: 'getTaskNoteAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ITaskNoteAttachments',
        endpoint: '/TaskNoteAttachments/{id}',
      },
      {
        operation: 'deleteTaskNoteAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/TaskNoteAttachments/{id}',
      },
      {
        operation: 'listTaskNoteAttachments',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ITaskNoteAttachments[]',
        endpoint: '/TaskNoteAttachments',
      }
    ];
  }

  /**
   * Create a new tasknoteattachments
   * @param taskNoteAttachments - The tasknoteattachments data to create
   * @returns Promise with the created tasknoteattachments
   */
  async create(taskNoteAttachments: ITaskNoteAttachments): Promise<ApiResponse<ITaskNoteAttachments>> {
    this.logger.info('Creating tasknoteattachments', { taskNoteAttachments });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, taskNoteAttachments),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a tasknoteattachments by ID
   * @param id - The tasknoteattachments ID
   * @returns Promise with the tasknoteattachments data
   */
  async get(id: number): Promise<ApiResponse<ITaskNoteAttachments>> {
    this.logger.info('Getting tasknoteattachments', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a tasknoteattachments
   * @param id - The tasknoteattachments ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting tasknoteattachments', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List tasknoteattachments with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of tasknoteattachments
   */
  async list(query: ITaskNoteAttachmentsQuery = {}): Promise<ApiResponse<ITaskNoteAttachments[]>> {
    this.logger.info('Listing tasknoteattachments', { query });
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