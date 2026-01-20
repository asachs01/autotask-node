import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IProjectAttachments {
  id?: number;
  [key: string]: any;
}

export interface IProjectAttachmentsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ProjectAttachments entity class for Autotask API
 * 
 * File attachments for projects
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ProjectAttachmentsEntity.htm}
 */
export class ProjectAttachments extends BaseEntity {
  private readonly endpoint = '/ProjectAttachments';

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
        operation: 'createProjectAttachments',
        requiredParams: ['projectAttachments'],
        optionalParams: [],
        returnType: 'IProjectAttachments',
        endpoint: '/ProjectAttachments',
      },
      {
        operation: 'getProjectAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IProjectAttachments',
        endpoint: '/ProjectAttachments/{id}',
      },
      {
        operation: 'deleteProjectAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ProjectAttachments/{id}',
      },
      {
        operation: 'listProjectAttachments',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IProjectAttachments[]',
        endpoint: '/ProjectAttachments',
      }
    ];
  }

  /**
   * Create a new projectattachments
   * @param projectAttachments - The projectattachments data to create
   * @returns Promise with the created projectattachments
   */
  async create(projectAttachments: IProjectAttachments): Promise<ApiResponse<IProjectAttachments>> {
    this.logger.info('Creating projectattachments', { projectAttachments });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, projectAttachments),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a projectattachments by ID
   * @param id - The projectattachments ID
   * @returns Promise with the projectattachments data
   */
  async get(id: number): Promise<ApiResponse<IProjectAttachments>> {
    this.logger.info('Getting projectattachments', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a projectattachments
   * @param id - The projectattachments ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting projectattachments', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List projectattachments with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of projectattachments
   */
  async list(query: IProjectAttachmentsQuery = {}): Promise<ApiResponse<IProjectAttachments[]>> {
    this.logger.info('Listing projectattachments', { query });
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