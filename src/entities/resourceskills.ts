import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IResourceSkills {
  id?: number;
  [key: string]: any;
}

export interface IResourceSkillsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ResourceSkills entity class for Autotask API
 * 
 * Skills associated with resources
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: lookup
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourceSkillsEntity.htm}
 */
export class ResourceSkills extends BaseEntity {
  private readonly endpoint = '/ResourceSkills';

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
        operation: 'createResourceSkills',
        requiredParams: ['resourceSkills'],
        optionalParams: [],
        returnType: 'IResourceSkills',
        endpoint: '/ResourceSkills',
      },
      {
        operation: 'getResourceSkills',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IResourceSkills',
        endpoint: '/ResourceSkills/{id}',
      },
      {
        operation: 'updateResourceSkills',
        requiredParams: ['id', 'resourceSkills'],
        optionalParams: [],
        returnType: 'IResourceSkills',
        endpoint: '/ResourceSkills/{id}',
      },
      {
        operation: 'deleteResourceSkills',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ResourceSkills/{id}',
      },
      {
        operation: 'listResourceSkills',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IResourceSkills[]',
        endpoint: '/ResourceSkills',
      }
    ];
  }

  /**
   * Create a new resourceskills
   * @param resourceSkills - The resourceskills data to create
   * @returns Promise with the created resourceskills
   */
  async create(resourceSkills: IResourceSkills): Promise<ApiResponse<IResourceSkills>> {
    this.logger.info('Creating resourceskills', { resourceSkills });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, resourceSkills),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a resourceskills by ID
   * @param id - The resourceskills ID
   * @returns Promise with the resourceskills data
   */
  async get(id: number): Promise<ApiResponse<IResourceSkills>> {
    this.logger.info('Getting resourceskills', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a resourceskills
   * @param id - The resourceskills ID
   * @param resourceSkills - The updated resourceskills data
   * @returns Promise with the updated resourceskills
   */
  async update(
    id: number,
    resourceSkills: Partial<IResourceSkills>
  ): Promise<ApiResponse<IResourceSkills>> {
    this.logger.info('Updating resourceskills', { id, resourceSkills });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, resourceSkills),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a resourceskills
   * @param id - The resourceskills ID
   * @param resourceSkills - The partial resourceskills data to update
   * @returns Promise with the updated resourceskills
   */
  async patch(
    id: number,
    resourceSkills: Partial<IResourceSkills>
  ): Promise<ApiResponse<IResourceSkills>> {
    this.logger.info('Patching resourceskills', { id, resourceSkills });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, resourceSkills),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a resourceskills
   * @param id - The resourceskills ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting resourceskills', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List resourceskills with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of resourceskills
   */
  async list(query: IResourceSkillsQuery = {}): Promise<ApiResponse<IResourceSkills[]>> {
    this.logger.info('Listing resourceskills', { query });
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