import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ITicketRmaCredits {
  id?: number;
  [key: string]: any;
}

export interface ITicketRmaCreditsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * TicketRmaCredits entity class for Autotask API
 * 
 * RMA credits associated with tickets
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: ticketing
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketRmaCreditsEntity.htm}
 */
export class TicketRmaCredits extends BaseEntity {
  private readonly endpoint = '/TicketRmaCredits';

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
        operation: 'createTicketRmaCredits',
        requiredParams: ['ticketRmaCredits'],
        optionalParams: [],
        returnType: 'ITicketRmaCredits',
        endpoint: '/TicketRmaCredits',
      },
      {
        operation: 'getTicketRmaCredits',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ITicketRmaCredits',
        endpoint: '/TicketRmaCredits/{id}',
      },
      {
        operation: 'updateTicketRmaCredits',
        requiredParams: ['id', 'ticketRmaCredits'],
        optionalParams: [],
        returnType: 'ITicketRmaCredits',
        endpoint: '/TicketRmaCredits/{id}',
      },
      {
        operation: 'deleteTicketRmaCredits',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/TicketRmaCredits/{id}',
      },
      {
        operation: 'listTicketRmaCredits',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ITicketRmaCredits[]',
        endpoint: '/TicketRmaCredits',
      }
    ];
  }

  /**
   * Create a new ticketrmacredits
   * @param ticketRmaCredits - The ticketrmacredits data to create
   * @returns Promise with the created ticketrmacredits
   */
  async create(ticketRmaCredits: ITicketRmaCredits): Promise<ApiResponse<ITicketRmaCredits>> {
    this.logger.info('Creating ticketrmacredits', { ticketRmaCredits });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, ticketRmaCredits),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a ticketrmacredits by ID
   * @param id - The ticketrmacredits ID
   * @returns Promise with the ticketrmacredits data
   */
  async get(id: number): Promise<ApiResponse<ITicketRmaCredits>> {
    this.logger.info('Getting ticketrmacredits', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a ticketrmacredits
   * @param id - The ticketrmacredits ID
   * @param ticketRmaCredits - The updated ticketrmacredits data
   * @returns Promise with the updated ticketrmacredits
   */
  async update(
    id: number,
    ticketRmaCredits: Partial<ITicketRmaCredits>
  ): Promise<ApiResponse<ITicketRmaCredits>> {
    this.logger.info('Updating ticketrmacredits', { id, ticketRmaCredits });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, ticketRmaCredits),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a ticketrmacredits
   * @param id - The ticketrmacredits ID
   * @param ticketRmaCredits - The partial ticketrmacredits data to update
   * @returns Promise with the updated ticketrmacredits
   */
  async patch(
    id: number,
    ticketRmaCredits: Partial<ITicketRmaCredits>
  ): Promise<ApiResponse<ITicketRmaCredits>> {
    this.logger.info('Patching ticketrmacredits', { id, ticketRmaCredits });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, ticketRmaCredits),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a ticketrmacredits
   * @param id - The ticketrmacredits ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting ticketrmacredits', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List ticketrmacredits with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of ticketrmacredits
   */
  async list(query: ITicketRmaCreditsQuery = {}): Promise<ApiResponse<ITicketRmaCredits[]>> {
    this.logger.info('Listing ticketrmacredits', { query });
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