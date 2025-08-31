import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IPurchaseOrderItemReceiving {
  id?: number;
  [key: string]: any;
}

export interface IPurchaseOrderItemReceivingQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * PurchaseOrderItemReceiving entity class for Autotask API
 * 
 * Receiving records for purchase order items
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: financial
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PurchaseOrderItemReceivingEntity.htm}
 */
export class PurchaseOrderItemReceiving extends BaseEntity {
  private readonly endpoint = '/PurchaseOrderItemReceiving';

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
        operation: 'createPurchaseOrderItemReceiving',
        requiredParams: ['purchaseOrderItemReceiving'],
        optionalParams: [],
        returnType: 'IPurchaseOrderItemReceiving',
        endpoint: '/PurchaseOrderItemReceiving',
      },
      {
        operation: 'getPurchaseOrderItemReceiving',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IPurchaseOrderItemReceiving',
        endpoint: '/PurchaseOrderItemReceiving/{id}',
      },
      {
        operation: 'updatePurchaseOrderItemReceiving',
        requiredParams: ['id', 'purchaseOrderItemReceiving'],
        optionalParams: [],
        returnType: 'IPurchaseOrderItemReceiving',
        endpoint: '/PurchaseOrderItemReceiving/{id}',
      },
      {
        operation: 'listPurchaseOrderItemReceiving',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IPurchaseOrderItemReceiving[]',
        endpoint: '/PurchaseOrderItemReceiving',
      }
    ];
  }

  /**
   * Create a new purchaseorderitemreceiving
   * @param purchaseOrderItemReceiving - The purchaseorderitemreceiving data to create
   * @returns Promise with the created purchaseorderitemreceiving
   */
  async create(purchaseOrderItemReceiving: IPurchaseOrderItemReceiving): Promise<ApiResponse<IPurchaseOrderItemReceiving>> {
    this.logger.info('Creating purchaseorderitemreceiving', { purchaseOrderItemReceiving });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, purchaseOrderItemReceiving),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a purchaseorderitemreceiving by ID
   * @param id - The purchaseorderitemreceiving ID
   * @returns Promise with the purchaseorderitemreceiving data
   */
  async get(id: number): Promise<ApiResponse<IPurchaseOrderItemReceiving>> {
    this.logger.info('Getting purchaseorderitemreceiving', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a purchaseorderitemreceiving
   * @param id - The purchaseorderitemreceiving ID
   * @param purchaseOrderItemReceiving - The updated purchaseorderitemreceiving data
   * @returns Promise with the updated purchaseorderitemreceiving
   */
  async update(
    id: number,
    purchaseOrderItemReceiving: Partial<IPurchaseOrderItemReceiving>
  ): Promise<ApiResponse<IPurchaseOrderItemReceiving>> {
    this.logger.info('Updating purchaseorderitemreceiving', { id, purchaseOrderItemReceiving });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, purchaseOrderItemReceiving),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a purchaseorderitemreceiving
   * @param id - The purchaseorderitemreceiving ID
   * @param purchaseOrderItemReceiving - The partial purchaseorderitemreceiving data to update
   * @returns Promise with the updated purchaseorderitemreceiving
   */
  async patch(
    id: number,
    purchaseOrderItemReceiving: Partial<IPurchaseOrderItemReceiving>
  ): Promise<ApiResponse<IPurchaseOrderItemReceiving>> {
    this.logger.info('Patching purchaseorderitemreceiving', { id, purchaseOrderItemReceiving });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, purchaseOrderItemReceiving),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * List purchaseorderitemreceiving with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of purchaseorderitemreceiving
   */
  async list(query: IPurchaseOrderItemReceivingQuery = {}): Promise<ApiResponse<IPurchaseOrderItemReceiving[]>> {
    this.logger.info('Listing purchaseorderitemreceiving', { query });
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