import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse } from '../types';

export interface TimeEntry {
  id?: number;
  resourceID?: number;
  ticketID?: number;
  taskID?: number;
  projectID?: number;
  startDateTime?: string;
  endDateTime?: string;
  hoursWorked?: number;
  hoursToBill?: number;
  type?: number;
  [key: string]: any;
}

export interface TimeEntryQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export class TimeEntries {
  private readonly endpoint = '/TimeEntries';

  constructor(private axios: AxiosInstance, private logger: winston.Logger) {}

  static getMetadata(): MethodMetadata[] {
    return [
      {
        operation: 'createTimeEntry',
        requiredParams: ['timeEntry'],
        optionalParams: [],
        returnType: 'TimeEntry',
        endpoint: '/TimeEntries',
      },
      {
        operation: 'getTimeEntry',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'TimeEntry',
        endpoint: '/TimeEntries/{id}',
      },
      {
        operation: 'updateTimeEntry',
        requiredParams: ['id', 'timeEntry'],
        optionalParams: [],
        returnType: 'TimeEntry',
        endpoint: '/TimeEntries/{id}',
      },
      {
        operation: 'deleteTimeEntry',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/TimeEntries/{id}',
      },
      {
        operation: 'listTimeEntries',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'TimeEntry[]',
        endpoint: '/TimeEntries',
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

  async create(timeEntry: TimeEntry): Promise<ApiResponse<TimeEntry>> {
    this.logger.info('Creating time entry', { timeEntry });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.post(this.endpoint, timeEntry);
      return { data };
    });
  }

  async get(id: number): Promise<ApiResponse<TimeEntry>> {
    this.logger.info('Getting time entry', { id });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.get(`${this.endpoint}/${id}`);
      return { data };
    });
  }

  async update(id: number, timeEntry: Partial<TimeEntry>): Promise<ApiResponse<TimeEntry>> {
    this.logger.info('Updating time entry', { id, timeEntry });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.put(`${this.endpoint}/${id}`, timeEntry);
      return { data };
    });
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting time entry', { id });
    return this.requestWithRetry(async () => {
      await this.axios.delete(`${this.endpoint}/${id}`);
    });
  }

  async list(query: TimeEntryQuery = {}): Promise<ApiResponse<TimeEntry[]>> {
    this.logger.info('Listing time entries', { query });
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