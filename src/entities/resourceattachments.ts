import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IResourceAttachments {
  id?: number;
  [key: string]: any;
}

export interface IResourceAttachmentsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ResourceAttachments entity class for Autotask API
 * 
 * File attachments for resources
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourceAttachmentsEntity.htm}
 */
export class ResourceAttachments extends BaseEntity {
  private readonly endpoint = '/ResourceAttachments';

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
        operation: 'createResourceAttachments',
        requiredParams: ['resourceAttachments'],
        optionalParams: [],
        returnType: 'IResourceAttachments',
        endpoint: '/ResourceAttachments',
      },
      {
        operation: 'getResourceAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IResourceAttachments',
        endpoint: '/ResourceAttachments/{id}',
      },
      {
        operation: 'deleteResourceAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ResourceAttachments/{id}',
      },
      {
        operation: 'listResourceAttachments',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IResourceAttachments[]',
        endpoint: '/ResourceAttachments',
      }
    ];
  }

  /**
   * Create a new resourceattachments
   * @param resourceAttachments - The resourceattachments data to create
   * @returns Promise with the created resourceattachments
   */
  async create(resourceAttachments: IResourceAttachments): Promise<ApiResponse<IResourceAttachments>> {
    this.logger.info('Creating resourceattachments', { resourceAttachments });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, resourceAttachments),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a resourceattachments by ID
   * @param id - The resourceattachments ID
   * @returns Promise with the resourceattachments data
   */
  async get(id: number): Promise<ApiResponse<IResourceAttachments>> {
    this.logger.info('Getting resourceattachments', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a resourceattachments
   * @param id - The resourceattachments ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting resourceattachments', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List resourceattachments with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of resourceattachments
   */
  async list(query: IResourceAttachmentsQuery = {}): Promise<ApiResponse<IResourceAttachments[]>> {
    this.logger.info('Listing resourceattachments', { query });
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