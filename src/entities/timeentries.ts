import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ITimeEntries {
  id?: number;
  [key: string]: any;
}

export interface ITimeEntriesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * TimeEntries entity class for Autotask API
 * 
 * Time tracking entries for billing
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: time
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TimeEntriesEntity.htm}
 */
export class TimeEntries extends BaseEntity {
  private readonly endpoint = '/TimeEntries';

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
        operation: 'createTimeEntries',
        requiredParams: ['timeEntries'],
        optionalParams: [],
        returnType: 'ITimeEntries',
        endpoint: '/TimeEntries',
      },
      {
        operation: 'getTimeEntries',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ITimeEntries',
        endpoint: '/TimeEntries/{id}',
      },
      {
        operation: 'updateTimeEntries',
        requiredParams: ['id', 'timeEntries'],
        optionalParams: [],
        returnType: 'ITimeEntries',
        endpoint: '/TimeEntries/{id}',
      },
      {
        operation: 'deleteTimeEntries',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/TimeEntries/{id}',
      },
      {
        operation: 'listTimeEntries',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ITimeEntries[]',
        endpoint: '/TimeEntries',
      }
    ];
  }

  /**
   * Create a new timeentries
   * @param timeEntries - The timeentries data to create
   * @returns Promise with the created timeentries
   */
  async create(timeEntries: ITimeEntries): Promise<ApiResponse<ITimeEntries>> {
    this.logger.info('Creating timeentries', { timeEntries });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, timeEntries),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a timeentries by ID
   * @param id - The timeentries ID
   * @returns Promise with the timeentries data
   */
  async get(id: number): Promise<ApiResponse<ITimeEntries>> {
    this.logger.info('Getting timeentries', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a timeentries
   * @param id - The timeentries ID
   * @param timeEntries - The updated timeentries data
   * @returns Promise with the updated timeentries
   */
  async update(
    id: number,
    timeEntries: Partial<ITimeEntries>
  ): Promise<ApiResponse<ITimeEntries>> {
    this.logger.info('Updating timeentries', { id, timeEntries });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, timeEntries),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a timeentries
   * @param id - The timeentries ID
   * @param timeEntries - The partial timeentries data to update
   * @returns Promise with the updated timeentries
   */
  async patch(
    id: number,
    timeEntries: Partial<ITimeEntries>
  ): Promise<ApiResponse<ITimeEntries>> {
    this.logger.info('Patching timeentries', { id, timeEntries });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, timeEntries),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a timeentries
   * @param id - The timeentries ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting timeentries', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List timeentries with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of timeentries
   */
  async list(query: ITimeEntriesQuery = {}): Promise<ApiResponse<ITimeEntries[]>> {
    this.logger.info('Listing timeentries', { query });
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