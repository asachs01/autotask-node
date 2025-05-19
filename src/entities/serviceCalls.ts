import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse } from '../types';

export interface ServiceCall {
  id?: number;
  ticketId?: number;
  [key: string]: any;
}

export interface ServiceCallQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export class ServiceCalls {
  private readonly endpoint = '/ServiceCalls';

  constructor(private axios: AxiosInstance, private logger: winston.Logger) {}

  static getMetadata(): MethodMetadata[] {
    return [
      {
        operation: 'createServiceCall',
        requiredParams: ['serviceCall'],
        optionalParams: [],
        returnType: 'ServiceCall',
        endpoint: '/ServiceCalls',
      },
      {
        operation: 'getServiceCall',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ServiceCall',
        endpoint: '/ServiceCalls/{id}',
      },
      {
        operation: 'updateServiceCall',
        requiredParams: ['id', 'serviceCall'],
        optionalParams: [],
        returnType: 'ServiceCall',
        endpoint: '/ServiceCalls/{id}',
      },
      {
        operation: 'deleteServiceCall',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ServiceCalls/{id}',
      },
      {
        operation: 'listServiceCalls',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ServiceCall[]',
        endpoint: '/ServiceCalls',
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

  async create(serviceCall: ServiceCall): Promise<ApiResponse<ServiceCall>> {
    this.logger.info('Creating service call', { serviceCall });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.post(this.endpoint, serviceCall);
      return { data };
    });
  }

  async get(id: number): Promise<ApiResponse<ServiceCall>> {
    this.logger.info('Getting service call', { id });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.get(`${this.endpoint}/${id}`);
      return { data };
    });
  }

  async update(id: number, serviceCall: Partial<ServiceCall>): Promise<ApiResponse<ServiceCall>> {
    this.logger.info('Updating service call', { id, serviceCall });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.put(`${this.endpoint}/${id}`, serviceCall);
      return { data };
    });
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting service call', { id });
    return this.requestWithRetry(async () => {
      await this.axios.delete(`${this.endpoint}/${id}`);
    });
  }

  async list(query: ServiceCallQuery = {}): Promise<ApiResponse<ServiceCall[]>> {
    this.logger.info('Listing service calls', { query });
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