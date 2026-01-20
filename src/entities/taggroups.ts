import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ITagGroups {
  id?: number;
  [key: string]: any;
}

export interface ITagGroupsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * TagGroups entity class for Autotask API
 * 
 * Groups for organizing tags
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: tags
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TagGroupsEntity.htm}
 */
export class TagGroups extends BaseEntity {
  private readonly endpoint = '/TagGroups';

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
        operation: 'createTagGroups',
        requiredParams: ['tagGroups'],
        optionalParams: [],
        returnType: 'ITagGroups',
        endpoint: '/TagGroups',
      },
      {
        operation: 'getTagGroups',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ITagGroups',
        endpoint: '/TagGroups/{id}',
      },
      {
        operation: 'updateTagGroups',
        requiredParams: ['id', 'tagGroups'],
        optionalParams: [],
        returnType: 'ITagGroups',
        endpoint: '/TagGroups/{id}',
      },
      {
        operation: 'deleteTagGroups',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/TagGroups/{id}',
      },
      {
        operation: 'listTagGroups',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ITagGroups[]',
        endpoint: '/TagGroups',
      }
    ];
  }

  /**
   * Create a new taggroups
   * @param tagGroups - The taggroups data to create
   * @returns Promise with the created taggroups
   */
  async create(tagGroups: ITagGroups): Promise<ApiResponse<ITagGroups>> {
    this.logger.info('Creating taggroups', { tagGroups });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, tagGroups),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a taggroups by ID
   * @param id - The taggroups ID
   * @returns Promise with the taggroups data
   */
  async get(id: number): Promise<ApiResponse<ITagGroups>> {
    this.logger.info('Getting taggroups', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a taggroups
   * @param id - The taggroups ID
   * @param tagGroups - The updated taggroups data
   * @returns Promise with the updated taggroups
   */
  async update(
    id: number,
    tagGroups: Partial<ITagGroups>
  ): Promise<ApiResponse<ITagGroups>> {
    this.logger.info('Updating taggroups', { id, tagGroups });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, tagGroups),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a taggroups
   * @param id - The taggroups ID
   * @param tagGroups - The partial taggroups data to update
   * @returns Promise with the updated taggroups
   */
  async patch(
    id: number,
    tagGroups: Partial<ITagGroups>
  ): Promise<ApiResponse<ITagGroups>> {
    this.logger.info('Patching taggroups', { id, tagGroups });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, tagGroups),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a taggroups
   * @param id - The taggroups ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting taggroups', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List taggroups with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of taggroups
   */
  async list(query: ITagGroupsQuery = {}): Promise<ApiResponse<ITagGroups[]>> {
    this.logger.info('Listing taggroups', { query });
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