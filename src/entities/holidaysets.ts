import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IHolidaySets {
  id?: number;
  [key: string]: any;
}

export interface IHolidaySetsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * HolidaySets entity class for Autotask API
 * 
 * Sets of holidays for different regions
 * Supported Operations: GET
 * Category: time
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/HolidaySetsEntity.htm}
 */
export class HolidaySets extends BaseEntity {
  private readonly endpoint = '/HolidaySets';

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
        operation: 'getHolidaySets',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IHolidaySets',
        endpoint: '/HolidaySets/{id}',
      },
      {
        operation: 'listHolidaySets',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IHolidaySets[]',
        endpoint: '/HolidaySets',
      }
    ];
  }

  /**
   * Get a holidaysets by ID
   * @param id - The holidaysets ID
   * @returns Promise with the holidaysets data
   */
  async get(id: number): Promise<ApiResponse<IHolidaySets>> {
    this.logger.info('Getting holidaysets', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List holidaysets with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of holidaysets
   */
  async list(query: IHolidaySetsQuery = {}): Promise<ApiResponse<IHolidaySets[]>> {
    this.logger.info('Listing holidaysets', { query });
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