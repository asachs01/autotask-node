import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IBillingItems {
  id?: number;
  [key: string]: any;
}

export interface IBillingItemsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * BillingItems entity class for Autotask API
 * 
 * Billing items for invoicing
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: financial
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/BillingItemsEntity.htm}
 */
export class BillingItems extends BaseEntity {
  private readonly endpoint = '/BillingItems';

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
        operation: 'createBillingItems',
        requiredParams: ['billingItems'],
        optionalParams: [],
        returnType: 'IBillingItems',
        endpoint: '/BillingItems',
      },
      {
        operation: 'getBillingItems',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IBillingItems',
        endpoint: '/BillingItems/{id}',
      },
      {
        operation: 'updateBillingItems',
        requiredParams: ['id', 'billingItems'],
        optionalParams: [],
        returnType: 'IBillingItems',
        endpoint: '/BillingItems/{id}',
      },
      {
        operation: 'deleteBillingItems',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/BillingItems/{id}',
      },
      {
        operation: 'listBillingItems',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IBillingItems[]',
        endpoint: '/BillingItems',
      }
    ];
  }

  /**
   * Create a new billingitems
   * @param billingItems - The billingitems data to create
   * @returns Promise with the created billingitems
   */
  async create(billingItems: IBillingItems): Promise<ApiResponse<IBillingItems>> {
    this.logger.info('Creating billingitems', { billingItems });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, billingItems),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a billingitems by ID
   * @param id - The billingitems ID
   * @returns Promise with the billingitems data
   */
  async get(id: number): Promise<ApiResponse<IBillingItems>> {
    this.logger.info('Getting billingitems', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a billingitems
   * @param id - The billingitems ID
   * @param billingItems - The updated billingitems data
   * @returns Promise with the updated billingitems
   */
  async update(
    id: number,
    billingItems: Partial<IBillingItems>
  ): Promise<ApiResponse<IBillingItems>> {
    this.logger.info('Updating billingitems', { id, billingItems });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, billingItems),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a billingitems
   * @param id - The billingitems ID
   * @param billingItems - The partial billingitems data to update
   * @returns Promise with the updated billingitems
   */
  async patch(
    id: number,
    billingItems: Partial<IBillingItems>
  ): Promise<ApiResponse<IBillingItems>> {
    this.logger.info('Patching billingitems', { id, billingItems });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, billingItems),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a billingitems
   * @param id - The billingitems ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting billingitems', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List billingitems with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of billingitems
   */
  async list(query: IBillingItemsQuery = {}): Promise<ApiResponse<IBillingItems[]>> {
    this.logger.info('Listing billingitems', { query });
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