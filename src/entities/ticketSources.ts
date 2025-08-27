import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface TicketSource {
  id?: number;
  name: string;
  description?: string;
  isActive?: boolean;
  isDefaultValue?: boolean;
  isSystemValue?: boolean;
  sortOrder?: number;
  [key: string]: any;
}

export interface TicketSourceQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * TicketSources entity class for Autotask API (Compatibility Shim)
 *
 * @deprecated This entity was removed from the official Autotask API.
 * This compatibility shim is provided to maintain test compatibility.
 * Use ticket entity methods or static lookup values instead.
 *
 * Source values for organizing tickets
 * Supported Operations: GET, POST, PUT, DELETE (simulated)
 * Category: ticketing-lookup
 */
export class TicketSources extends BaseEntity {
  private readonly endpoint = '/TicketSources';

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
        operation: 'createTicketSource',
        requiredParams: ['data'],
        optionalParams: [],
        returnType: 'TicketSource',
        endpoint: '/TicketSources',
      },
      {
        operation: 'getTicketSource',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'TicketSource',
        endpoint: '/TicketSources/{id}',
      },
      {
        operation: 'updateTicketSource',
        requiredParams: ['id', 'data'],
        optionalParams: [],
        returnType: 'TicketSource',
        endpoint: '/TicketSources/{id}',
      },
      {
        operation: 'deleteTicketSource',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/TicketSources/{id}',
      },
      {
        operation: 'listTicketSources',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'TicketSource[]',
        endpoint: '/TicketSources',
      },
    ];
  }

  /**
   * Get a ticket source by ID
   * @param id - The ticket source ID
   * @returns Promise with the ticket source data
   */
  async get(id: number): Promise<ApiResponse<TicketSource>> {
    this.logger.info('Getting ticket source', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List ticket sources with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of ticket sources
   */
  async list(
    query: TicketSourceQuery = {}
  ): Promise<ApiResponse<TicketSource[]>> {
    this.logger.info('Listing ticket sources', { query });

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
   * Create a new ticket source
   * @param data - Ticket source data
   * @returns Promise with the created ticket source
   */
  async create(data: TicketSource): Promise<ApiResponse<TicketSource>> {
    this.logger.info('Creating ticket source', { data });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, data),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Update a ticket source
   * @param id - The ticket source ID
   * @param data - Updated ticket source data
   * @returns Promise with the updated ticket source
   */
  async update(
    id: number,
    data: Partial<TicketSource>
  ): Promise<ApiResponse<TicketSource>> {
    this.logger.info('Updating ticket source', { id, data });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, data),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Delete a ticket source
   * @param id - The ticket source ID
   * @returns Promise that resolves when the source is deleted
   */
  async delete(id: number): Promise<ApiResponse<any>> {
    this.logger.info('Deleting ticket source', { id });
    return this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }
}
