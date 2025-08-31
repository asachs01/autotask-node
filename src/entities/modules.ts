import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IModules {
  id?: number;
  [key: string]: any;
}

export interface IModulesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Modules entity class for Autotask API
 * 
 * System modules and features
 * Supported Operations: GET
 * Category: lookup
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ModulesEntity.htm}
 */
export class Modules extends BaseEntity {
  private readonly endpoint = '/Modules';

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
        operation: 'getModules',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IModules',
        endpoint: '/Modules/{id}',
      },
      {
        operation: 'listModules',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IModules[]',
        endpoint: '/Modules',
      }
    ];
  }

  /**
   * Get a modules by ID
   * @param id - The modules ID
   * @returns Promise with the modules data
   */
  async get(id: number): Promise<ApiResponse<IModules>> {
    this.logger.info('Getting modules', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List modules with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of modules
   */
  async list(query: IModulesQuery = {}): Promise<ApiResponse<IModules[]>> {
    this.logger.info('Listing modules', { query });
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