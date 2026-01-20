import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IProductTiers {
  id?: number;
  [key: string]: any;
}

export interface IProductTiersQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ProductTiers entity class for Autotask API
 * 
 * Pricing tiers for products
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: inventory
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ProductTiersEntity.htm}
 */
export class ProductTiers extends BaseEntity {
  private readonly endpoint = '/ProductTiers';

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
        operation: 'createProductTiers',
        requiredParams: ['productTiers'],
        optionalParams: [],
        returnType: 'IProductTiers',
        endpoint: '/ProductTiers',
      },
      {
        operation: 'getProductTiers',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IProductTiers',
        endpoint: '/ProductTiers/{id}',
      },
      {
        operation: 'updateProductTiers',
        requiredParams: ['id', 'productTiers'],
        optionalParams: [],
        returnType: 'IProductTiers',
        endpoint: '/ProductTiers/{id}',
      },
      {
        operation: 'deleteProductTiers',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ProductTiers/{id}',
      },
      {
        operation: 'listProductTiers',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IProductTiers[]',
        endpoint: '/ProductTiers',
      }
    ];
  }

  /**
   * Create a new producttiers
   * @param productTiers - The producttiers data to create
   * @returns Promise with the created producttiers
   */
  async create(productTiers: IProductTiers): Promise<ApiResponse<IProductTiers>> {
    this.logger.info('Creating producttiers', { productTiers });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, productTiers),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a producttiers by ID
   * @param id - The producttiers ID
   * @returns Promise with the producttiers data
   */
  async get(id: number): Promise<ApiResponse<IProductTiers>> {
    this.logger.info('Getting producttiers', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a producttiers
   * @param id - The producttiers ID
   * @param productTiers - The updated producttiers data
   * @returns Promise with the updated producttiers
   */
  async update(
    id: number,
    productTiers: Partial<IProductTiers>
  ): Promise<ApiResponse<IProductTiers>> {
    this.logger.info('Updating producttiers', { id, productTiers });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, productTiers),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a producttiers
   * @param id - The producttiers ID
   * @param productTiers - The partial producttiers data to update
   * @returns Promise with the updated producttiers
   */
  async patch(
    id: number,
    productTiers: Partial<IProductTiers>
  ): Promise<ApiResponse<IProductTiers>> {
    this.logger.info('Patching producttiers', { id, productTiers });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, productTiers),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a producttiers
   * @param id - The producttiers ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting producttiers', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List producttiers with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of producttiers
   */
  async list(query: IProductTiersQuery = {}): Promise<ApiResponse<IProductTiers[]>> {
    this.logger.info('Listing producttiers', { query });
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