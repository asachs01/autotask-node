import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IOrganizationalLevel1 {
  id?: number;
  [key: string]: any;
}

export interface IOrganizationalLevel1Query {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * OrganizationalLevel1 entity class for Autotask API
 * 
 * First level of organizational hierarchy
 * Supported Operations: GET
 * Category: organizational
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/OrganizationalLevel1Entity.htm}
 */
export class OrganizationalLevel1 extends BaseEntity {
  private readonly endpoint = '/OrganizationalLevel1';

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
        operation: 'getOrganizationalLevel1',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IOrganizationalLevel1',
        endpoint: '/OrganizationalLevel1/{id}',
      },
      {
        operation: 'listOrganizationalLevel1',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IOrganizationalLevel1[]',
        endpoint: '/OrganizationalLevel1',
      }
    ];
  }

  /**
   * Get a organizationallevel1 by ID
   * @param id - The organizationallevel1 ID
   * @returns Promise with the organizationallevel1 data
   */
  async get(id: number): Promise<ApiResponse<IOrganizationalLevel1>> {
    this.logger.info('Getting organizationallevel1', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List organizationallevel1 with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of organizationallevel1
   */
  async list(query: IOrganizationalLevel1Query = {}): Promise<ApiResponse<IOrganizationalLevel1[]>> {
    this.logger.info('Listing organizationallevel1', { query });
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