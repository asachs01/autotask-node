import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IQuotes {
  id?: number;
  [key: string]: any;
}

export interface IQuotesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Quotes entity class for Autotask API
 *
 * Customer quotes and estimates
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: financial
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/QuotesEntity.htm}
 */
export class Quotes extends BaseEntity {
  private readonly endpoint = '/Quotes';

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
        operation: 'createQuotes',
        requiredParams: ['quotes'],
        optionalParams: [],
        returnType: 'IQuotes',
        endpoint: '/Quotes',
      },
      {
        operation: 'getQuotes',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IQuotes',
        endpoint: '/Quotes/{id}',
      },
      {
        operation: 'updateQuotes',
        requiredParams: ['id', 'quotes'],
        optionalParams: [],
        returnType: 'IQuotes',
        endpoint: '/Quotes/{id}',
      },
      {
        operation: 'listQuotes',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IQuotes[]',
        endpoint: '/Quotes',
      },
    ];
  }

  /**
   * Create a new quotes
   * @param quotes - The quotes data to create
   * @returns Promise with the created quotes
   */
  async create(quotes: IQuotes): Promise<ApiResponse<IQuotes>> {
    this.logger.info('Creating quotes', { quotes });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, quotes),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a quotes by ID
   * @param id - The quotes ID
   * @returns Promise with the quotes data
   */
  async get(id: number): Promise<ApiResponse<IQuotes>> {
    this.logger.info('Getting quotes', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a quotes
   * @param id - The quotes ID
   * @param quotes - The updated quotes data
   * @returns Promise with the updated quotes
   */
  async update(
    id: number,
    quotes: Partial<IQuotes>
  ): Promise<ApiResponse<IQuotes>> {
    this.logger.info('Updating quotes', { id, quotes });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, quotes),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a quotes
   * @param id - The quotes ID
   * @param quotes - The partial quotes data to update
   * @returns Promise with the updated quotes
   */
  async patch(
    id: number,
    quotes: Partial<IQuotes>
  ): Promise<ApiResponse<IQuotes>> {
    this.logger.info('Patching quotes', { id, quotes });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, quotes),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * List quotes with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of quotes
   */
  async list(query: IQuotesQuery = {}): Promise<ApiResponse<IQuotes[]>> {
    this.logger.info('Listing quotes', { query });
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
      async () =>
        this.axios.get(`${this.endpoint}/query`, { params: searchBody }),
      `${this.endpoint}/query`,
      'GET'
    );
  }
}
