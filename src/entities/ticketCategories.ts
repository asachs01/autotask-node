import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse } from '../types';

export interface TicketCategory {
  id?: number;
  name?: string;
  description?: string;
  isActive?: boolean;
  displayColorRGB?: number;
  globalDefault?: boolean;
  nickName?: string;
  [key: string]: any;
}

export interface TicketCategoryQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export class TicketCategories {
  private readonly endpoint = '/TicketCategories';

  constructor(private axios: AxiosInstance, private logger: winston.Logger) {}

  static getMetadata(): MethodMetadata[] {
    return [
      {
        operation: 'createTicketCategory',
        requiredParams: ['ticketCategory'],
        optionalParams: [],
        returnType: 'TicketCategory',
        endpoint: '/TicketCategories',
      },
      {
        operation: 'getTicketCategory',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'TicketCategory',
        endpoint: '/TicketCategories/{id}',
      },
      {
        operation: 'updateTicketCategory',
        requiredParams: ['id', 'ticketCategory'],
        optionalParams: [],
        returnType: 'TicketCategory',
        endpoint: '/TicketCategories/{id}',
      },
      {
        operation: 'deleteTicketCategory',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/TicketCategories/{id}',
      },
      {
        operation: 'listTicketCategories',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'TicketCategory[]',
        endpoint: '/TicketCategories',
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

  async create(ticketCategory: TicketCategory): Promise<ApiResponse<TicketCategory>> {
    this.logger.info('Creating ticket category', { ticketCategory });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.post(this.endpoint, ticketCategory);
      return { data };
    });
  }

  async get(id: number): Promise<ApiResponse<TicketCategory>> {
    this.logger.info('Getting ticket category', { id });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.get(`${this.endpoint}/${id}`);
      return { data };
    });
  }

  async update(id: number, ticketCategory: Partial<TicketCategory>): Promise<ApiResponse<TicketCategory>> {
    this.logger.info('Updating ticket category', { id, ticketCategory });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.put(`${this.endpoint}/${id}`, ticketCategory);
      return { data };
    });
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting ticket category', { id });
    return this.requestWithRetry(async () => {
      await this.axios.delete(`${this.endpoint}/${id}`);
    });
  }

  async list(query: TicketCategoryQuery = {}): Promise<ApiResponse<TicketCategory[]>> {
    this.logger.info('Listing ticket categories', { query });
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