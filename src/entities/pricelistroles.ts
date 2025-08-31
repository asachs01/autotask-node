import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IPriceListRoles {
  id?: number;
  [key: string]: any;
}

export interface IPriceListRolesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * PriceListRoles entity class for Autotask API
 * 
 * Roles in price lists
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: pricing
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PriceListRolesEntity.htm}
 */
export class PriceListRoles extends BaseEntity {
  private readonly endpoint = '/PriceListRoles';

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
        operation: 'createPriceListRoles',
        requiredParams: ['priceListRoles'],
        optionalParams: [],
        returnType: 'IPriceListRoles',
        endpoint: '/PriceListRoles',
      },
      {
        operation: 'getPriceListRoles',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IPriceListRoles',
        endpoint: '/PriceListRoles/{id}',
      },
      {
        operation: 'updatePriceListRoles',
        requiredParams: ['id', 'priceListRoles'],
        optionalParams: [],
        returnType: 'IPriceListRoles',
        endpoint: '/PriceListRoles/{id}',
      },
      {
        operation: 'deletePriceListRoles',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/PriceListRoles/{id}',
      },
      {
        operation: 'listPriceListRoles',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IPriceListRoles[]',
        endpoint: '/PriceListRoles',
      }
    ];
  }

  /**
   * Create a new pricelistroles
   * @param priceListRoles - The pricelistroles data to create
   * @returns Promise with the created pricelistroles
   */
  async create(priceListRoles: IPriceListRoles): Promise<ApiResponse<IPriceListRoles>> {
    this.logger.info('Creating pricelistroles', { priceListRoles });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, priceListRoles),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a pricelistroles by ID
   * @param id - The pricelistroles ID
   * @returns Promise with the pricelistroles data
   */
  async get(id: number): Promise<ApiResponse<IPriceListRoles>> {
    this.logger.info('Getting pricelistroles', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a pricelistroles
   * @param id - The pricelistroles ID
   * @param priceListRoles - The updated pricelistroles data
   * @returns Promise with the updated pricelistroles
   */
  async update(
    id: number,
    priceListRoles: Partial<IPriceListRoles>
  ): Promise<ApiResponse<IPriceListRoles>> {
    this.logger.info('Updating pricelistroles', { id, priceListRoles });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, priceListRoles),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a pricelistroles
   * @param id - The pricelistroles ID
   * @param priceListRoles - The partial pricelistroles data to update
   * @returns Promise with the updated pricelistroles
   */
  async patch(
    id: number,
    priceListRoles: Partial<IPriceListRoles>
  ): Promise<ApiResponse<IPriceListRoles>> {
    this.logger.info('Patching pricelistroles', { id, priceListRoles });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, priceListRoles),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a pricelistroles
   * @param id - The pricelistroles ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting pricelistroles', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List pricelistroles with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of pricelistroles
   */
  async list(query: IPriceListRolesQuery = {}): Promise<ApiResponse<IPriceListRoles[]>> {
    this.logger.info('Listing pricelistroles', { query });
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