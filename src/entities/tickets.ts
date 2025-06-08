import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface Ticket {
  id?: number;
  accountId?: number;
  title?: string;
  status?: number;
  [key: string]: any;
}

export interface TicketQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

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
        operation: 'createTicket',
        requiredParams: ['ticket'],
        optionalParams: [],
        returnType: 'Ticket',
        endpoint: '/Tickets',
      },
      {
        operation: 'getTicket',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'Ticket',
        endpoint: '/Tickets/{id}',
      },
      {
        operation: 'updateTicket',
        requiredParams: ['id', 'ticket'],
        optionalParams: [],
        returnType: 'Ticket',
        endpoint: '/Tickets/{id}',
      },
      {
        operation: 'deleteTicket',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/Tickets/{id}',
      },
      {
        operation: 'listTickets',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'Ticket[]',
        endpoint: '/Tickets',
      },
    ];
  }

  async create(ticket: Ticket): Promise<ApiResponse<Ticket>> {
    this.logger.info('Creating ticket', { ticket });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, ticket),
      this.endpoint,
      'POST'
    );
  }

  async get(id: number): Promise<ApiResponse<Ticket>> {
    this.logger.info('Getting ticket', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  async update(
    id: number,
    ticket: Partial<Ticket>
  ): Promise<ApiResponse<Ticket>> {
    this.logger.info('Updating ticket', { id, ticket });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, ticket),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting ticket', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
    // Return void for delete operations
    return;
  }

  async list(query: TicketQuery = {}): Promise<ApiResponse<Ticket[]>> {
    this.logger.info('Listing tickets', { query });
    const searchBody: Record<string, any> = {};

    // Ensure there's a filter - Autotask API requires a filter
    if (!query.filter || Object.keys(query.filter).length === 0) {
      searchBody.filter = [
        {
          op: 'gte',
          field: 'id',
          value: 0,
        },
      ];
    } else {
      // If filter is provided as an object, convert to array format expected by API
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

    // Validate that accountId is included in the search
    let hasAccountFilter = false;

    if (searchBody.filter && Array.isArray(searchBody.filter)) {
      hasAccountFilter = searchBody.filter.some(
        (filter: any) =>
          filter.field === 'accountId' || filter.field === 'companyID'
      );
    }

    if (!hasAccountFilter) {
      this.logger.warn(
        '⚠️ No accountId filter found. Adding default filter to prevent large result sets.'
      );
      if (!searchBody.filter) {
        searchBody.filter = [];
      }
      // Add a reasonable default filter
      searchBody.filter.push({
        op: 'gte',
        field: 'id',
        value: 0,
      });
    }

    this.logger.info('Listing tickets with search body', { searchBody });

    return this.executeQueryRequest(
      async () => this.axios.post(`${this.endpoint}/query`, searchBody),
      `${this.endpoint}/query`,
      'POST'
    );
  }
}
