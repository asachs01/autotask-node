import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IQuoteItems {
  id?: number;
  [key: string]: any;
}

export interface IQuoteItemsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * QuoteItems entity class for Autotask API
 * 
 * Line items within quotes
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: financial
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/QuoteItemsEntity.htm}
 */
export class QuoteItems extends BaseEntity {
  private readonly endpoint = '/QuoteItems';

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
        operation: 'createQuoteItems',
        requiredParams: ['quoteItems'],
        optionalParams: [],
        returnType: 'IQuoteItems',
        endpoint: '/QuoteItems',
      },
      {
        operation: 'getQuoteItems',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IQuoteItems',
        endpoint: '/QuoteItems/{id}',
      },
      {
        operation: 'updateQuoteItems',
        requiredParams: ['id', 'quoteItems'],
        optionalParams: [],
        returnType: 'IQuoteItems',
        endpoint: '/QuoteItems/{id}',
      },
      {
        operation: 'deleteQuoteItems',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/QuoteItems/{id}',
      },
      {
        operation: 'listQuoteItems',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IQuoteItems[]',
        endpoint: '/QuoteItems',
      }
    ];
  }

  /**
   * Create a new quoteitems
   * @param quoteItems - The quoteitems data to create
   * @returns Promise with the created quoteitems
   */
  async create(quoteItems: IQuoteItems): Promise<ApiResponse<IQuoteItems>> {
    this.logger.info('Creating quoteitems', { quoteItems });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, quoteItems),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a quoteitems by ID
   * @param id - The quoteitems ID
   * @returns Promise with the quoteitems data
   */
  async get(id: number): Promise<ApiResponse<IQuoteItems>> {
    this.logger.info('Getting quoteitems', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a quoteitems
   * @param id - The quoteitems ID
   * @param quoteItems - The updated quoteitems data
   * @returns Promise with the updated quoteitems
   */
  async update(
    id: number,
    quoteItems: Partial<IQuoteItems>
  ): Promise<ApiResponse<IQuoteItems>> {
    this.logger.info('Updating quoteitems', { id, quoteItems });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, quoteItems),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a quoteitems
   * @param id - The quoteitems ID
   * @param quoteItems - The partial quoteitems data to update
   * @returns Promise with the updated quoteitems
   */
  async patch(
    id: number,
    quoteItems: Partial<IQuoteItems>
  ): Promise<ApiResponse<IQuoteItems>> {
    this.logger.info('Patching quoteitems', { id, quoteItems });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, quoteItems),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a quoteitems
   * @param id - The quoteitems ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting quoteitems', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List quoteitems with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of quoteitems
   */
  async list(query: IQuoteItemsQuery = {}): Promise<ApiResponse<IQuoteItems[]>> {
    this.logger.info('Listing quoteitems', { query });
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