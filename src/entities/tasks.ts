import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse } from '../types';

export interface Task {
  id?: number;
  projectId?: number;
  title?: string;
  status?: string;
  [key: string]: any;
}

export interface TaskQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export class Tasks {
  private readonly endpoint = '/Tasks';

  constructor(private axios: AxiosInstance, private logger: winston.Logger) {}

  static getMetadata(): MethodMetadata[] {
    return [
      {
        operation: 'createTask',
        requiredParams: ['task'],
        optionalParams: [],
        returnType: 'Task',
        endpoint: '/Tasks',
      },
      {
        operation: 'getTask',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'Task',
        endpoint: '/Tasks/{id}',
      },
      {
        operation: 'updateTask',
        requiredParams: ['id', 'task'],
        optionalParams: [],
        returnType: 'Task',
        endpoint: '/Tasks/{id}',
      },
      {
        operation: 'deleteTask',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/Tasks/{id}',
      },
      {
        operation: 'listTasks',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'Task[]',
        endpoint: '/Tasks',
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

  async create(task: Task): Promise<ApiResponse<Task>> {
    this.logger.info('Creating task', { task });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.post(this.endpoint, task);
      return { data };
    });
  }

  async get(id: number): Promise<ApiResponse<Task>> {
    this.logger.info('Getting task', { id });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.get(`${this.endpoint}/${id}`);
      return { data };
    });
  }

  async update(id: number, task: Partial<Task>): Promise<ApiResponse<Task>> {
    this.logger.info('Updating task', { id, task });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.put(`${this.endpoint}/${id}`, task);
      return { data };
    });
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting task', { id });
    return this.requestWithRetry(async () => {
      await this.axios.delete(`${this.endpoint}/${id}`);
    });
  }

  async list(query: TaskQuery = {}): Promise<ApiResponse<Task[]>> {
    this.logger.info('Listing tasks', { query });
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