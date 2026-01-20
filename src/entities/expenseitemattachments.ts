import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IExpenseItemAttachments {
  id?: number;
  [key: string]: any;
}

export interface IExpenseItemAttachmentsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ExpenseItemAttachments entity class for Autotask API
 * 
 * File attachments for expense items
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ExpenseItemAttachmentsEntity.htm}
 */
export class ExpenseItemAttachments extends BaseEntity {
  private readonly endpoint = '/ExpenseItemAttachments';

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
        operation: 'createExpenseItemAttachments',
        requiredParams: ['expenseItemAttachments'],
        optionalParams: [],
        returnType: 'IExpenseItemAttachments',
        endpoint: '/ExpenseItemAttachments',
      },
      {
        operation: 'getExpenseItemAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IExpenseItemAttachments',
        endpoint: '/ExpenseItemAttachments/{id}',
      },
      {
        operation: 'deleteExpenseItemAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ExpenseItemAttachments/{id}',
      },
      {
        operation: 'listExpenseItemAttachments',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IExpenseItemAttachments[]',
        endpoint: '/ExpenseItemAttachments',
      }
    ];
  }

  /**
   * Create a new expenseitemattachments
   * @param expenseItemAttachments - The expenseitemattachments data to create
   * @returns Promise with the created expenseitemattachments
   */
  async create(expenseItemAttachments: IExpenseItemAttachments): Promise<ApiResponse<IExpenseItemAttachments>> {
    this.logger.info('Creating expenseitemattachments', { expenseItemAttachments });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, expenseItemAttachments),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a expenseitemattachments by ID
   * @param id - The expenseitemattachments ID
   * @returns Promise with the expenseitemattachments data
   */
  async get(id: number): Promise<ApiResponse<IExpenseItemAttachments>> {
    this.logger.info('Getting expenseitemattachments', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a expenseitemattachments
   * @param id - The expenseitemattachments ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting expenseitemattachments', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List expenseitemattachments with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of expenseitemattachments
   */
  async list(query: IExpenseItemAttachmentsQuery = {}): Promise<ApiResponse<IExpenseItemAttachments[]>> {
    this.logger.info('Listing expenseitemattachments', { query });
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