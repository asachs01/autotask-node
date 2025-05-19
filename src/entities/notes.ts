import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse } from '../types';

export interface Note {
  id?: number;
  ticketId?: number;
  title?: string;
  description?: string;
  [key: string]: any;
}

export interface NoteQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export class Notes {
  private readonly endpoint = '/Notes';

  constructor(private axios: AxiosInstance, private logger: winston.Logger) {}

  static getMetadata(): MethodMetadata[] {
    return [
      {
        operation: 'createNote',
        requiredParams: ['note'],
        optionalParams: [],
        returnType: 'Note',
        endpoint: '/Notes',
      },
      {
        operation: 'getNote',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'Note',
        endpoint: '/Notes/{id}',
      },
      {
        operation: 'updateNote',
        requiredParams: ['id', 'note'],
        optionalParams: [],
        returnType: 'Note',
        endpoint: '/Notes/{id}',
      },
      {
        operation: 'deleteNote',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/Notes/{id}',
      },
      {
        operation: 'listNotes',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'Note[]',
        endpoint: '/Notes',
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

  async create(note: Note): Promise<ApiResponse<Note>> {
    this.logger.info('Creating note', { note });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.post(this.endpoint, note);
      return { data };
    });
  }

  async get(id: number): Promise<ApiResponse<Note>> {
    this.logger.info('Getting note', { id });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.get(`${this.endpoint}/${id}`);
      return { data };
    });
  }

  async update(id: number, note: Partial<Note>): Promise<ApiResponse<Note>> {
    this.logger.info('Updating note', { id, note });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.put(`${this.endpoint}/${id}`, note);
      return { data };
    });
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting note', { id });
    return this.requestWithRetry(async () => {
      await this.axios.delete(`${this.endpoint}/${id}`);
    });
  }

  async list(query: NoteQuery = {}): Promise<ApiResponse<Note[]>> {
    this.logger.info('Listing notes', { query });
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