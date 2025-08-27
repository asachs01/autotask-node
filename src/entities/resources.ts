import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IResources {
  id?: number;
  [key: string]: any;
}

export interface IResourcesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Resources entity class for Autotask API
 *
 * Human resources and staff members
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: core
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourcesEntity.htm}
 */
export class Resources extends BaseEntity {
  private readonly endpoint = '/Resources';

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
        operation: 'createResources',
        requiredParams: ['resources'],
        optionalParams: [],
        returnType: 'IResources',
        endpoint: '/Resources',
      },
      {
        operation: 'getResources',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IResources',
        endpoint: '/Resources/{id}',
      },
      {
        operation: 'updateResources',
        requiredParams: ['id', 'resources'],
        optionalParams: [],
        returnType: 'IResources',
        endpoint: '/Resources/{id}',
      },
      {
        operation: 'listResources',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IResources[]',
        endpoint: '/Resources',
      },
    ];
  }

  /**
   * Create a new resources
   * @param resources - The resources data to create
   * @returns Promise with the created resources
   */
  async create(resources: IResources): Promise<ApiResponse<IResources>> {
    this.logger.info('Creating resources', { resources });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, resources),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a resources by ID
   * @param id - The resources ID
   * @returns Promise with the resources data
   */
  async get(id: number): Promise<ApiResponse<IResources>> {
    this.logger.info('Getting resources', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a resources
   * @param id - The resources ID
   * @param resources - The updated resources data
   * @returns Promise with the updated resources
   */
  async update(
    id: number,
    resources: Partial<IResources>
  ): Promise<ApiResponse<IResources>> {
    this.logger.info('Updating resources', { id, resources });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, resources),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a resources
   * @param id - The resources ID
   * @param resources - The partial resources data to update
   * @returns Promise with the updated resources
   */
  async patch(
    id: number,
    resources: Partial<IResources>
  ): Promise<ApiResponse<IResources>> {
    this.logger.info('Patching resources', { id, resources });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, resources),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * List resources with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of resources
   */
  async list(query: IResourcesQuery = {}): Promise<ApiResponse<IResources[]>> {
    this.logger.info('Listing resources', { query });
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
