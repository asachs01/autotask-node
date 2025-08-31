import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IPriceListProducts {
  id?: number;
  [key: string]: any;
}

export interface IPriceListProductsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * PriceListProducts entity class for Autotask API
 * 
 * Products in price lists
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: pricing
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PriceListProductsEntity.htm}
 */
export class PriceListProducts extends BaseEntity {
  private readonly endpoint = '/PriceListProducts';

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
        operation: 'createPriceListProducts',
        requiredParams: ['priceListProducts'],
        optionalParams: [],
        returnType: 'IPriceListProducts',
        endpoint: '/PriceListProducts',
      },
      {
        operation: 'getPriceListProducts',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IPriceListProducts',
        endpoint: '/PriceListProducts/{id}',
      },
      {
        operation: 'updatePriceListProducts',
        requiredParams: ['id', 'priceListProducts'],
        optionalParams: [],
        returnType: 'IPriceListProducts',
        endpoint: '/PriceListProducts/{id}',
      },
      {
        operation: 'deletePriceListProducts',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/PriceListProducts/{id}',
      },
      {
        operation: 'listPriceListProducts',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IPriceListProducts[]',
        endpoint: '/PriceListProducts',
      }
    ];
  }

  /**
   * Create a new pricelistproducts
   * @param priceListProducts - The pricelistproducts data to create
   * @returns Promise with the created pricelistproducts
   */
  async create(priceListProducts: IPriceListProducts): Promise<ApiResponse<IPriceListProducts>> {
    this.logger.info('Creating pricelistproducts', { priceListProducts });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, priceListProducts),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a pricelistproducts by ID
   * @param id - The pricelistproducts ID
   * @returns Promise with the pricelistproducts data
   */
  async get(id: number): Promise<ApiResponse<IPriceListProducts>> {
    this.logger.info('Getting pricelistproducts', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a pricelistproducts
   * @param id - The pricelistproducts ID
   * @param priceListProducts - The updated pricelistproducts data
   * @returns Promise with the updated pricelistproducts
   */
  async update(
    id: number,
    priceListProducts: Partial<IPriceListProducts>
  ): Promise<ApiResponse<IPriceListProducts>> {
    this.logger.info('Updating pricelistproducts', { id, priceListProducts });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, priceListProducts),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a pricelistproducts
   * @param id - The pricelistproducts ID
   * @param priceListProducts - The partial pricelistproducts data to update
   * @returns Promise with the updated pricelistproducts
   */
  async patch(
    id: number,
    priceListProducts: Partial<IPriceListProducts>
  ): Promise<ApiResponse<IPriceListProducts>> {
    this.logger.info('Patching pricelistproducts', { id, priceListProducts });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, priceListProducts),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a pricelistproducts
   * @param id - The pricelistproducts ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting pricelistproducts', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List pricelistproducts with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of pricelistproducts
   */
  async list(query: IPriceListProductsQuery = {}): Promise<ApiResponse<IPriceListProducts[]>> {
    this.logger.info('Listing pricelistproducts', { query });
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