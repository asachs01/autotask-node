import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IResourceTimeOffApprovers {
  id?: number;
  [key: string]: any;
}

export interface IResourceTimeOffApproversQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ResourceTimeOffApprovers entity class for Autotask API
 * 
 * Approvers for resource time off requests
 * Supported Operations: GET, POST, DELETE
 * Category: time
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourceTimeOffApproversEntity.htm}
 */
export class ResourceTimeOffApprovers extends BaseEntity {
  private readonly endpoint = '/ResourceTimeOffApprovers';

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
        operation: 'createResourceTimeOffApprovers',
        requiredParams: ['resourceTimeOffApprovers'],
        optionalParams: [],
        returnType: 'IResourceTimeOffApprovers',
        endpoint: '/ResourceTimeOffApprovers',
      },
      {
        operation: 'getResourceTimeOffApprovers',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IResourceTimeOffApprovers',
        endpoint: '/ResourceTimeOffApprovers/{id}',
      },
      {
        operation: 'deleteResourceTimeOffApprovers',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ResourceTimeOffApprovers/{id}',
      },
      {
        operation: 'listResourceTimeOffApprovers',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IResourceTimeOffApprovers[]',
        endpoint: '/ResourceTimeOffApprovers',
      }
    ];
  }

  /**
   * Create a new resourcetimeoffapprovers
   * @param resourceTimeOffApprovers - The resourcetimeoffapprovers data to create
   * @returns Promise with the created resourcetimeoffapprovers
   */
  async create(resourceTimeOffApprovers: IResourceTimeOffApprovers): Promise<ApiResponse<IResourceTimeOffApprovers>> {
    this.logger.info('Creating resourcetimeoffapprovers', { resourceTimeOffApprovers });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, resourceTimeOffApprovers),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a resourcetimeoffapprovers by ID
   * @param id - The resourcetimeoffapprovers ID
   * @returns Promise with the resourcetimeoffapprovers data
   */
  async get(id: number): Promise<ApiResponse<IResourceTimeOffApprovers>> {
    this.logger.info('Getting resourcetimeoffapprovers', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a resourcetimeoffapprovers
   * @param id - The resourcetimeoffapprovers ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting resourcetimeoffapprovers', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List resourcetimeoffapprovers with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of resourcetimeoffapprovers
   */
  async list(query: IResourceTimeOffApproversQuery = {}): Promise<ApiResponse<IResourceTimeOffApprovers[]>> {
    this.logger.info('Listing resourcetimeoffapprovers', { query });
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