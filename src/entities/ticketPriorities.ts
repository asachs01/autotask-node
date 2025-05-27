import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse } from '../types';

export interface TicketPriority {
  id?: number;
  name?: string;
  description?: string;
  isActive?: boolean;
  isDefaultValue?: boolean;
  isSystemValue?: boolean;
  label?: string;
  sortOrder?: number;
  priorityLevel?: number;
  [key: string]: any;
}

export interface TicketPriorityQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export class TicketPriorities {
  private readonly endpoint = '/TicketPriorities';

  constructor(private axios: AxiosInstance, private logger: winston.Logger) {}

  static getMetadata(): MethodMetadata[] {
    return [
      {
        operation: 'createTicketPriority',
        requiredParams: ['ticketPriority'],
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
        requiredParams: ['id', 'ticketPriority'],
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

  private async requestWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
    let attempt = 0;
    while (true) {
      try {
        return await fn();
      } catch (err) {
        attempt++;
        this.logger.warn(`Request failed (attempt ${attempt}): ${err}`);
        if (attempt > retries) throw err;
        await new Promise(res => setTimeout(res, delay * Math.pow(2, attempt - 1)));
      }
    }
  }

  async create(ticketPriority: TicketPriority): Promise<ApiResponse<TicketPriority>> {
    this.logger.info('Creating ticket priority', { ticketPriority });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.post(this.endpoint, ticketPriority);
      return { data };
    });
  }

  async get(id: number): Promise<ApiResponse<TicketPriority>> {
    this.logger.info('Getting ticket priority', { id });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.get(`${this.endpoint}/${id}`);
      return { data };
    });
  }

  async update(id: number, ticketPriority: Partial<TicketPriority>): Promise<ApiResponse<TicketPriority>> {
    this.logger.info('Updating ticket priority', { id, ticketPriority });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.put(`${this.endpoint}/${id}`, ticketPriority);
      return { data };
    });
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting ticket priority', { id });
    return this.requestWithRetry(async () => {
      await this.axios.delete(`${this.endpoint}/${id}`);
    });
  }

  async list(query: TicketPriorityQuery = {}): Promise<ApiResponse<TicketPriority[]>> {
    this.logger.info('Listing ticket priorities', { query });
    const params: Record<string, any> = {};
    if (query.filter) params['search'] = JSON.stringify(query.filter);
    if (query.sort) params['sort'] = query.sort;
    if (query.page) params['page'] = query.page;
    if (query.pageSize) params['pageSize'] = query.pageSize;
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.get(this.endpoint, { params });
      return { data };
    });
  }
} 