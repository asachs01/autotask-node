import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ITicketCharges {
  id?: number;
  [key: string]: any;
}

export interface ITicketChargesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * TicketCharges entity class for Autotask API
 * 
 * Charges associated with tickets
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: ticketing
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketChargesEntity.htm}
 */
export class TicketCharges extends BaseEntity {
  private readonly endpoint = '/TicketCharges';

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
        operation: 'createTicketCharges',
        requiredParams: ['ticketCharges'],
        optionalParams: [],
        returnType: 'ITicketCharges',
        endpoint: '/TicketCharges',
      },
      {
        operation: 'getTicketCharges',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ITicketCharges',
        endpoint: '/TicketCharges/{id}',
      },
      {
        operation: 'updateTicketCharges',
        requiredParams: ['id', 'ticketCharges'],
        optionalParams: [],
        returnType: 'ITicketCharges',
        endpoint: '/TicketCharges/{id}',
      },
      {
        operation: 'deleteTicketCharges',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/TicketCharges/{id}',
      },
      {
        operation: 'listTicketCharges',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ITicketCharges[]',
        endpoint: '/TicketCharges',
      }
    ];
  }

  /**
   * Create a new ticketcharges
   * @param ticketCharges - The ticketcharges data to create
   * @returns Promise with the created ticketcharges
   */
  async create(ticketCharges: ITicketCharges): Promise<ApiResponse<ITicketCharges>> {
    this.logger.info('Creating ticketcharges', { ticketCharges });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, ticketCharges),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a ticketcharges by ID
   * @param id - The ticketcharges ID
   * @returns Promise with the ticketcharges data
   */
  async get(id: number): Promise<ApiResponse<ITicketCharges>> {
    this.logger.info('Getting ticketcharges', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a ticketcharges
   * @param id - The ticketcharges ID
   * @param ticketCharges - The updated ticketcharges data
   * @returns Promise with the updated ticketcharges
   */
  async update(
    id: number,
    ticketCharges: Partial<ITicketCharges>
  ): Promise<ApiResponse<ITicketCharges>> {
    this.logger.info('Updating ticketcharges', { id, ticketCharges });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, ticketCharges),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a ticketcharges
   * @param id - The ticketcharges ID
   * @param ticketCharges - The partial ticketcharges data to update
   * @returns Promise with the updated ticketcharges
   */
  async patch(
    id: number,
    ticketCharges: Partial<ITicketCharges>
  ): Promise<ApiResponse<ITicketCharges>> {
    this.logger.info('Patching ticketcharges', { id, ticketCharges });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, ticketCharges),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a ticketcharges
   * @param id - The ticketcharges ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting ticketcharges', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List ticketcharges with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of ticketcharges
   */
  async list(query: ITicketChargesQuery = {}): Promise<ApiResponse<ITicketCharges[]>> {
    this.logger.info('Listing ticketcharges', { query });
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