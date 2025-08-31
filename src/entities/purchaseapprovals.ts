import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IPurchaseApprovals {
  id?: number;
  [key: string]: any;
}

export interface IPurchaseApprovalsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * PurchaseApprovals entity class for Autotask API
 * 
 * Approvals for purchase orders
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: financial
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PurchaseApprovalsEntity.htm}
 */
export class PurchaseApprovals extends BaseEntity {
  private readonly endpoint = '/PurchaseApprovals';

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
        operation: 'createPurchaseApprovals',
        requiredParams: ['purchaseApprovals'],
        optionalParams: [],
        returnType: 'IPurchaseApprovals',
        endpoint: '/PurchaseApprovals',
      },
      {
        operation: 'getPurchaseApprovals',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IPurchaseApprovals',
        endpoint: '/PurchaseApprovals/{id}',
      },
      {
        operation: 'updatePurchaseApprovals',
        requiredParams: ['id', 'purchaseApprovals'],
        optionalParams: [],
        returnType: 'IPurchaseApprovals',
        endpoint: '/PurchaseApprovals/{id}',
      },
      {
        operation: 'listPurchaseApprovals',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IPurchaseApprovals[]',
        endpoint: '/PurchaseApprovals',
      }
    ];
  }

  /**
   * Create a new purchaseapprovals
   * @param purchaseApprovals - The purchaseapprovals data to create
   * @returns Promise with the created purchaseapprovals
   */
  async create(purchaseApprovals: IPurchaseApprovals): Promise<ApiResponse<IPurchaseApprovals>> {
    this.logger.info('Creating purchaseapprovals', { purchaseApprovals });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, purchaseApprovals),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a purchaseapprovals by ID
   * @param id - The purchaseapprovals ID
   * @returns Promise with the purchaseapprovals data
   */
  async get(id: number): Promise<ApiResponse<IPurchaseApprovals>> {
    this.logger.info('Getting purchaseapprovals', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a purchaseapprovals
   * @param id - The purchaseapprovals ID
   * @param purchaseApprovals - The updated purchaseapprovals data
   * @returns Promise with the updated purchaseapprovals
   */
  async update(
    id: number,
    purchaseApprovals: Partial<IPurchaseApprovals>
  ): Promise<ApiResponse<IPurchaseApprovals>> {
    this.logger.info('Updating purchaseapprovals', { id, purchaseApprovals });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, purchaseApprovals),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a purchaseapprovals
   * @param id - The purchaseapprovals ID
   * @param purchaseApprovals - The partial purchaseapprovals data to update
   * @returns Promise with the updated purchaseapprovals
   */
  async patch(
    id: number,
    purchaseApprovals: Partial<IPurchaseApprovals>
  ): Promise<ApiResponse<IPurchaseApprovals>> {
    this.logger.info('Patching purchaseapprovals', { id, purchaseApprovals });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, purchaseApprovals),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * List purchaseapprovals with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of purchaseapprovals
   */
  async list(query: IPurchaseApprovalsQuery = {}): Promise<ApiResponse<IPurchaseApprovals[]>> {
    this.logger.info('Listing purchaseapprovals', { query });
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