import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IChangeRequestLinks {
  id?: number;
  [key: string]: any;
}

export interface IChangeRequestLinksQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ChangeRequestLinks entity class for Autotask API
 * 
 * Links between change requests
 * Supported Operations: GET, POST, DELETE
 * Category: associations
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ChangeRequestLinksEntity.htm}
 */
export class ChangeRequestLinks extends BaseEntity {
  private readonly endpoint = '/ChangeRequestLinks';

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
        operation: 'createChangeRequestLinks',
        requiredParams: ['changeRequestLinks'],
        optionalParams: [],
        returnType: 'IChangeRequestLinks',
        endpoint: '/ChangeRequestLinks',
      },
      {
        operation: 'getChangeRequestLinks',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IChangeRequestLinks',
        endpoint: '/ChangeRequestLinks/{id}',
      },
      {
        operation: 'deleteChangeRequestLinks',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ChangeRequestLinks/{id}',
      },
      {
        operation: 'listChangeRequestLinks',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IChangeRequestLinks[]',
        endpoint: '/ChangeRequestLinks',
      }
    ];
  }

  /**
   * Create a new changerequestlinks
   * @param changeRequestLinks - The changerequestlinks data to create
   * @returns Promise with the created changerequestlinks
   */
  async create(changeRequestLinks: IChangeRequestLinks): Promise<ApiResponse<IChangeRequestLinks>> {
    this.logger.info('Creating changerequestlinks', { changeRequestLinks });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, changeRequestLinks),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a changerequestlinks by ID
   * @param id - The changerequestlinks ID
   * @returns Promise with the changerequestlinks data
   */
  async get(id: number): Promise<ApiResponse<IChangeRequestLinks>> {
    this.logger.info('Getting changerequestlinks', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a changerequestlinks
   * @param id - The changerequestlinks ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting changerequestlinks', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List changerequestlinks with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of changerequestlinks
   */
  async list(query: IChangeRequestLinksQuery = {}): Promise<ApiResponse<IChangeRequestLinks[]>> {
    this.logger.info('Listing changerequestlinks', { query });
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