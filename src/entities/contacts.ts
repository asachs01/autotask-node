import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse } from '../types';

export interface Contact {
  id?: number;
  accountId?: number;
  name?: string;
  email?: string;
  [key: string]: any;
}

export interface ContactQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export class Contacts {
  private readonly endpoint = '/Contacts';

  constructor(private axios: AxiosInstance, private logger: winston.Logger) {}

  static getMetadata(): MethodMetadata[] {
    return [
      {
        operation: 'createContact',
        requiredParams: ['contact'],
        optionalParams: [],
        returnType: 'Contact',
        endpoint: '/Contacts',
      },
      {
        operation: 'getContact',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'Contact',
        endpoint: '/Contacts/{id}',
      },
      {
        operation: 'updateContact',
        requiredParams: ['id', 'contact'],
        optionalParams: [],
        returnType: 'Contact',
        endpoint: '/Contacts/{id}',
      },
      {
        operation: 'deleteContact',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/Contacts/{id}',
      },
      {
        operation: 'listContacts',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'Contact[]',
        endpoint: '/Contacts',
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

  async create(contact: Contact): Promise<ApiResponse<Contact>> {
    this.logger.info('Creating contact', { contact });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.post(this.endpoint, contact);
      return { data };
    });
  }

  async get(id: number): Promise<ApiResponse<Contact>> {
    this.logger.info('Getting contact', { id });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.get(`${this.endpoint}/${id}`);
      return { data };
    });
  }

  async update(id: number, contact: Partial<Contact>): Promise<ApiResponse<Contact>> {
    this.logger.info('Updating contact', { id, contact });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.put(`${this.endpoint}/${id}`, contact);
      return { data };
    });
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contact', { id });
    return this.requestWithRetry(async () => {
      await this.axios.delete(`${this.endpoint}/${id}`);
    });
  }

  async list(query: ContactQuery = {}): Promise<ApiResponse<Contact[]>> {
    this.logger.info('Listing contacts', { query });
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