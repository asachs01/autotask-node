import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IProjects {
  id?: number;
  [key: string]: any;
}

export interface IProjectsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Projects entity class for Autotask API
 *
 * Client projects and work orders
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: core
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ProjectsEntity.htm}
 */
export class Projects extends BaseEntity {
  private readonly endpoint = '/Projects';

  constructor(
    axios: AxiosInstance,
    logger: winston.Logger,
    requestHandler?: RequestHandler
  ) {
    super(axios, logger, requestHandler);
  }

  static getMetadata(): MethodMetadata[] {
    return [
      {
        operation: 'createProjects',
        requiredParams: ['projects'],
        optionalParams: [],
        returnType: 'IProjects',
        endpoint: '/Projects',
      },
      {
        operation: 'getProjects',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IProjects',
        endpoint: '/Projects/{id}',
      },
      {
        operation: 'updateProjects',
        requiredParams: ['id', 'projects'],
        optionalParams: [],
        returnType: 'IProjects',
        endpoint: '/Projects/{id}',
      },
      {
        operation: 'listProjects',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IProjects[]',
        endpoint: '/Projects',
      },
    ];
  }

  /**
   * Create a new projects
   * @param projects - The projects data to create
   * @returns Promise with the created projects
   */
  async create(projects: IProjects): Promise<ApiResponse<IProjects>> {
    this.logger.info('Creating projects', { projects });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, projects),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a projects by ID
   * @param id - The projects ID
   * @returns Promise with the projects data
   */
  async get(id: number): Promise<ApiResponse<IProjects>> {
    this.logger.info('Getting projects', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a projects
   * @param id - The projects ID
   * @param projects - The updated projects data
   * @returns Promise with the updated projects
   */
  async update(
    id: number,
    projects: Partial<IProjects>
  ): Promise<ApiResponse<IProjects>> {
    this.logger.info('Updating projects', { id, projects });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, projects),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a projects
   * @param id - The projects ID
   * @param projects - The partial projects data to update
   * @returns Promise with the updated projects
   */
  async patch(
    id: number,
    projects: Partial<IProjects>
  ): Promise<ApiResponse<IProjects>> {
    this.logger.info('Patching projects', { id, projects });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, projects),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * List projects with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of projects
   */
  async list(query: IProjectsQuery = {}): Promise<ApiResponse<IProjects[]>> {
    this.logger.info('Listing projects', { query });
    const searchBody: Record<string, any> = {};

    // Set up basic filter if none provided
    if (!query.filter || Object.keys(query.filter).length === 0) {
      searchBody.filter = [
        {
          op: 'gte',
          field: 'id',
          value: 0,
        },
      ];
    } else {
      // Convert object filter to array format
      if (!Array.isArray(query.filter)) {
        const filterArray = [];
        for (const [field, value] of Object.entries(query.filter)) {
          filterArray.push({
            op: 'eq',
            field: field,
            value: value,
          });
        }
        searchBody.filter = filterArray;
      } else {
        searchBody.filter = query.filter;
      }
    }

    if (query.sort) searchBody.sort = query.sort;
    if (query.page) searchBody.page = query.page;
    if (query.pageSize) searchBody.pageSize = query.pageSize;

    return this.executeQueryRequest(
      async () =>
        this.axios.get(`${this.endpoint}/query`, { params: searchBody }),
      `${this.endpoint}/query`,
      'GET'
    );
  }
}
