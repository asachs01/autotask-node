import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IProducts {
  id?: number;
  [key: string]: any;
}

export interface IProductsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Products entity class for Autotask API
 * 
 * Products and services offered
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: inventory
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ProductsEntity.htm}
 */
export class Products extends BaseEntity {
  private readonly endpoint = '/Products';

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
        operation: 'createProducts',
        requiredParams: ['products'],
        optionalParams: [],
        returnType: 'IProducts',
        endpoint: '/Products',
      },
      {
        operation: 'getProducts',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IProducts',
        endpoint: '/Products/{id}',
      },
      {
        operation: 'updateProducts',
        requiredParams: ['id', 'products'],
        optionalParams: [],
        returnType: 'IProducts',
        endpoint: '/Products/{id}',
      },
      {
        operation: 'listProducts',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IProducts[]',
        endpoint: '/Products',
      }
    ];
  }

  /**
   * Create a new products
   * @param products - The products data to create
   * @returns Promise with the created products
   */
  async create(products: IProducts): Promise<ApiResponse<IProducts>> {
    this.logger.info('Creating products', { products });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, products),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a products by ID
   * @param id - The products ID
   * @returns Promise with the products data
   */
  async get(id: number): Promise<ApiResponse<IProducts>> {
    this.logger.info('Getting products', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a products
   * @param id - The products ID
   * @param products - The updated products data
   * @returns Promise with the updated products
   */
  async update(
    id: number,
    products: Partial<IProducts>
  ): Promise<ApiResponse<IProducts>> {
    this.logger.info('Updating products', { id, products });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, products),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a products
   * @param id - The products ID
   * @param products - The partial products data to update
   * @returns Promise with the updated products
   */
  async patch(
    id: number,
    products: Partial<IProducts>
  ): Promise<ApiResponse<IProducts>> {
    this.logger.info('Patching products', { id, products });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, products),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * List products with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of products
   */
  async list(query: IProductsQuery = {}): Promise<ApiResponse<IProducts[]>> {
    this.logger.info('Listing products', { query });
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