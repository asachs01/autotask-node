import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ITags {
  id?: number;
  [key: string]: any;
}

export interface ITagsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Tags entity class for Autotask API
 * 
 * Tags for categorizing and organizing data
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: tags
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TagsEntity.htm}
 */
export class Tags extends BaseEntity {
  private readonly endpoint = '/Tags';

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
        operation: 'createTags',
        requiredParams: ['tags'],
        optionalParams: [],
        returnType: 'ITags',
        endpoint: '/Tags',
      },
      {
        operation: 'getTags',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ITags',
        endpoint: '/Tags/{id}',
      },
      {
        operation: 'updateTags',
        requiredParams: ['id', 'tags'],
        optionalParams: [],
        returnType: 'ITags',
        endpoint: '/Tags/{id}',
      },
      {
        operation: 'deleteTags',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/Tags/{id}',
      },
      {
        operation: 'listTags',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ITags[]',
        endpoint: '/Tags',
      }
    ];
  }

  /**
   * Create a new tags
   * @param tags - The tags data to create
   * @returns Promise with the created tags
   */
  async create(tags: ITags): Promise<ApiResponse<ITags>> {
    this.logger.info('Creating tags', { tags });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, tags),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a tags by ID
   * @param id - The tags ID
   * @returns Promise with the tags data
   */
  async get(id: number): Promise<ApiResponse<ITags>> {
    this.logger.info('Getting tags', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a tags
   * @param id - The tags ID
   * @param tags - The updated tags data
   * @returns Promise with the updated tags
   */
  async update(
    id: number,
    tags: Partial<ITags>
  ): Promise<ApiResponse<ITags>> {
    this.logger.info('Updating tags', { id, tags });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, tags),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a tags
   * @param id - The tags ID
   * @param tags - The partial tags data to update
   * @returns Promise with the updated tags
   */
  async patch(
    id: number,
    tags: Partial<ITags>
  ): Promise<ApiResponse<ITags>> {
    this.logger.info('Patching tags', { id, tags });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, tags),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a tags
   * @param id - The tags ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting tags', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List tags with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of tags
   */
  async list(query: ITagsQuery = {}): Promise<ApiResponse<ITags[]>> {
    this.logger.info('Listing tags', { query });
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