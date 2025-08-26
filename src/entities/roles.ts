import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IRoles {
  id?: number;
  [key: string]: any;
}

export interface IRolesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Roles entity class for Autotask API
 * 
 * System roles and permissions
 * Supported Operations: GET
 * Category: lookup
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/RolesEntity.htm}
 */
export class Roles extends BaseEntity {
  private readonly endpoint = '/Roles';

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
        operation: 'getRoles',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IRoles',
        endpoint: '/Roles/{id}',
      },
      {
        operation: 'listRoles',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IRoles[]',
        endpoint: '/Roles',
      }
    ];
  }

  /**
   * Get a roles by ID
   * @param id - The roles ID
   * @returns Promise with the roles data
   */
  async get(id: number): Promise<ApiResponse<IRoles>> {
    this.logger.info('Getting roles', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List roles with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of roles
   */
  async list(query: IRolesQuery = {}): Promise<ApiResponse<IRoles[]>> {
    this.logger.info('Listing roles', { query });
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