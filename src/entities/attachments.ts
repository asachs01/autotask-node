import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse } from '../types';

export interface Attachment {
  id?: number;
  parentId?: number;
  fileName?: string;
  contentType?: string;
  [key: string]: any;
}

export interface AttachmentQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export class Attachments {
  private readonly endpoint = '/Attachments';

  constructor(private axios: AxiosInstance, private logger: winston.Logger) {}

  static getMetadata(): MethodMetadata[] {
    return [
      {
        operation: 'createAttachment',
        requiredParams: ['attachment'],
        optionalParams: [],
        returnType: 'Attachment',
        endpoint: '/Attachments',
      },
      {
        operation: 'getAttachment',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'Attachment',
        endpoint: '/Attachments/{id}',
      },
      {
        operation: 'updateAttachment',
        requiredParams: ['id', 'attachment'],
        optionalParams: [],
        returnType: 'Attachment',
        endpoint: '/Attachments/{id}',
      },
      {
        operation: 'deleteAttachment',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/Attachments/{id}',
      },
      {
        operation: 'listAttachments',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'Attachment[]',
        endpoint: '/Attachments',
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

  async create(attachment: Attachment): Promise<ApiResponse<Attachment>> {
    this.logger.info('Creating attachment', { attachment });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.post(this.endpoint, attachment);
      return { data };
    });
  }

  async get(id: number): Promise<ApiResponse<Attachment>> {
    this.logger.info('Getting attachment', { id });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.get(`${this.endpoint}/${id}`);
      return { data };
    });
  }

  async update(id: number, attachment: Partial<Attachment>): Promise<ApiResponse<Attachment>> {
    this.logger.info('Updating attachment', { id, attachment });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.put(`${this.endpoint}/${id}`, attachment);
      return { data };
    });
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting attachment', { id });
    return this.requestWithRetry(async () => {
      await this.axios.delete(`${this.endpoint}/${id}`);
    });
  }

  async list(query: AttachmentQuery = {}): Promise<ApiResponse<Attachment[]>> {
    this.logger.info('Listing attachments', { query });
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