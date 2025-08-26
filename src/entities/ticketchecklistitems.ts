import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ITicketChecklistItems {
  id?: number;
  [key: string]: any;
}

export interface ITicketChecklistItemsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * TicketChecklistItems entity class for Autotask API
 * 
 * Checklist items for tickets
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: ticketing
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketChecklistItemsEntity.htm}
 */
export class TicketChecklistItems extends BaseEntity {
  private readonly endpoint = '/TicketChecklistItems';

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
        operation: 'createTicketChecklistItems',
        requiredParams: ['ticketChecklistItems'],
        optionalParams: [],
        returnType: 'ITicketChecklistItems',
        endpoint: '/TicketChecklistItems',
      },
      {
        operation: 'getTicketChecklistItems',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ITicketChecklistItems',
        endpoint: '/TicketChecklistItems/{id}',
      },
      {
        operation: 'updateTicketChecklistItems',
        requiredParams: ['id', 'ticketChecklistItems'],
        optionalParams: [],
        returnType: 'ITicketChecklistItems',
        endpoint: '/TicketChecklistItems/{id}',
      },
      {
        operation: 'listTicketChecklistItems',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ITicketChecklistItems[]',
        endpoint: '/TicketChecklistItems',
      }
    ];
  }

  /**
   * Create a new ticketchecklistitems
   * @param ticketChecklistItems - The ticketchecklistitems data to create
   * @returns Promise with the created ticketchecklistitems
   */
  async create(ticketChecklistItems: ITicketChecklistItems): Promise<ApiResponse<ITicketChecklistItems>> {
    this.logger.info('Creating ticketchecklistitems', { ticketChecklistItems });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, ticketChecklistItems),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a ticketchecklistitems by ID
   * @param id - The ticketchecklistitems ID
   * @returns Promise with the ticketchecklistitems data
   */
  async get(id: number): Promise<ApiResponse<ITicketChecklistItems>> {
    this.logger.info('Getting ticketchecklistitems', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a ticketchecklistitems
   * @param id - The ticketchecklistitems ID
   * @param ticketChecklistItems - The updated ticketchecklistitems data
   * @returns Promise with the updated ticketchecklistitems
   */
  async update(
    id: number,
    ticketChecklistItems: Partial<ITicketChecklistItems>
  ): Promise<ApiResponse<ITicketChecklistItems>> {
    this.logger.info('Updating ticketchecklistitems', { id, ticketChecklistItems });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, ticketChecklistItems),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a ticketchecklistitems
   * @param id - The ticketchecklistitems ID
   * @param ticketChecklistItems - The partial ticketchecklistitems data to update
   * @returns Promise with the updated ticketchecklistitems
   */
  async patch(
    id: number,
    ticketChecklistItems: Partial<ITicketChecklistItems>
  ): Promise<ApiResponse<ITicketChecklistItems>> {
    this.logger.info('Patching ticketchecklistitems', { id, ticketChecklistItems });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, ticketChecklistItems),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * List ticketchecklistitems with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of ticketchecklistitems
   */
  async list(query: ITicketChecklistItemsQuery = {}): Promise<ApiResponse<ITicketChecklistItems[]>> {
    this.logger.info('Listing ticketchecklistitems', { query });
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