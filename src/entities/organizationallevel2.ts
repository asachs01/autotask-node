import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IOrganizationalLevel2 {
  id?: number;
  [key: string]: any;
}

export interface IOrganizationalLevel2Query {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * OrganizationalLevel2 entity class for Autotask API
 * 
 * Second level of organizational hierarchy
 * Supported Operations: GET
 * Category: organizational
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/OrganizationalLevel2Entity.htm}
 */
export class OrganizationalLevel2 extends BaseEntity {
  private readonly endpoint = '/OrganizationalLevel2';

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
        operation: 'getOrganizationalLevel2',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IOrganizationalLevel2',
        endpoint: '/OrganizationalLevel2/{id}',
      },
      {
        operation: 'listOrganizationalLevel2',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IOrganizationalLevel2[]',
        endpoint: '/OrganizationalLevel2',
      }
    ];
  }

  /**
   * Get a organizationallevel2 by ID
   * @param id - The organizationallevel2 ID
   * @returns Promise with the organizationallevel2 data
   */
  async get(id: number): Promise<ApiResponse<IOrganizationalLevel2>> {
    this.logger.info('Getting organizationallevel2', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List organizationallevel2 with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of organizationallevel2
   */
  async list(query: IOrganizationalLevel2Query = {}): Promise<ApiResponse<IOrganizationalLevel2[]>> {
    this.logger.info('Listing organizationallevel2', { query });
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