import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IHolidays {
  id?: number;
  [key: string]: any;
}

export interface IHolidaysQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Holidays entity class for Autotask API
 * 
 * Holiday calendar entries
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: time
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/HolidaysEntity.htm}
 */
export class Holidays extends BaseEntity {
  private readonly endpoint = '/Holidays';

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
        operation: 'createHolidays',
        requiredParams: ['holidays'],
        optionalParams: [],
        returnType: 'IHolidays',
        endpoint: '/Holidays',
      },
      {
        operation: 'getHolidays',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IHolidays',
        endpoint: '/Holidays/{id}',
      },
      {
        operation: 'updateHolidays',
        requiredParams: ['id', 'holidays'],
        optionalParams: [],
        returnType: 'IHolidays',
        endpoint: '/Holidays/{id}',
      },
      {
        operation: 'deleteHolidays',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/Holidays/{id}',
      },
      {
        operation: 'listHolidays',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IHolidays[]',
        endpoint: '/Holidays',
      }
    ];
  }

  /**
   * Create a new holidays
   * @param holidays - The holidays data to create
   * @returns Promise with the created holidays
   */
  async create(holidays: IHolidays): Promise<ApiResponse<IHolidays>> {
    this.logger.info('Creating holidays', { holidays });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, holidays),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a holidays by ID
   * @param id - The holidays ID
   * @returns Promise with the holidays data
   */
  async get(id: number): Promise<ApiResponse<IHolidays>> {
    this.logger.info('Getting holidays', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a holidays
   * @param id - The holidays ID
   * @param holidays - The updated holidays data
   * @returns Promise with the updated holidays
   */
  async update(
    id: number,
    holidays: Partial<IHolidays>
  ): Promise<ApiResponse<IHolidays>> {
    this.logger.info('Updating holidays', { id, holidays });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, holidays),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a holidays
   * @param id - The holidays ID
   * @param holidays - The partial holidays data to update
   * @returns Promise with the updated holidays
   */
  async patch(
    id: number,
    holidays: Partial<IHolidays>
  ): Promise<ApiResponse<IHolidays>> {
    this.logger.info('Patching holidays', { id, holidays });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, holidays),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a holidays
   * @param id - The holidays ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting holidays', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List holidays with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of holidays
   */
  async list(query: IHolidaysQuery = {}): Promise<ApiResponse<IHolidays[]>> {
    this.logger.info('Listing holidays', { query });
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