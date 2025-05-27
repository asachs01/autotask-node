import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse } from '../types';

export interface TicketSource {
  id?: number;
  name?: string;
  description?: string;
  isActive?: boolean;
  isDefaultValue?: boolean;
  isSystemValue?: boolean;
  label?: string;
  sortOrder?: number;
  [key: string]: any;
}

export interface TicketSourceQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export class TicketSources {
  private readonly endpoint = '/TicketSources';

  constructor(private axios: AxiosInstance, private logger: winston.Logger) {}

  static getMetadata(): MethodMetadata[] {
    return [
      {
        operation: 'createTicketSource',
        requiredParams: ['ticketSource'],
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
        requiredParams: ['id', 'ticketSource'],
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

  async create(ticketSource: TicketSource): Promise<ApiResponse<TicketSource>> {
    this.logger.info('Creating ticket source', { ticketSource });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.post(this.endpoint, ticketSource);
      return { data };
    });
  }

  async get(id: number): Promise<ApiResponse<TicketSource>> {
    this.logger.info('Getting ticket source', { id });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.get(`${this.endpoint}/${id}`);
      return { data };
    });
  }

  async update(id: number, ticketSource: Partial<TicketSource>): Promise<ApiResponse<TicketSource>> {
    this.logger.info('Updating ticket source', { id, ticketSource });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.put(`${this.endpoint}/${id}`, ticketSource);
      return { data };
    });
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting ticket source', { id });
    return this.requestWithRetry(async () => {
      await this.axios.delete(`${this.endpoint}/${id}`);
    });
  }

  async list(query: TicketSourceQuery = {}): Promise<ApiResponse<TicketSource[]>> {
    this.logger.info('Listing ticket sources', { query });
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