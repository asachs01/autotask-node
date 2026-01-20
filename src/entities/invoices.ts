import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IInvoices {
  id?: number;
  [key: string]: any;
}

export interface IInvoicesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Invoices entity class for Autotask API
 *
 * Customer invoices and billing
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: financial
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InvoicesEntity.htm}
 */
export class Invoices extends BaseEntity {
  private readonly endpoint = '/Invoices';

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
        operation: 'createInvoices',
        requiredParams: ['invoices'],
        optionalParams: [],
        returnType: 'IInvoices',
        endpoint: '/Invoices',
      },
      {
        operation: 'getInvoices',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IInvoices',
        endpoint: '/Invoices/{id}',
      },
      {
        operation: 'updateInvoices',
        requiredParams: ['id', 'invoices'],
        optionalParams: [],
        returnType: 'IInvoices',
        endpoint: '/Invoices/{id}',
      },
      {
        operation: 'listInvoices',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IInvoices[]',
        endpoint: '/Invoices',
      },
    ];
  }

  /**
   * Create a new invoices
   * @param invoices - The invoices data to create
   * @returns Promise with the created invoices
   */
  async create(invoices: IInvoices): Promise<ApiResponse<IInvoices>> {
    this.logger.info('Creating invoices', { invoices });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, invoices),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a invoices by ID
   * @param id - The invoices ID
   * @returns Promise with the invoices data
   */
  async get(id: number): Promise<ApiResponse<IInvoices>> {
    this.logger.info('Getting invoices', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a invoices
   * @param id - The invoices ID
   * @param invoices - The updated invoices data
   * @returns Promise with the updated invoices
   */
  async update(
    id: number,
    invoices: Partial<IInvoices>
  ): Promise<ApiResponse<IInvoices>> {
    this.logger.info('Updating invoices', { id, invoices });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, invoices),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a invoices
   * @param id - The invoices ID
   * @param invoices - The partial invoices data to update
   * @returns Promise with the updated invoices
   */
  async patch(
    id: number,
    invoices: Partial<IInvoices>
  ): Promise<ApiResponse<IInvoices>> {
    this.logger.info('Patching invoices', { id, invoices });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, invoices),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * List invoices with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of invoices
   */
  async list(query: IInvoicesQuery = {}): Promise<ApiResponse<IInvoices[]>> {
    this.logger.info('Listing invoices', { query });
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
      async () =>
        this.axios.post(`${this.endpoint}/query`, searchBody),
      `${this.endpoint}/query`,
      'POST'
    );
  }
}
