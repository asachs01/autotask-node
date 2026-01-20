import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IPriceListProductTiers {
  id?: number;
  [key: string]: any;
}

export interface IPriceListProductTiersQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * PriceListProductTiers entity class for Autotask API
 * 
 * Product tiers in price lists
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: pricing
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PriceListProductTiersEntity.htm}
 */
export class PriceListProductTiers extends BaseEntity {
  private readonly endpoint = '/PriceListProductTiers';

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
        operation: 'createPriceListProductTiers',
        requiredParams: ['priceListProductTiers'],
        optionalParams: [],
        returnType: 'IPriceListProductTiers',
        endpoint: '/PriceListProductTiers',
      },
      {
        operation: 'getPriceListProductTiers',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IPriceListProductTiers',
        endpoint: '/PriceListProductTiers/{id}',
      },
      {
        operation: 'updatePriceListProductTiers',
        requiredParams: ['id', 'priceListProductTiers'],
        optionalParams: [],
        returnType: 'IPriceListProductTiers',
        endpoint: '/PriceListProductTiers/{id}',
      },
      {
        operation: 'deletePriceListProductTiers',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/PriceListProductTiers/{id}',
      },
      {
        operation: 'listPriceListProductTiers',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IPriceListProductTiers[]',
        endpoint: '/PriceListProductTiers',
      }
    ];
  }

  /**
   * Create a new pricelistproducttiers
   * @param priceListProductTiers - The pricelistproducttiers data to create
   * @returns Promise with the created pricelistproducttiers
   */
  async create(priceListProductTiers: IPriceListProductTiers): Promise<ApiResponse<IPriceListProductTiers>> {
    this.logger.info('Creating pricelistproducttiers', { priceListProductTiers });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, priceListProductTiers),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a pricelistproducttiers by ID
   * @param id - The pricelistproducttiers ID
   * @returns Promise with the pricelistproducttiers data
   */
  async get(id: number): Promise<ApiResponse<IPriceListProductTiers>> {
    this.logger.info('Getting pricelistproducttiers', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a pricelistproducttiers
   * @param id - The pricelistproducttiers ID
   * @param priceListProductTiers - The updated pricelistproducttiers data
   * @returns Promise with the updated pricelistproducttiers
   */
  async update(
    id: number,
    priceListProductTiers: Partial<IPriceListProductTiers>
  ): Promise<ApiResponse<IPriceListProductTiers>> {
    this.logger.info('Updating pricelistproducttiers', { id, priceListProductTiers });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, priceListProductTiers),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a pricelistproducttiers
   * @param id - The pricelistproducttiers ID
   * @param priceListProductTiers - The partial pricelistproducttiers data to update
   * @returns Promise with the updated pricelistproducttiers
   */
  async patch(
    id: number,
    priceListProductTiers: Partial<IPriceListProductTiers>
  ): Promise<ApiResponse<IPriceListProductTiers>> {
    this.logger.info('Patching pricelistproducttiers', { id, priceListProductTiers });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, priceListProductTiers),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a pricelistproducttiers
   * @param id - The pricelistproducttiers ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting pricelistproducttiers', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List pricelistproducttiers with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of pricelistproducttiers
   */
  async list(query: IPriceListProductTiersQuery = {}): Promise<ApiResponse<IPriceListProductTiers[]>> {
    this.logger.info('Listing pricelistproducttiers', { query });
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