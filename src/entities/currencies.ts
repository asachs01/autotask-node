import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ICurrencies {
  id?: number;
  [key: string]: any;
}

export interface ICurrenciesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Currencies entity class for Autotask API
 * 
 * Available currencies for financial transactions
 * Supported Operations: GET
 * Category: financial
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CurrenciesEntity.htm}
 */
export class Currencies extends BaseEntity {
  private readonly endpoint = '/Currencies';

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
        operation: 'getCurrencies',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ICurrencies',
        endpoint: '/Currencies/{id}',
      },
      {
        operation: 'listCurrencies',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ICurrencies[]',
        endpoint: '/Currencies',
      }
    ];
  }

  /**
   * Get a currencies by ID
   * @param id - The currencies ID
   * @returns Promise with the currencies data
   */
  async get(id: number): Promise<ApiResponse<ICurrencies>> {
    this.logger.info('Getting currencies', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List currencies with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of currencies
   */
  async list(query: ICurrenciesQuery = {}): Promise<ApiResponse<ICurrencies[]>> {
    this.logger.info('Listing currencies', { query });
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