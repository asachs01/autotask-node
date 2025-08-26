import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IBillingCodes {
  id?: number;
  [key: string]: any;
}

export interface IBillingCodesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * BillingCodes entity class for Autotask API
 * 
 * Billing codes for time and expense tracking
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: financial
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/BillingCodesEntity.htm}
 */
export class BillingCodes extends BaseEntity {
  private readonly endpoint = '/BillingCodes';

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
        operation: 'createBillingCodes',
        requiredParams: ['billingCodes'],
        optionalParams: [],
        returnType: 'IBillingCodes',
        endpoint: '/BillingCodes',
      },
      {
        operation: 'getBillingCodes',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IBillingCodes',
        endpoint: '/BillingCodes/{id}',
      },
      {
        operation: 'updateBillingCodes',
        requiredParams: ['id', 'billingCodes'],
        optionalParams: [],
        returnType: 'IBillingCodes',
        endpoint: '/BillingCodes/{id}',
      },
      {
        operation: 'listBillingCodes',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IBillingCodes[]',
        endpoint: '/BillingCodes',
      }
    ];
  }

  /**
   * Create a new billingcodes
   * @param billingCodes - The billingcodes data to create
   * @returns Promise with the created billingcodes
   */
  async create(billingCodes: IBillingCodes): Promise<ApiResponse<IBillingCodes>> {
    this.logger.info('Creating billingcodes', { billingCodes });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, billingCodes),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a billingcodes by ID
   * @param id - The billingcodes ID
   * @returns Promise with the billingcodes data
   */
  async get(id: number): Promise<ApiResponse<IBillingCodes>> {
    this.logger.info('Getting billingcodes', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a billingcodes
   * @param id - The billingcodes ID
   * @param billingCodes - The updated billingcodes data
   * @returns Promise with the updated billingcodes
   */
  async update(
    id: number,
    billingCodes: Partial<IBillingCodes>
  ): Promise<ApiResponse<IBillingCodes>> {
    this.logger.info('Updating billingcodes', { id, billingCodes });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, billingCodes),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a billingcodes
   * @param id - The billingcodes ID
   * @param billingCodes - The partial billingcodes data to update
   * @returns Promise with the updated billingcodes
   */
  async patch(
    id: number,
    billingCodes: Partial<IBillingCodes>
  ): Promise<ApiResponse<IBillingCodes>> {
    this.logger.info('Patching billingcodes', { id, billingCodes });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, billingCodes),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * List billingcodes with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of billingcodes
   */
  async list(query: IBillingCodesQuery = {}): Promise<ApiResponse<IBillingCodes[]>> {
    this.logger.info('Listing billingcodes', { query });
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