import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IProjectCharges {
  id?: number;
  [key: string]: any;
}

export interface IProjectChargesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ProjectCharges entity class for Autotask API
 * 
 * Charges associated with projects
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: tasks
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ProjectChargesEntity.htm}
 */
export class ProjectCharges extends BaseEntity {
  private readonly endpoint = '/ProjectCharges';

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
        operation: 'createProjectCharges',
        requiredParams: ['projectCharges'],
        optionalParams: [],
        returnType: 'IProjectCharges',
        endpoint: '/ProjectCharges',
      },
      {
        operation: 'getProjectCharges',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IProjectCharges',
        endpoint: '/ProjectCharges/{id}',
      },
      {
        operation: 'updateProjectCharges',
        requiredParams: ['id', 'projectCharges'],
        optionalParams: [],
        returnType: 'IProjectCharges',
        endpoint: '/ProjectCharges/{id}',
      },
      {
        operation: 'deleteProjectCharges',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ProjectCharges/{id}',
      },
      {
        operation: 'listProjectCharges',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IProjectCharges[]',
        endpoint: '/ProjectCharges',
      }
    ];
  }

  /**
   * Create a new projectcharges
   * @param projectCharges - The projectcharges data to create
   * @returns Promise with the created projectcharges
   */
  async create(projectCharges: IProjectCharges): Promise<ApiResponse<IProjectCharges>> {
    this.logger.info('Creating projectcharges', { projectCharges });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, projectCharges),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a projectcharges by ID
   * @param id - The projectcharges ID
   * @returns Promise with the projectcharges data
   */
  async get(id: number): Promise<ApiResponse<IProjectCharges>> {
    this.logger.info('Getting projectcharges', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a projectcharges
   * @param id - The projectcharges ID
   * @param projectCharges - The updated projectcharges data
   * @returns Promise with the updated projectcharges
   */
  async update(
    id: number,
    projectCharges: Partial<IProjectCharges>
  ): Promise<ApiResponse<IProjectCharges>> {
    this.logger.info('Updating projectcharges', { id, projectCharges });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, projectCharges),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a projectcharges
   * @param id - The projectcharges ID
   * @param projectCharges - The partial projectcharges data to update
   * @returns Promise with the updated projectcharges
   */
  async patch(
    id: number,
    projectCharges: Partial<IProjectCharges>
  ): Promise<ApiResponse<IProjectCharges>> {
    this.logger.info('Patching projectcharges', { id, projectCharges });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, projectCharges),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a projectcharges
   * @param id - The projectcharges ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting projectcharges', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List projectcharges with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of projectcharges
   */
  async list(query: IProjectChargesQuery = {}): Promise<ApiResponse<IProjectCharges[]>> {
    this.logger.info('Listing projectcharges', { query });
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
          // Handle nested objects like { id: { gte: 0 } }
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // Extract operator and value from nested object
            const [op, val] = Object.entries(value)[0] as [string, any];
            filterArray.push({
              op: op,
              field: field,
              value: val,
            });
          } else {
            filterArray.push({
              op: 'eq',
              field: field,
              value: value,
            });
          }
        }
        searchBody.filter = filterArray;
      } else {
        searchBody.filter = query.filter;
      }
    }

    if (query.sort) searchBody.sort = query.sort;
    if (query.page) searchBody.page = query.page;
    if (query.pageSize) searchBody.MaxRecords = query.pageSize;

    return this.executeQueryRequest(
      async () => this.axios.post(`${this.endpoint}/query`, searchBody),
      `${this.endpoint}/query`,
      'POST'
    );
  }
}