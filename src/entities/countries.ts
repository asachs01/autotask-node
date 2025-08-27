import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ICountries {
  id?: number;
  [key: string]: any;
}

export interface ICountriesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Countries entity class for Autotask API
 * 
 * List of countries for localization
 * Supported Operations: GET
 * Category: lookup
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CountriesEntity.htm}
 */
export class Countries extends BaseEntity {
  private readonly endpoint = '/Countries';

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
        operation: 'getCountries',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ICountries',
        endpoint: '/Countries/{id}',
      },
      {
        operation: 'listCountries',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ICountries[]',
        endpoint: '/Countries',
      }
    ];
  }

  /**
   * Get a countries by ID
   * @param id - The countries ID
   * @returns Promise with the countries data
   */
  async get(id: number): Promise<ApiResponse<ICountries>> {
    this.logger.info('Getting countries', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List countries with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of countries
   */
  async list(query: ICountriesQuery = {}): Promise<ApiResponse<ICountries[]>> {
    this.logger.info('Listing countries', { query });
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