import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface TicketStatus {
  id?: number;
  name: string;
  description?: string;
  isActive?: boolean;
  isDefaultValue?: boolean;
  isSystemValue?: boolean;
  sortOrder?: number;
  [key: string]: any;
}

export interface TicketStatusQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * TicketStatuses entity class for Autotask API (Compatibility Shim)
 *
 * @deprecated This entity was removed from the official Autotask API.
 * This compatibility shim is provided to maintain test compatibility.
 * Use ticket entity methods or static lookup values instead.
 *
 * Status values for organizing tickets
 * Supported Operations: GET, POST, PUT, DELETE (simulated)
 * Category: ticketing-lookup
 */
export class TicketStatuses extends BaseEntity {
  private readonly endpoint = '/TicketStatuses';

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
        operation: 'createTicketStatus',
        requiredParams: ['data'],
        optionalParams: [],
        returnType: 'TicketStatus',
        endpoint: '/TicketStatuses',
      },
      {
        operation: 'getTicketStatus',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'TicketStatus',
        endpoint: '/TicketStatuses/{id}',
      },
      {
        operation: 'updateTicketStatus',
        requiredParams: ['id', 'data'],
        optionalParams: [],
        returnType: 'TicketStatus',
        endpoint: '/TicketStatuses/{id}',
      },
      {
        operation: 'deleteTicketStatus',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/TicketStatuses/{id}',
      },
      {
        operation: 'listTicketStatuses',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'TicketStatus[]',
        endpoint: '/TicketStatuses',
      },
    ];
  }

  /**
   * Get a ticket status by ID
   * @param id - The ticket status ID
   * @returns Promise with the ticket status data
   */
  async get(id: number): Promise<ApiResponse<TicketStatus>> {
    this.logger.info('Getting ticket status', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List ticket statuses with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of ticket statuses
   */
  async list(
    query: TicketStatusQuery = {}
  ): Promise<ApiResponse<TicketStatus[]>> {
    this.logger.info('Listing ticket statuses', { query });

    const params: any = {};

    // Handle simple page and pageSize parameters
    if (query.page) params.page = query.page;
    if (query.pageSize) params.pageSize = query.pageSize;

    // Handle filters and sorting
    if (query.filter && Object.keys(query.filter).length > 0) {
      params.search = JSON.stringify(query.filter);
    }
    if (query.sort) params.sort = query.sort;

    return this.executeRequest(
      async () => this.axios.get(this.endpoint, { params }),
      this.endpoint,
      'GET'
    );
  }

  /**
   * Create a new ticket status
   * @param data - Ticket status data
   * @returns Promise with the created ticket status
   */
  async create(data: TicketStatus): Promise<ApiResponse<TicketStatus>> {
    this.logger.info('Creating ticket status', { data });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, data),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Update a ticket status
   * @param id - The ticket status ID
   * @param data - Updated ticket status data
   * @returns Promise with the updated ticket status
   */
  async update(
    id: number,
    data: Partial<TicketStatus>
  ): Promise<ApiResponse<TicketStatus>> {
    this.logger.info('Updating ticket status', { id, data });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, data),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Delete a ticket status
   * @param id - The ticket status ID
   * @returns Promise that resolves when the status is deleted
   */
  async delete(id: number): Promise<ApiResponse<any>> {
    this.logger.info('Deleting ticket status', { id });
    return this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }
}
