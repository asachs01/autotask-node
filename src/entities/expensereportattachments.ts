import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IExpenseReportAttachments {
  id?: number;
  [key: string]: any;
}

export interface IExpenseReportAttachmentsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ExpenseReportAttachments entity class for Autotask API
 * 
 * File attachments for expense reports
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ExpenseReportAttachmentsEntity.htm}
 */
export class ExpenseReportAttachments extends BaseEntity {
  private readonly endpoint = '/ExpenseReportAttachments';

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
        operation: 'createExpenseReportAttachments',
        requiredParams: ['expenseReportAttachments'],
        optionalParams: [],
        returnType: 'IExpenseReportAttachments',
        endpoint: '/ExpenseReportAttachments',
      },
      {
        operation: 'getExpenseReportAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IExpenseReportAttachments',
        endpoint: '/ExpenseReportAttachments/{id}',
      },
      {
        operation: 'deleteExpenseReportAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ExpenseReportAttachments/{id}',
      },
      {
        operation: 'listExpenseReportAttachments',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IExpenseReportAttachments[]',
        endpoint: '/ExpenseReportAttachments',
      }
    ];
  }

  /**
   * Create a new expensereportattachments
   * @param expenseReportAttachments - The expensereportattachments data to create
   * @returns Promise with the created expensereportattachments
   */
  async create(expenseReportAttachments: IExpenseReportAttachments): Promise<ApiResponse<IExpenseReportAttachments>> {
    this.logger.info('Creating expensereportattachments', { expenseReportAttachments });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, expenseReportAttachments),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a expensereportattachments by ID
   * @param id - The expensereportattachments ID
   * @returns Promise with the expensereportattachments data
   */
  async get(id: number): Promise<ApiResponse<IExpenseReportAttachments>> {
    this.logger.info('Getting expensereportattachments', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a expensereportattachments
   * @param id - The expensereportattachments ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting expensereportattachments', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List expensereportattachments with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of expensereportattachments
   */
  async list(query: IExpenseReportAttachmentsQuery = {}): Promise<ApiResponse<IExpenseReportAttachments[]>> {
    this.logger.info('Listing expensereportattachments', { query });
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