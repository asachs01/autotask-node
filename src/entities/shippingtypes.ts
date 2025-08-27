import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IShippingTypes {
  id?: number;
  [key: string]: any;
}

export interface IShippingTypesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ShippingTypes entity class for Autotask API
 * 
 * Available shipping methods
 * Supported Operations: GET
 * Category: lookup
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ShippingTypesEntity.htm}
 */
export class ShippingTypes extends BaseEntity {
  private readonly endpoint = '/ShippingTypes';

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
        operation: 'getShippingTypes',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IShippingTypes',
        endpoint: '/ShippingTypes/{id}',
      },
      {
        operation: 'listShippingTypes',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IShippingTypes[]',
        endpoint: '/ShippingTypes',
      }
    ];
  }

  /**
   * Get a shippingtypes by ID
   * @param id - The shippingtypes ID
   * @returns Promise with the shippingtypes data
   */
  async get(id: number): Promise<ApiResponse<IShippingTypes>> {
    this.logger.info('Getting shippingtypes', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List shippingtypes with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of shippingtypes
   */
  async list(query: IShippingTypesQuery = {}): Promise<ApiResponse<IShippingTypes[]>> {
    this.logger.info('Listing shippingtypes', { query });
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