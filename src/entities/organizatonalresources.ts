import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IOrganizatonalResources {
  id?: number;
  [key: string]: any;
}

export interface IOrganizatonalResourcesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * OrganizatonalResources entity class for Autotask API
 * 
 * Resources organized by organizational structure
 * Supported Operations: GET
 * Category: organizational
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/OrganizatonalResourcesEntity.htm}
 */
export class OrganizatonalResources extends BaseEntity {
  private readonly endpoint = '/OrganizatonalResources';

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
        operation: 'getOrganizatonalResources',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IOrganizatonalResources',
        endpoint: '/OrganizatonalResources/{id}',
      },
      {
        operation: 'listOrganizatonalResources',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IOrganizatonalResources[]',
        endpoint: '/OrganizatonalResources',
      }
    ];
  }

  /**
   * Get a organizatonalresources by ID
   * @param id - The organizatonalresources ID
   * @returns Promise with the organizatonalresources data
   */
  async get(id: number): Promise<ApiResponse<IOrganizatonalResources>> {
    this.logger.info('Getting organizatonalresources', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List organizatonalresources with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of organizatonalresources
   */
  async list(query: IOrganizatonalResourcesQuery = {}): Promise<ApiResponse<IOrganizatonalResources[]>> {
    this.logger.info('Listing organizatonalresources', { query });
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