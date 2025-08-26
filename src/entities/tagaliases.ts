import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ITagAliases {
  id?: number;
  [key: string]: any;
}

export interface ITagAliasesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * TagAliases entity class for Autotask API
 * 
 * Alternative names for tags
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: tags
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TagAliasesEntity.htm}
 */
export class TagAliases extends BaseEntity {
  private readonly endpoint = '/TagAliases';

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
        operation: 'createTagAliases',
        requiredParams: ['tagAliases'],
        optionalParams: [],
        returnType: 'ITagAliases',
        endpoint: '/TagAliases',
      },
      {
        operation: 'getTagAliases',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ITagAliases',
        endpoint: '/TagAliases/{id}',
      },
      {
        operation: 'updateTagAliases',
        requiredParams: ['id', 'tagAliases'],
        optionalParams: [],
        returnType: 'ITagAliases',
        endpoint: '/TagAliases/{id}',
      },
      {
        operation: 'deleteTagAliases',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/TagAliases/{id}',
      },
      {
        operation: 'listTagAliases',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ITagAliases[]',
        endpoint: '/TagAliases',
      }
    ];
  }

  /**
   * Create a new tagaliases
   * @param tagAliases - The tagaliases data to create
   * @returns Promise with the created tagaliases
   */
  async create(tagAliases: ITagAliases): Promise<ApiResponse<ITagAliases>> {
    this.logger.info('Creating tagaliases', { tagAliases });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, tagAliases),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a tagaliases by ID
   * @param id - The tagaliases ID
   * @returns Promise with the tagaliases data
   */
  async get(id: number): Promise<ApiResponse<ITagAliases>> {
    this.logger.info('Getting tagaliases', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a tagaliases
   * @param id - The tagaliases ID
   * @param tagAliases - The updated tagaliases data
   * @returns Promise with the updated tagaliases
   */
  async update(
    id: number,
    tagAliases: Partial<ITagAliases>
  ): Promise<ApiResponse<ITagAliases>> {
    this.logger.info('Updating tagaliases', { id, tagAliases });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, tagAliases),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a tagaliases
   * @param id - The tagaliases ID
   * @param tagAliases - The partial tagaliases data to update
   * @returns Promise with the updated tagaliases
   */
  async patch(
    id: number,
    tagAliases: Partial<ITagAliases>
  ): Promise<ApiResponse<ITagAliases>> {
    this.logger.info('Patching tagaliases', { id, tagAliases });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, tagAliases),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a tagaliases
   * @param id - The tagaliases ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting tagaliases', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List tagaliases with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of tagaliases
   */
  async list(query: ITagAliasesQuery = {}): Promise<ApiResponse<ITagAliases[]>> {
    this.logger.info('Listing tagaliases', { query });
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