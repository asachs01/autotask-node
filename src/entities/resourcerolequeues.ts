import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IResourceRoleQueues {
  id?: number;
  [key: string]: any;
}

export interface IResourceRoleQueuesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ResourceRoleQueues entity class for Autotask API
 * 
 * Queue assignments for resource roles
 * Supported Operations: GET, POST, DELETE
 * Category: lookup
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourceRoleQueuesEntity.htm}
 */
export class ResourceRoleQueues extends BaseEntity {
  private readonly endpoint = '/ResourceRoleQueues';

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
        operation: 'createResourceRoleQueues',
        requiredParams: ['resourceRoleQueues'],
        optionalParams: [],
        returnType: 'IResourceRoleQueues',
        endpoint: '/ResourceRoleQueues',
      },
      {
        operation: 'getResourceRoleQueues',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IResourceRoleQueues',
        endpoint: '/ResourceRoleQueues/{id}',
      },
      {
        operation: 'deleteResourceRoleQueues',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ResourceRoleQueues/{id}',
      },
      {
        operation: 'listResourceRoleQueues',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IResourceRoleQueues[]',
        endpoint: '/ResourceRoleQueues',
      }
    ];
  }

  /**
   * Create a new resourcerolequeues
   * @param resourceRoleQueues - The resourcerolequeues data to create
   * @returns Promise with the created resourcerolequeues
   */
  async create(resourceRoleQueues: IResourceRoleQueues): Promise<ApiResponse<IResourceRoleQueues>> {
    this.logger.info('Creating resourcerolequeues', { resourceRoleQueues });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, resourceRoleQueues),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a resourcerolequeues by ID
   * @param id - The resourcerolequeues ID
   * @returns Promise with the resourcerolequeues data
   */
  async get(id: number): Promise<ApiResponse<IResourceRoleQueues>> {
    this.logger.info('Getting resourcerolequeues', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a resourcerolequeues
   * @param id - The resourcerolequeues ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting resourcerolequeues', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List resourcerolequeues with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of resourcerolequeues
   */
  async list(query: IResourceRoleQueuesQuery = {}): Promise<ApiResponse<IResourceRoleQueues[]>> {
    this.logger.info('Listing resourcerolequeues', { query });
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