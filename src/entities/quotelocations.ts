import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IQuoteLocations {
  id?: number;
  [key: string]: any;
}

export interface IQuoteLocationsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * QuoteLocations entity class for Autotask API
 * 
 * Location information for quotes
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: financial
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/QuoteLocationsEntity.htm}
 */
export class QuoteLocations extends BaseEntity {
  private readonly endpoint = '/QuoteLocations';

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
        operation: 'createQuoteLocations',
        requiredParams: ['quoteLocations'],
        optionalParams: [],
        returnType: 'IQuoteLocations',
        endpoint: '/QuoteLocations',
      },
      {
        operation: 'getQuoteLocations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IQuoteLocations',
        endpoint: '/QuoteLocations/{id}',
      },
      {
        operation: 'updateQuoteLocations',
        requiredParams: ['id', 'quoteLocations'],
        optionalParams: [],
        returnType: 'IQuoteLocations',
        endpoint: '/QuoteLocations/{id}',
      },
      {
        operation: 'deleteQuoteLocations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/QuoteLocations/{id}',
      },
      {
        operation: 'listQuoteLocations',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IQuoteLocations[]',
        endpoint: '/QuoteLocations',
      }
    ];
  }

  /**
   * Create a new quotelocations
   * @param quoteLocations - The quotelocations data to create
   * @returns Promise with the created quotelocations
   */
  async create(quoteLocations: IQuoteLocations): Promise<ApiResponse<IQuoteLocations>> {
    this.logger.info('Creating quotelocations', { quoteLocations });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, quoteLocations),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a quotelocations by ID
   * @param id - The quotelocations ID
   * @returns Promise with the quotelocations data
   */
  async get(id: number): Promise<ApiResponse<IQuoteLocations>> {
    this.logger.info('Getting quotelocations', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a quotelocations
   * @param id - The quotelocations ID
   * @param quoteLocations - The updated quotelocations data
   * @returns Promise with the updated quotelocations
   */
  async update(
    id: number,
    quoteLocations: Partial<IQuoteLocations>
  ): Promise<ApiResponse<IQuoteLocations>> {
    this.logger.info('Updating quotelocations', { id, quoteLocations });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, quoteLocations),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a quotelocations
   * @param id - The quotelocations ID
   * @param quoteLocations - The partial quotelocations data to update
   * @returns Promise with the updated quotelocations
   */
  async patch(
    id: number,
    quoteLocations: Partial<IQuoteLocations>
  ): Promise<ApiResponse<IQuoteLocations>> {
    this.logger.info('Patching quotelocations', { id, quoteLocations });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, quoteLocations),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a quotelocations
   * @param id - The quotelocations ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting quotelocations', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List quotelocations with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of quotelocations
   */
  async list(query: IQuoteLocationsQuery = {}): Promise<ApiResponse<IQuoteLocations[]>> {
    this.logger.info('Listing quotelocations', { query });
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