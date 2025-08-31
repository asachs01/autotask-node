import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IPriceListMaterialCodes {
  id?: number;
  [key: string]: any;
}

export interface IPriceListMaterialCodesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * PriceListMaterialCodes entity class for Autotask API
 * 
 * Material codes in price lists
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: pricing
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PriceListMaterialCodesEntity.htm}
 */
export class PriceListMaterialCodes extends BaseEntity {
  private readonly endpoint = '/PriceListMaterialCodes';

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
        operation: 'createPriceListMaterialCodes',
        requiredParams: ['priceListMaterialCodes'],
        optionalParams: [],
        returnType: 'IPriceListMaterialCodes',
        endpoint: '/PriceListMaterialCodes',
      },
      {
        operation: 'getPriceListMaterialCodes',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IPriceListMaterialCodes',
        endpoint: '/PriceListMaterialCodes/{id}',
      },
      {
        operation: 'updatePriceListMaterialCodes',
        requiredParams: ['id', 'priceListMaterialCodes'],
        optionalParams: [],
        returnType: 'IPriceListMaterialCodes',
        endpoint: '/PriceListMaterialCodes/{id}',
      },
      {
        operation: 'deletePriceListMaterialCodes',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/PriceListMaterialCodes/{id}',
      },
      {
        operation: 'listPriceListMaterialCodes',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IPriceListMaterialCodes[]',
        endpoint: '/PriceListMaterialCodes',
      }
    ];
  }

  /**
   * Create a new pricelistmaterialcodes
   * @param priceListMaterialCodes - The pricelistmaterialcodes data to create
   * @returns Promise with the created pricelistmaterialcodes
   */
  async create(priceListMaterialCodes: IPriceListMaterialCodes): Promise<ApiResponse<IPriceListMaterialCodes>> {
    this.logger.info('Creating pricelistmaterialcodes', { priceListMaterialCodes });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, priceListMaterialCodes),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a pricelistmaterialcodes by ID
   * @param id - The pricelistmaterialcodes ID
   * @returns Promise with the pricelistmaterialcodes data
   */
  async get(id: number): Promise<ApiResponse<IPriceListMaterialCodes>> {
    this.logger.info('Getting pricelistmaterialcodes', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a pricelistmaterialcodes
   * @param id - The pricelistmaterialcodes ID
   * @param priceListMaterialCodes - The updated pricelistmaterialcodes data
   * @returns Promise with the updated pricelistmaterialcodes
   */
  async update(
    id: number,
    priceListMaterialCodes: Partial<IPriceListMaterialCodes>
  ): Promise<ApiResponse<IPriceListMaterialCodes>> {
    this.logger.info('Updating pricelistmaterialcodes', { id, priceListMaterialCodes });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, priceListMaterialCodes),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a pricelistmaterialcodes
   * @param id - The pricelistmaterialcodes ID
   * @param priceListMaterialCodes - The partial pricelistmaterialcodes data to update
   * @returns Promise with the updated pricelistmaterialcodes
   */
  async patch(
    id: number,
    priceListMaterialCodes: Partial<IPriceListMaterialCodes>
  ): Promise<ApiResponse<IPriceListMaterialCodes>> {
    this.logger.info('Patching pricelistmaterialcodes', { id, priceListMaterialCodes });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, priceListMaterialCodes),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a pricelistmaterialcodes
   * @param id - The pricelistmaterialcodes ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting pricelistmaterialcodes', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List pricelistmaterialcodes with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of pricelistmaterialcodes
   */
  async list(query: IPriceListMaterialCodesQuery = {}): Promise<ApiResponse<IPriceListMaterialCodes[]>> {
    this.logger.info('Listing pricelistmaterialcodes', { query });
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