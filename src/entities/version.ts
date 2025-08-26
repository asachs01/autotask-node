import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IVersion {
  id?: number;
  [key: string]: any;
}

export interface IVersionQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Version entity class for Autotask API
 * 
 * API version information
 * Supported Operations: GET
 * Category: lookup
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/VersionEntity.htm}
 */
export class Version extends BaseEntity {
  private readonly endpoint = '/Version';

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
        operation: 'getVersion',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IVersion',
        endpoint: '/Version/{id}',
      },
      {
        operation: 'listVersion',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IVersion[]',
        endpoint: '/Version',
      }
    ];
  }

  /**
   * Get a version by ID
   * @param id - The version ID
   * @returns Promise with the version data
   */
  async get(id: number): Promise<ApiResponse<IVersion>> {
    this.logger.info('Getting version', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List version with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of version
   */
  async list(query: IVersionQuery = {}): Promise<ApiResponse<IVersion[]>> {
    this.logger.info('Listing version', { query });
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