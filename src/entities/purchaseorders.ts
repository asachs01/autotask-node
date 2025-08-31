import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IPurchaseOrders {
  id?: number;
  [key: string]: any;
}

export interface IPurchaseOrdersQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * PurchaseOrders entity class for Autotask API
 * 
 * Purchase orders for procurement
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: financial
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PurchaseOrdersEntity.htm}
 */
export class PurchaseOrders extends BaseEntity {
  private readonly endpoint = '/PurchaseOrders';

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
        operation: 'createPurchaseOrders',
        requiredParams: ['purchaseOrders'],
        optionalParams: [],
        returnType: 'IPurchaseOrders',
        endpoint: '/PurchaseOrders',
      },
      {
        operation: 'getPurchaseOrders',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IPurchaseOrders',
        endpoint: '/PurchaseOrders/{id}',
      },
      {
        operation: 'updatePurchaseOrders',
        requiredParams: ['id', 'purchaseOrders'],
        optionalParams: [],
        returnType: 'IPurchaseOrders',
        endpoint: '/PurchaseOrders/{id}',
      },
      {
        operation: 'listPurchaseOrders',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IPurchaseOrders[]',
        endpoint: '/PurchaseOrders',
      }
    ];
  }

  /**
   * Create a new purchaseorders
   * @param purchaseOrders - The purchaseorders data to create
   * @returns Promise with the created purchaseorders
   */
  async create(purchaseOrders: IPurchaseOrders): Promise<ApiResponse<IPurchaseOrders>> {
    this.logger.info('Creating purchaseorders', { purchaseOrders });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, purchaseOrders),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a purchaseorders by ID
   * @param id - The purchaseorders ID
   * @returns Promise with the purchaseorders data
   */
  async get(id: number): Promise<ApiResponse<IPurchaseOrders>> {
    this.logger.info('Getting purchaseorders', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a purchaseorders
   * @param id - The purchaseorders ID
   * @param purchaseOrders - The updated purchaseorders data
   * @returns Promise with the updated purchaseorders
   */
  async update(
    id: number,
    purchaseOrders: Partial<IPurchaseOrders>
  ): Promise<ApiResponse<IPurchaseOrders>> {
    this.logger.info('Updating purchaseorders', { id, purchaseOrders });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, purchaseOrders),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a purchaseorders
   * @param id - The purchaseorders ID
   * @param purchaseOrders - The partial purchaseorders data to update
   * @returns Promise with the updated purchaseorders
   */
  async patch(
    id: number,
    purchaseOrders: Partial<IPurchaseOrders>
  ): Promise<ApiResponse<IPurchaseOrders>> {
    this.logger.info('Patching purchaseorders', { id, purchaseOrders });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, purchaseOrders),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * List purchaseorders with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of purchaseorders
   */
  async list(query: IPurchaseOrdersQuery = {}): Promise<ApiResponse<IPurchaseOrders[]>> {
    this.logger.info('Listing purchaseorders', { query });
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