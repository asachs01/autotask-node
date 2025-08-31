import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ITimeEntryAttachments {
  id?: number;
  [key: string]: any;
}

export interface ITimeEntryAttachmentsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * TimeEntryAttachments entity class for Autotask API
 * 
 * File attachments for time entries
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TimeEntryAttachmentsEntity.htm}
 */
export class TimeEntryAttachments extends BaseEntity {
  private readonly endpoint = '/TimeEntryAttachments';

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
        operation: 'createTimeEntryAttachments',
        requiredParams: ['timeEntryAttachments'],
        optionalParams: [],
        returnType: 'ITimeEntryAttachments',
        endpoint: '/TimeEntryAttachments',
      },
      {
        operation: 'getTimeEntryAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ITimeEntryAttachments',
        endpoint: '/TimeEntryAttachments/{id}',
      },
      {
        operation: 'deleteTimeEntryAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/TimeEntryAttachments/{id}',
      },
      {
        operation: 'listTimeEntryAttachments',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ITimeEntryAttachments[]',
        endpoint: '/TimeEntryAttachments',
      }
    ];
  }

  /**
   * Create a new timeentryattachments
   * @param timeEntryAttachments - The timeentryattachments data to create
   * @returns Promise with the created timeentryattachments
   */
  async create(timeEntryAttachments: ITimeEntryAttachments): Promise<ApiResponse<ITimeEntryAttachments>> {
    this.logger.info('Creating timeentryattachments', { timeEntryAttachments });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, timeEntryAttachments),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a timeentryattachments by ID
   * @param id - The timeentryattachments ID
   * @returns Promise with the timeentryattachments data
   */
  async get(id: number): Promise<ApiResponse<ITimeEntryAttachments>> {
    this.logger.info('Getting timeentryattachments', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a timeentryattachments
   * @param id - The timeentryattachments ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting timeentryattachments', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List timeentryattachments with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of timeentryattachments
   */
  async list(query: ITimeEntryAttachmentsQuery = {}): Promise<ApiResponse<ITimeEntryAttachments[]>> {
    this.logger.info('Listing timeentryattachments', { query });
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