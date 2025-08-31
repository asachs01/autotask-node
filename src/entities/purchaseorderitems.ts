import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IPurchaseOrderItems {
  id?: number;
  [key: string]: any;
}

export interface IPurchaseOrderItemsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * PurchaseOrderItems entity class for Autotask API
 * 
 * Items within purchase orders
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: financial
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PurchaseOrderItemsEntity.htm}
 */
export class PurchaseOrderItems extends BaseEntity {
  private readonly endpoint = '/PurchaseOrderItems';

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
        operation: 'createPurchaseOrderItems',
        requiredParams: ['purchaseOrderItems'],
        optionalParams: [],
        returnType: 'IPurchaseOrderItems',
        endpoint: '/PurchaseOrderItems',
      },
      {
        operation: 'getPurchaseOrderItems',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IPurchaseOrderItems',
        endpoint: '/PurchaseOrderItems/{id}',
      },
      {
        operation: 'updatePurchaseOrderItems',
        requiredParams: ['id', 'purchaseOrderItems'],
        optionalParams: [],
        returnType: 'IPurchaseOrderItems',
        endpoint: '/PurchaseOrderItems/{id}',
      },
      {
        operation: 'deletePurchaseOrderItems',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/PurchaseOrderItems/{id}',
      },
      {
        operation: 'listPurchaseOrderItems',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IPurchaseOrderItems[]',
        endpoint: '/PurchaseOrderItems',
      }
    ];
  }

  /**
   * Create a new purchaseorderitems
   * @param purchaseOrderItems - The purchaseorderitems data to create
   * @returns Promise with the created purchaseorderitems
   */
  async create(purchaseOrderItems: IPurchaseOrderItems): Promise<ApiResponse<IPurchaseOrderItems>> {
    this.logger.info('Creating purchaseorderitems', { purchaseOrderItems });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, purchaseOrderItems),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a purchaseorderitems by ID
   * @param id - The purchaseorderitems ID
   * @returns Promise with the purchaseorderitems data
   */
  async get(id: number): Promise<ApiResponse<IPurchaseOrderItems>> {
    this.logger.info('Getting purchaseorderitems', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a purchaseorderitems
   * @param id - The purchaseorderitems ID
   * @param purchaseOrderItems - The updated purchaseorderitems data
   * @returns Promise with the updated purchaseorderitems
   */
  async update(
    id: number,
    purchaseOrderItems: Partial<IPurchaseOrderItems>
  ): Promise<ApiResponse<IPurchaseOrderItems>> {
    this.logger.info('Updating purchaseorderitems', { id, purchaseOrderItems });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, purchaseOrderItems),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a purchaseorderitems
   * @param id - The purchaseorderitems ID
   * @param purchaseOrderItems - The partial purchaseorderitems data to update
   * @returns Promise with the updated purchaseorderitems
   */
  async patch(
    id: number,
    purchaseOrderItems: Partial<IPurchaseOrderItems>
  ): Promise<ApiResponse<IPurchaseOrderItems>> {
    this.logger.info('Patching purchaseorderitems', { id, purchaseOrderItems });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, purchaseOrderItems),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a purchaseorderitems
   * @param id - The purchaseorderitems ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting purchaseorderitems', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List purchaseorderitems with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of purchaseorderitems
   */
  async list(query: IPurchaseOrderItemsQuery = {}): Promise<ApiResponse<IPurchaseOrderItems[]>> {
    this.logger.info('Listing purchaseorderitems', { query });
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