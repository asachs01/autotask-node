import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse } from '../types';

export interface Resource {
  id?: number;
  name?: string;
  email?: string;
  [key: string]: any;
}

export interface ResourceQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export class Resources {
  private readonly endpoint = '/Resources';

  constructor(private axios: AxiosInstance, private logger: winston.Logger) {}

  static getMetadata(): MethodMetadata[] {
    return [
      {
        operation: 'createResource',
        requiredParams: ['resource'],
        optionalParams: [],
        returnType: 'Resource',
        endpoint: '/Resources',
      },
      {
        operation: 'getResource',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'Resource',
        endpoint: '/Resources/{id}',
      },
      {
        operation: 'updateResource',
        requiredParams: ['id', 'resource'],
        optionalParams: [],
        returnType: 'Resource',
        endpoint: '/Resources/{id}',
      },
      {
        operation: 'deleteResource',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/Resources/{id}',
      },
      {
        operation: 'listResources',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'Resource[]',
        endpoint: '/Resources',
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

  async create(resource: Resource): Promise<ApiResponse<Resource>> {
    this.logger.info('Creating resource', { resource });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.post(this.endpoint, resource);
      return { data };
    });
  }

  async get(id: number): Promise<ApiResponse<Resource>> {
    this.logger.info('Getting resource', { id });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.get(`${this.endpoint}/${id}`);
      return { data };
    });
  }

  async update(id: number, resource: Partial<Resource>): Promise<ApiResponse<Resource>> {
    this.logger.info('Updating resource', { id, resource });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.put(`${this.endpoint}/${id}`, resource);
      return { data };
    });
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting resource', { id });
    return this.requestWithRetry(async () => {
      await this.axios.delete(`${this.endpoint}/${id}`);
    });
  }

  async list(query: ResourceQuery = {}): Promise<ApiResponse<Resource[]>> {
    this.logger.info('Listing resources', { query });
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