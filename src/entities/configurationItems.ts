import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse } from '../types';

export interface ConfigurationItem {
  id?: number;
  accountId?: number;
  name?: string;
  [key: string]: any;
}

export interface ConfigurationItemQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export class ConfigurationItems {
  private readonly endpoint = '/ConfigurationItems';

  constructor(private axios: AxiosInstance, private logger: winston.Logger) {}

  static getMetadata(): MethodMetadata[] {
    return [
      {
        operation: 'createConfigurationItem',
        requiredParams: ['configurationItem'],
        optionalParams: [],
        returnType: 'ConfigurationItem',
        endpoint: '/ConfigurationItems',
      },
      {
        operation: 'getConfigurationItem',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ConfigurationItem',
        endpoint: '/ConfigurationItems/{id}',
      },
      {
        operation: 'updateConfigurationItem',
        requiredParams: ['id', 'configurationItem'],
        optionalParams: [],
        returnType: 'ConfigurationItem',
        endpoint: '/ConfigurationItems/{id}',
      },
      {
        operation: 'deleteConfigurationItem',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ConfigurationItems/{id}',
      },
      {
        operation: 'listConfigurationItems',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ConfigurationItem[]',
        endpoint: '/ConfigurationItems',
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

  async create(configurationItem: ConfigurationItem): Promise<ApiResponse<ConfigurationItem>> {
    this.logger.info('Creating configuration item', { configurationItem });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.post(this.endpoint, configurationItem);
      return { data };
    });
  }

  async get(id: number): Promise<ApiResponse<ConfigurationItem>> {
    this.logger.info('Getting configuration item', { id });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.get(`${this.endpoint}/${id}`);
      return { data };
    });
  }

  async update(id: number, configurationItem: Partial<ConfigurationItem>): Promise<ApiResponse<ConfigurationItem>> {
    this.logger.info('Updating configuration item', { id, configurationItem });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.put(`${this.endpoint}/${id}`, configurationItem);
      return { data };
    });
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting configuration item', { id });
    return this.requestWithRetry(async () => {
      await this.axios.delete(`${this.endpoint}/${id}`);
    });
  }

  async list(query: ConfigurationItemQuery = {}): Promise<ApiResponse<ConfigurationItem[]>> {
    this.logger.info('Listing configuration items', { query });
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