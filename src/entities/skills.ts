import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ISkills {
  id?: number;
  [key: string]: any;
}

export interface ISkillsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Skills entity class for Autotask API
 * 
 * Available skills for resource assignment
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: lookup
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/SkillsEntity.htm}
 */
export class Skills extends BaseEntity {
  private readonly endpoint = '/Skills';

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
        operation: 'createSkills',
        requiredParams: ['skills'],
        optionalParams: [],
        returnType: 'ISkills',
        endpoint: '/Skills',
      },
      {
        operation: 'getSkills',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ISkills',
        endpoint: '/Skills/{id}',
      },
      {
        operation: 'updateSkills',
        requiredParams: ['id', 'skills'],
        optionalParams: [],
        returnType: 'ISkills',
        endpoint: '/Skills/{id}',
      },
      {
        operation: 'deleteSkills',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/Skills/{id}',
      },
      {
        operation: 'listSkills',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ISkills[]',
        endpoint: '/Skills',
      }
    ];
  }

  /**
   * Create a new skills
   * @param skills - The skills data to create
   * @returns Promise with the created skills
   */
  async create(skills: ISkills): Promise<ApiResponse<ISkills>> {
    this.logger.info('Creating skills', { skills });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, skills),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a skills by ID
   * @param id - The skills ID
   * @returns Promise with the skills data
   */
  async get(id: number): Promise<ApiResponse<ISkills>> {
    this.logger.info('Getting skills', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a skills
   * @param id - The skills ID
   * @param skills - The updated skills data
   * @returns Promise with the updated skills
   */
  async update(
    id: number,
    skills: Partial<ISkills>
  ): Promise<ApiResponse<ISkills>> {
    this.logger.info('Updating skills', { id, skills });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, skills),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a skills
   * @param id - The skills ID
   * @param skills - The partial skills data to update
   * @returns Promise with the updated skills
   */
  async patch(
    id: number,
    skills: Partial<ISkills>
  ): Promise<ApiResponse<ISkills>> {
    this.logger.info('Patching skills', { id, skills });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, skills),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a skills
   * @param id - The skills ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting skills', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List skills with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of skills
   */
  async list(query: ISkillsQuery = {}): Promise<ApiResponse<ISkills[]>> {
    this.logger.info('Listing skills', { query });
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
    if (query.pageSize) searchBody.maxRecords = query.pageSize;

    return this.executeQueryRequest(
      async () => this.axios.post(`${this.endpoint}/query`, searchBody),
      `${this.endpoint}/query`,
      'POST'
    );
  }
}