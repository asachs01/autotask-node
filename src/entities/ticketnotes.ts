import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ITicketNotes {
  id?: number;
  [key: string]: any;
}

export interface ITicketNotesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * TicketNotes entity class for Autotask API
 *
 * Notes for tickets
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketNotesEntity.htm}
 */
export class TicketNotes extends BaseEntity {
  private readonly endpoint = '/TicketNotes';

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
        operation: 'createTicketNotes',
        requiredParams: ['ticketId', 'ticketNotes'],
        optionalParams: [],
        returnType: 'ITicketNotes',
        endpoint: '/Tickets/{ticketId}/Notes',
      },
      {
        operation: 'getTicketNotes',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ITicketNotes',
        endpoint: '/TicketNotes/{id}',
      },
      {
        operation: 'updateTicketNotes',
        requiredParams: ['id', 'ticketNotes'],
        optionalParams: [],
        returnType: 'ITicketNotes',
        endpoint: '/TicketNotes/{id}',
      },
      {
        operation: 'listTicketNotes',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ITicketNotes[]',
        endpoint: '/TicketNotes',
      },
    ];
  }

  /**
   * Create a new ticket note
   * @param ticketId - The parent ticket ID
   * @param ticketNotes - The ticket note data to create
   * @returns Promise with the created ticket note
   */
  async create(
    ticketId: number,
    ticketNotes: ITicketNotes
  ): Promise<ApiResponse<ITicketNotes>> {
    const createEndpoint = `/Tickets/${ticketId}/Notes`;
    this.logger.info('Creating ticketnotes', { ticketId, ticketNotes });
    return this.executeRequest(
      async () => this.axios.post(createEndpoint, ticketNotes),
      createEndpoint,
      'POST'
    );
  }

  /**
   * Get a ticketnotes by ID
   * @param id - The ticketnotes ID
   * @returns Promise with the ticketnotes data
   */
  async get(id: number): Promise<ApiResponse<ITicketNotes>> {
    this.logger.info('Getting ticketnotes', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a ticketnotes
   * @param id - The ticketnotes ID
   * @param ticketNotes - The updated ticketnotes data
   * @returns Promise with the updated ticketnotes
   */
  async update(
    id: number,
    ticketNotes: Partial<ITicketNotes>
  ): Promise<ApiResponse<ITicketNotes>> {
    this.logger.info('Updating ticketnotes', { id, ticketNotes });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, ticketNotes),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a ticketnotes
   * @param id - The ticketnotes ID
   * @param ticketNotes - The partial ticketnotes data to update
   * @returns Promise with the updated ticketnotes
   */
  async patch(
    id: number,
    ticketNotes: Partial<ITicketNotes>
  ): Promise<ApiResponse<ITicketNotes>> {
    this.logger.info('Patching ticketnotes', { id, ticketNotes });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, ticketNotes),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * List ticketnotes with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of ticketnotes
   */
  async list(
    query: ITicketNotesQuery = {}
  ): Promise<ApiResponse<ITicketNotes[]>> {
    this.logger.info('Listing ticketnotes', { query });
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
          if (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)
          ) {
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
