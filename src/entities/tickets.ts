import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ITickets {
  id?: number;
  [key: string]: any;
}

export interface ITicketsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Tickets entity class for Autotask API
 *
 * Service tickets and support requests
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: core
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketsEntity.htm}
 */
export class Tickets extends BaseEntity {
  private readonly endpoint = '/Tickets';

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
        operation: 'createTickets',
        requiredParams: ['tickets'],
        optionalParams: [],
        returnType: 'ITickets',
        endpoint: '/Tickets',
      },
      {
        operation: 'getTickets',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ITickets',
        endpoint: '/Tickets/{id}',
      },
      {
        operation: 'updateTickets',
        requiredParams: ['id', 'tickets'],
        optionalParams: [],
        returnType: 'ITickets',
        endpoint: '/Tickets/{id}',
      },
      {
        operation: 'listTickets',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ITickets[]',
        endpoint: '/Tickets',
      },
    ];
  }

  /**
   * Create a new tickets
   * @param tickets - The tickets data to create
   * @returns Promise with the created tickets
   */
  async create(tickets: ITickets): Promise<ApiResponse<ITickets>> {
    this.logger.info('Creating tickets', { tickets });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, tickets),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a tickets by ID
   * @param id - The tickets ID
   * @returns Promise with the tickets data
   */
  async get(id: number): Promise<ApiResponse<ITickets>> {
    this.logger.info('Getting tickets', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a tickets
   * @param id - The tickets ID
   * @param tickets - The updated tickets data
   * @returns Promise with the updated tickets
   */
  async update(
    id: number,
    tickets: Partial<ITickets>
  ): Promise<ApiResponse<ITickets>> {
    this.logger.info('Updating tickets', { id, tickets });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, tickets),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a tickets
   * @param id - The tickets ID
   * @param tickets - The partial tickets data to update
   * @returns Promise with the updated tickets
   */
  async patch(
    id: number,
    tickets: Partial<ITickets>
  ): Promise<ApiResponse<ITickets>> {
    this.logger.info('Patching tickets', { id, tickets });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, tickets),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a tickets
   * @param id - The tickets ID to delete
   * @returns Promise with void response
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting tickets', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List tickets with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of tickets
   */
  async list(query: ITicketsQuery = {}): Promise<ApiResponse<ITickets[]>> {
    this.logger.info('Listing tickets', { query });
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
      async () =>
        this.axios.get(`${this.endpoint}/query`, { params: searchBody }),
      `${this.endpoint}/query`,
      'GET'
    );
  }
}
