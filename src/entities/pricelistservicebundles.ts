import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IPriceListServiceBundles {
  id?: number;
  [key: string]: any;
}

export interface IPriceListServiceBundlesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * PriceListServiceBundles entity class for Autotask API
 * 
 * Service bundles in price lists
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: pricing
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PriceListServiceBundlesEntity.htm}
 */
export class PriceListServiceBundles extends BaseEntity {
  private readonly endpoint = '/PriceListServiceBundles';

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
        operation: 'createPriceListServiceBundles',
        requiredParams: ['priceListServiceBundles'],
        optionalParams: [],
        returnType: 'IPriceListServiceBundles',
        endpoint: '/PriceListServiceBundles',
      },
      {
        operation: 'getPriceListServiceBundles',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IPriceListServiceBundles',
        endpoint: '/PriceListServiceBundles/{id}',
      },
      {
        operation: 'updatePriceListServiceBundles',
        requiredParams: ['id', 'priceListServiceBundles'],
        optionalParams: [],
        returnType: 'IPriceListServiceBundles',
        endpoint: '/PriceListServiceBundles/{id}',
      },
      {
        operation: 'deletePriceListServiceBundles',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/PriceListServiceBundles/{id}',
      },
      {
        operation: 'listPriceListServiceBundles',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IPriceListServiceBundles[]',
        endpoint: '/PriceListServiceBundles',
      }
    ];
  }

  /**
   * Create a new pricelistservicebundles
   * @param priceListServiceBundles - The pricelistservicebundles data to create
   * @returns Promise with the created pricelistservicebundles
   */
  async create(priceListServiceBundles: IPriceListServiceBundles): Promise<ApiResponse<IPriceListServiceBundles>> {
    this.logger.info('Creating pricelistservicebundles', { priceListServiceBundles });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, priceListServiceBundles),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a pricelistservicebundles by ID
   * @param id - The pricelistservicebundles ID
   * @returns Promise with the pricelistservicebundles data
   */
  async get(id: number): Promise<ApiResponse<IPriceListServiceBundles>> {
    this.logger.info('Getting pricelistservicebundles', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a pricelistservicebundles
   * @param id - The pricelistservicebundles ID
   * @param priceListServiceBundles - The updated pricelistservicebundles data
   * @returns Promise with the updated pricelistservicebundles
   */
  async update(
    id: number,
    priceListServiceBundles: Partial<IPriceListServiceBundles>
  ): Promise<ApiResponse<IPriceListServiceBundles>> {
    this.logger.info('Updating pricelistservicebundles', { id, priceListServiceBundles });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, priceListServiceBundles),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a pricelistservicebundles
   * @param id - The pricelistservicebundles ID
   * @param priceListServiceBundles - The partial pricelistservicebundles data to update
   * @returns Promise with the updated pricelistservicebundles
   */
  async patch(
    id: number,
    priceListServiceBundles: Partial<IPriceListServiceBundles>
  ): Promise<ApiResponse<IPriceListServiceBundles>> {
    this.logger.info('Patching pricelistservicebundles', { id, priceListServiceBundles });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, priceListServiceBundles),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a pricelistservicebundles
   * @param id - The pricelistservicebundles ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting pricelistservicebundles', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List pricelistservicebundles with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of pricelistservicebundles
   */
  async list(query: IPriceListServiceBundlesQuery = {}): Promise<ApiResponse<IPriceListServiceBundles[]>> {
    this.logger.info('Listing pricelistservicebundles', { query });
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
      async () => this.axios.get(`${this.endpoint}/query`, { params: searchBody }),
      `${this.endpoint}/query`,
      'GET'
    );
  }
}