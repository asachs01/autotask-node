import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IExpenseReports {
  id?: number;
  [key: string]: any;
}

export interface IExpenseReportsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ExpenseReports entity class for Autotask API
 * 
 * Expense reports for reimbursement
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: expense
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ExpenseReportsEntity.htm}
 */
export class ExpenseReports extends BaseEntity {
  private readonly endpoint = '/ExpenseReports';

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
        operation: 'createExpenseReports',
        requiredParams: ['expenseReports'],
        optionalParams: [],
        returnType: 'IExpenseReports',
        endpoint: '/ExpenseReports',
      },
      {
        operation: 'getExpenseReports',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IExpenseReports',
        endpoint: '/ExpenseReports/{id}',
      },
      {
        operation: 'updateExpenseReports',
        requiredParams: ['id', 'expenseReports'],
        optionalParams: [],
        returnType: 'IExpenseReports',
        endpoint: '/ExpenseReports/{id}',
      },
      {
        operation: 'deleteExpenseReports',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ExpenseReports/{id}',
      },
      {
        operation: 'listExpenseReports',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IExpenseReports[]',
        endpoint: '/ExpenseReports',
      }
    ];
  }

  /**
   * Create a new expensereports
   * @param expenseReports - The expensereports data to create
   * @returns Promise with the created expensereports
   */
  async create(expenseReports: IExpenseReports): Promise<ApiResponse<IExpenseReports>> {
    this.logger.info('Creating expensereports', { expenseReports });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, expenseReports),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a expensereports by ID
   * @param id - The expensereports ID
   * @returns Promise with the expensereports data
   */
  async get(id: number): Promise<ApiResponse<IExpenseReports>> {
    this.logger.info('Getting expensereports', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a expensereports
   * @param id - The expensereports ID
   * @param expenseReports - The updated expensereports data
   * @returns Promise with the updated expensereports
   */
  async update(
    id: number,
    expenseReports: Partial<IExpenseReports>
  ): Promise<ApiResponse<IExpenseReports>> {
    this.logger.info('Updating expensereports', { id, expenseReports });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, expenseReports),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a expensereports
   * @param id - The expensereports ID
   * @param expenseReports - The partial expensereports data to update
   * @returns Promise with the updated expensereports
   */
  async patch(
    id: number,
    expenseReports: Partial<IExpenseReports>
  ): Promise<ApiResponse<IExpenseReports>> {
    this.logger.info('Patching expensereports', { id, expenseReports });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, expenseReports),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a expensereports
   * @param id - The expensereports ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting expensereports', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List expensereports with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of expensereports
   */
  async list(query: IExpenseReportsQuery = {}): Promise<ApiResponse<IExpenseReports[]>> {
    this.logger.info('Listing expensereports', { query });
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
      async () => this.axios.post(`${this.endpoint}/query`, searchBody),
      `${this.endpoint}/query`,
      'POST'
    );
  }
}