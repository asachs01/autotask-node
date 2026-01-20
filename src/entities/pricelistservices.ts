import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IPriceListServices {
  id?: number;
  [key: string]: any;
}

export interface IPriceListServicesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * PriceListServices entity class for Autotask API
 * 
 * Services in price lists
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: pricing
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PriceListServicesEntity.htm}
 */
export class PriceListServices extends BaseEntity {
  private readonly endpoint = '/PriceListServices';

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
        operation: 'createPriceListServices',
        requiredParams: ['priceListServices'],
        optionalParams: [],
        returnType: 'IPriceListServices',
        endpoint: '/PriceListServices',
      },
      {
        operation: 'getPriceListServices',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IPriceListServices',
        endpoint: '/PriceListServices/{id}',
      },
      {
        operation: 'updatePriceListServices',
        requiredParams: ['id', 'priceListServices'],
        optionalParams: [],
        returnType: 'IPriceListServices',
        endpoint: '/PriceListServices/{id}',
      },
      {
        operation: 'deletePriceListServices',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/PriceListServices/{id}',
      },
      {
        operation: 'listPriceListServices',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IPriceListServices[]',
        endpoint: '/PriceListServices',
      }
    ];
  }

  /**
   * Create a new pricelistservices
   * @param priceListServices - The pricelistservices data to create
   * @returns Promise with the created pricelistservices
   */
  async create(priceListServices: IPriceListServices): Promise<ApiResponse<IPriceListServices>> {
    this.logger.info('Creating pricelistservices', { priceListServices });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, priceListServices),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a pricelistservices by ID
   * @param id - The pricelistservices ID
   * @returns Promise with the pricelistservices data
   */
  async get(id: number): Promise<ApiResponse<IPriceListServices>> {
    this.logger.info('Getting pricelistservices', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a pricelistservices
   * @param id - The pricelistservices ID
   * @param priceListServices - The updated pricelistservices data
   * @returns Promise with the updated pricelistservices
   */
  async update(
    id: number,
    priceListServices: Partial<IPriceListServices>
  ): Promise<ApiResponse<IPriceListServices>> {
    this.logger.info('Updating pricelistservices', { id, priceListServices });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, priceListServices),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a pricelistservices
   * @param id - The pricelistservices ID
   * @param priceListServices - The partial pricelistservices data to update
   * @returns Promise with the updated pricelistservices
   */
  async patch(
    id: number,
    priceListServices: Partial<IPriceListServices>
  ): Promise<ApiResponse<IPriceListServices>> {
    this.logger.info('Patching pricelistservices', { id, priceListServices });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, priceListServices),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a pricelistservices
   * @param id - The pricelistservices ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting pricelistservices', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List pricelistservices with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of pricelistservices
   */
  async list(query: IPriceListServicesQuery = {}): Promise<ApiResponse<IPriceListServices[]>> {
    this.logger.info('Listing pricelistservices', { query });
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