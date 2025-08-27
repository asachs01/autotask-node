import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IUserDefinedFieldListItems {
  id?: number;
  [key: string]: any;
}

export interface IUserDefinedFieldListItemsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * UserDefinedFieldListItems entity class for Autotask API
 * 
 * List items for user-defined fields
 * Supported Operations: GET
 * Category: user_defined
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/UserDefinedFieldListItemsEntity.htm}
 */
export class UserDefinedFieldListItems extends BaseEntity {
  private readonly endpoint = '/UserDefinedFieldListItems';

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
        operation: 'getUserDefinedFieldListItems',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IUserDefinedFieldListItems',
        endpoint: '/UserDefinedFieldListItems/{id}',
      },
      {
        operation: 'listUserDefinedFieldListItems',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IUserDefinedFieldListItems[]',
        endpoint: '/UserDefinedFieldListItems',
      }
    ];
  }

  /**
   * Get a userdefinedfieldlistitems by ID
   * @param id - The userdefinedfieldlistitems ID
   * @returns Promise with the userdefinedfieldlistitems data
   */
  async get(id: number): Promise<ApiResponse<IUserDefinedFieldListItems>> {
    this.logger.info('Getting userdefinedfieldlistitems', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List userdefinedfieldlistitems with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of userdefinedfieldlistitems
   */
  async list(query: IUserDefinedFieldListItemsQuery = {}): Promise<ApiResponse<IUserDefinedFieldListItems[]>> {
    this.logger.info('Listing userdefinedfieldlistitems', { query });
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