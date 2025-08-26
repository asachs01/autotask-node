import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface TicketPriority {
  id?: number;
  name: string;
  description?: string;
  priorityLevel: number;
  isActive?: boolean;
  isDefaultValue?: boolean;
  isSystemValue?: boolean;
  sortOrder?: number;
  [key: string]: any;
}

export interface TicketPriorityQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * TicketPriorities entity class for Autotask API (Compatibility Shim)
 *
 * @deprecated This entity was removed from the official Autotask API.
 * This compatibility shim is provided to maintain test compatibility.
 * Use ticket entity methods or static lookup values instead.
 *
 * Priority values for organizing tickets
 * Supported Operations: GET, POST, PUT, DELETE (simulated)
 * Category: ticketing-lookup
 */
export class TicketPriorities extends BaseEntity {
  private readonly endpoint = '/TicketPriorities';

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
        operation: 'createTicketPriority',
        requiredParams: ['data'],
        optionalParams: [],
        returnType: 'TicketPriority',
        endpoint: '/TicketPriorities',
      },
      {
        operation: 'getTicketPriority',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'TicketPriority',
        endpoint: '/TicketPriorities/{id}',
      },
      {
        operation: 'updateTicketPriority',
        requiredParams: ['id', 'data'],
        optionalParams: [],
        returnType: 'TicketPriority',
        endpoint: '/TicketPriorities/{id}',
      },
      {
        operation: 'deleteTicketPriority',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/TicketPriorities/{id}',
      },
      {
        operation: 'listTicketPriorities',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'TicketPriority[]',
        endpoint: '/TicketPriorities',
      },
    ];
  }

  /**
   * Get a ticket priority by ID
   * @param id - The ticket priority ID
   * @returns Promise with the ticket priority data
   */
  async get(id: number): Promise<ApiResponse<TicketPriority>> {
    this.logger.info('Getting ticket priority', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List ticket priorities with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of ticket priorities
   */
  async list(
    query: TicketPriorityQuery = {}
  ): Promise<ApiResponse<TicketPriority[]>> {
    this.logger.info('Listing ticket priorities', { query });

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
   * Create a new ticket priority
   * @param data - Ticket priority data
   * @returns Promise with the created ticket priority
   */
  async create(data: TicketPriority): Promise<ApiResponse<TicketPriority>> {
    this.logger.info('Creating ticket priority', { data });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, data),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Update a ticket priority
   * @param id - The ticket priority ID
   * @param data - Updated ticket priority data
   * @returns Promise with the updated ticket priority
   */
  async update(
    id: number,
    data: Partial<TicketPriority>
  ): Promise<ApiResponse<TicketPriority>> {
    this.logger.info('Updating ticket priority', { id, data });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, data),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Delete a ticket priority
   * @param id - The ticket priority ID
   * @returns Promise that resolves when the priority is deleted
   */
  async delete(id: number): Promise<ApiResponse<any>> {
    this.logger.info('Deleting ticket priority', { id });
    return this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }
}
