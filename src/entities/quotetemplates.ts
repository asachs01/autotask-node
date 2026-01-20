import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IQuoteTemplates {
  id?: number;
  [key: string]: any;
}

export interface IQuoteTemplatesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * QuoteTemplates entity class for Autotask API
 * 
 * Templates for generating quotes
 * Supported Operations: GET
 * Category: financial
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/QuoteTemplatesEntity.htm}
 */
export class QuoteTemplates extends BaseEntity {
  private readonly endpoint = '/QuoteTemplates';

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
        operation: 'getQuoteTemplates',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IQuoteTemplates',
        endpoint: '/QuoteTemplates/{id}',
      },
      {
        operation: 'listQuoteTemplates',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IQuoteTemplates[]',
        endpoint: '/QuoteTemplates',
      }
    ];
  }

  /**
   * Get a quotetemplates by ID
   * @param id - The quotetemplates ID
   * @returns Promise with the quotetemplates data
   */
  async get(id: number): Promise<ApiResponse<IQuoteTemplates>> {
    this.logger.info('Getting quotetemplates', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List quotetemplates with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of quotetemplates
   */
  async list(query: IQuoteTemplatesQuery = {}): Promise<ApiResponse<IQuoteTemplates[]>> {
    this.logger.info('Listing quotetemplates', { query });
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