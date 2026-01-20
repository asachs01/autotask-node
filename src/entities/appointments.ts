import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IAppointments {
  id?: number;
  [key: string]: any;
}

export interface IAppointmentsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Appointments entity class for Autotask API
 * 
 * Calendar appointments and scheduling
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: time
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/AppointmentsEntity.htm}
 */
export class Appointments extends BaseEntity {
  private readonly endpoint = '/Appointments';

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
        operation: 'createAppointments',
        requiredParams: ['appointments'],
        optionalParams: [],
        returnType: 'IAppointments',
        endpoint: '/Appointments',
      },
      {
        operation: 'getAppointments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IAppointments',
        endpoint: '/Appointments/{id}',
      },
      {
        operation: 'updateAppointments',
        requiredParams: ['id', 'appointments'],
        optionalParams: [],
        returnType: 'IAppointments',
        endpoint: '/Appointments/{id}',
      },
      {
        operation: 'deleteAppointments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/Appointments/{id}',
      },
      {
        operation: 'listAppointments',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IAppointments[]',
        endpoint: '/Appointments',
      }
    ];
  }

  /**
   * Create a new appointments
   * @param appointments - The appointments data to create
   * @returns Promise with the created appointments
   */
  async create(appointments: IAppointments): Promise<ApiResponse<IAppointments>> {
    this.logger.info('Creating appointments', { appointments });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, appointments),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a appointments by ID
   * @param id - The appointments ID
   * @returns Promise with the appointments data
   */
  async get(id: number): Promise<ApiResponse<IAppointments>> {
    this.logger.info('Getting appointments', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a appointments
   * @param id - The appointments ID
   * @param appointments - The updated appointments data
   * @returns Promise with the updated appointments
   */
  async update(
    id: number,
    appointments: Partial<IAppointments>
  ): Promise<ApiResponse<IAppointments>> {
    this.logger.info('Updating appointments', { id, appointments });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, appointments),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a appointments
   * @param id - The appointments ID
   * @param appointments - The partial appointments data to update
   * @returns Promise with the updated appointments
   */
  async patch(
    id: number,
    appointments: Partial<IAppointments>
  ): Promise<ApiResponse<IAppointments>> {
    this.logger.info('Patching appointments', { id, appointments });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, appointments),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a appointments
   * @param id - The appointments ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting appointments', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List appointments with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of appointments
   */
  async list(query: IAppointmentsQuery = {}): Promise<ApiResponse<IAppointments[]>> {
    this.logger.info('Listing appointments', { query });
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