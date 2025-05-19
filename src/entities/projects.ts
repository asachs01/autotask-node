import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse } from '../types';

export interface Project {
  id?: number;
  accountId?: number;
  name?: string;
  status?: string;
  [key: string]: any;
}

export interface ProjectQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export class Projects {
  private readonly endpoint = '/Projects';

  constructor(private axios: AxiosInstance, private logger: winston.Logger) {}

  static getMetadata(): MethodMetadata[] {
    return [
      {
        operation: 'createProject',
        requiredParams: ['project'],
        optionalParams: [],
        returnType: 'Project',
        endpoint: '/Projects',
      },
      {
        operation: 'getProject',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'Project',
        endpoint: '/Projects/{id}',
      },
      {
        operation: 'updateProject',
        requiredParams: ['id', 'project'],
        optionalParams: [],
        returnType: 'Project',
        endpoint: '/Projects/{id}',
      },
      {
        operation: 'deleteProject',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/Projects/{id}',
      },
      {
        operation: 'listProjects',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'Project[]',
        endpoint: '/Projects',
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

  async create(project: Project): Promise<ApiResponse<Project>> {
    this.logger.info('Creating project', { project });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.post(this.endpoint, project);
      return { data };
    });
  }

  async get(id: number): Promise<ApiResponse<Project>> {
    this.logger.info('Getting project', { id });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.get(`${this.endpoint}/${id}`);
      return { data };
    });
  }

  async update(id: number, project: Partial<Project>): Promise<ApiResponse<Project>> {
    this.logger.info('Updating project', { id, project });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.put(`${this.endpoint}/${id}`, project);
      return { data };
    });
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting project', { id });
    return this.requestWithRetry(async () => {
      await this.axios.delete(`${this.endpoint}/${id}`);
    });
  }

  async list(query: ProjectQuery = {}): Promise<ApiResponse<Project[]>> {
    this.logger.info('Listing projects', { query });
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