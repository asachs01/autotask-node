import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IProjectNoteAttachments {
  id?: number;
  [key: string]: any;
}

export interface IProjectNoteAttachmentsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ProjectNoteAttachments entity class for Autotask API
 * 
 * File attachments for project notes
 * Supported Operations: GET, POST, DELETE
 * Category: notes
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ProjectNoteAttachmentsEntity.htm}
 */
export class ProjectNoteAttachments extends BaseEntity {
  private readonly endpoint = '/ProjectNoteAttachments';

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
        operation: 'createProjectNoteAttachments',
        requiredParams: ['projectNoteAttachments'],
        optionalParams: [],
        returnType: 'IProjectNoteAttachments',
        endpoint: '/ProjectNoteAttachments',
      },
      {
        operation: 'getProjectNoteAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IProjectNoteAttachments',
        endpoint: '/ProjectNoteAttachments/{id}',
      },
      {
        operation: 'deleteProjectNoteAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ProjectNoteAttachments/{id}',
      },
      {
        operation: 'listProjectNoteAttachments',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IProjectNoteAttachments[]',
        endpoint: '/ProjectNoteAttachments',
      }
    ];
  }

  /**
   * Create a new projectnoteattachments
   * @param projectNoteAttachments - The projectnoteattachments data to create
   * @returns Promise with the created projectnoteattachments
   */
  async create(projectNoteAttachments: IProjectNoteAttachments): Promise<ApiResponse<IProjectNoteAttachments>> {
    this.logger.info('Creating projectnoteattachments', { projectNoteAttachments });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, projectNoteAttachments),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a projectnoteattachments by ID
   * @param id - The projectnoteattachments ID
   * @returns Promise with the projectnoteattachments data
   */
  async get(id: number): Promise<ApiResponse<IProjectNoteAttachments>> {
    this.logger.info('Getting projectnoteattachments', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a projectnoteattachments
   * @param id - The projectnoteattachments ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting projectnoteattachments', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List projectnoteattachments with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of projectnoteattachments
   */
  async list(query: IProjectNoteAttachmentsQuery = {}): Promise<ApiResponse<IProjectNoteAttachments[]>> {
    this.logger.info('Listing projectnoteattachments', { query });
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