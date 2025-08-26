import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ITimeOffRequests {
  id?: number;
  [key: string]: any;
}

export interface ITimeOffRequestsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * TimeOffRequests entity class for Autotask API
 * 
 * Requests for time off
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: time
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TimeOffRequestsEntity.htm}
 */
export class TimeOffRequests extends BaseEntity {
  private readonly endpoint = '/TimeOffRequests';

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
        operation: 'createTimeOffRequests',
        requiredParams: ['timeOffRequests'],
        optionalParams: [],
        returnType: 'ITimeOffRequests',
        endpoint: '/TimeOffRequests',
      },
      {
        operation: 'getTimeOffRequests',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ITimeOffRequests',
        endpoint: '/TimeOffRequests/{id}',
      },
      {
        operation: 'updateTimeOffRequests',
        requiredParams: ['id', 'timeOffRequests'],
        optionalParams: [],
        returnType: 'ITimeOffRequests',
        endpoint: '/TimeOffRequests/{id}',
      },
      {
        operation: 'deleteTimeOffRequests',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/TimeOffRequests/{id}',
      },
      {
        operation: 'listTimeOffRequests',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ITimeOffRequests[]',
        endpoint: '/TimeOffRequests',
      }
    ];
  }

  /**
   * Create a new timeoffrequests
   * @param timeOffRequests - The timeoffrequests data to create
   * @returns Promise with the created timeoffrequests
   */
  async create(timeOffRequests: ITimeOffRequests): Promise<ApiResponse<ITimeOffRequests>> {
    this.logger.info('Creating timeoffrequests', { timeOffRequests });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, timeOffRequests),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a timeoffrequests by ID
   * @param id - The timeoffrequests ID
   * @returns Promise with the timeoffrequests data
   */
  async get(id: number): Promise<ApiResponse<ITimeOffRequests>> {
    this.logger.info('Getting timeoffrequests', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a timeoffrequests
   * @param id - The timeoffrequests ID
   * @param timeOffRequests - The updated timeoffrequests data
   * @returns Promise with the updated timeoffrequests
   */
  async update(
    id: number,
    timeOffRequests: Partial<ITimeOffRequests>
  ): Promise<ApiResponse<ITimeOffRequests>> {
    this.logger.info('Updating timeoffrequests', { id, timeOffRequests });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, timeOffRequests),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a timeoffrequests
   * @param id - The timeoffrequests ID
   * @param timeOffRequests - The partial timeoffrequests data to update
   * @returns Promise with the updated timeoffrequests
   */
  async patch(
    id: number,
    timeOffRequests: Partial<ITimeOffRequests>
  ): Promise<ApiResponse<ITimeOffRequests>> {
    this.logger.info('Patching timeoffrequests', { id, timeOffRequests });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, timeOffRequests),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a timeoffrequests
   * @param id - The timeoffrequests ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting timeoffrequests', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List timeoffrequests with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of timeoffrequests
   */
  async list(query: ITimeOffRequestsQuery = {}): Promise<ApiResponse<ITimeOffRequests[]>> {
    this.logger.info('Listing timeoffrequests', { query });
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