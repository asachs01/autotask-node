import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IExpenseItems {
  id?: number;
  [key: string]: any;
}

export interface IExpenseItemsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ExpenseItems entity class for Autotask API
 * 
 * Individual expense items
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: expense
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ExpenseItemsEntity.htm}
 */
export class ExpenseItems extends BaseEntity {
  private readonly endpoint = '/ExpenseItems';

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
        operation: 'createExpenseItems',
        requiredParams: ['expenseItems'],
        optionalParams: [],
        returnType: 'IExpenseItems',
        endpoint: '/ExpenseItems',
      },
      {
        operation: 'getExpenseItems',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IExpenseItems',
        endpoint: '/ExpenseItems/{id}',
      },
      {
        operation: 'updateExpenseItems',
        requiredParams: ['id', 'expenseItems'],
        optionalParams: [],
        returnType: 'IExpenseItems',
        endpoint: '/ExpenseItems/{id}',
      },
      {
        operation: 'deleteExpenseItems',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ExpenseItems/{id}',
      },
      {
        operation: 'listExpenseItems',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IExpenseItems[]',
        endpoint: '/ExpenseItems',
      }
    ];
  }

  /**
   * Create a new expenseitems
   * @param expenseItems - The expenseitems data to create
   * @returns Promise with the created expenseitems
   */
  async create(expenseItems: IExpenseItems): Promise<ApiResponse<IExpenseItems>> {
    this.logger.info('Creating expenseitems', { expenseItems });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, expenseItems),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a expenseitems by ID
   * @param id - The expenseitems ID
   * @returns Promise with the expenseitems data
   */
  async get(id: number): Promise<ApiResponse<IExpenseItems>> {
    this.logger.info('Getting expenseitems', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a expenseitems
   * @param id - The expenseitems ID
   * @param expenseItems - The updated expenseitems data
   * @returns Promise with the updated expenseitems
   */
  async update(
    id: number,
    expenseItems: Partial<IExpenseItems>
  ): Promise<ApiResponse<IExpenseItems>> {
    this.logger.info('Updating expenseitems', { id, expenseItems });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, expenseItems),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a expenseitems
   * @param id - The expenseitems ID
   * @param expenseItems - The partial expenseitems data to update
   * @returns Promise with the updated expenseitems
   */
  async patch(
    id: number,
    expenseItems: Partial<IExpenseItems>
  ): Promise<ApiResponse<IExpenseItems>> {
    this.logger.info('Patching expenseitems', { id, expenseItems });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, expenseItems),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a expenseitems
   * @param id - The expenseitems ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting expenseitems', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List expenseitems with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of expenseitems
   */
  async list(query: IExpenseItemsQuery = {}): Promise<ApiResponse<IExpenseItems[]>> {
    this.logger.info('Listing expenseitems', { query });
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