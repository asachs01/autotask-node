import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IComanagedAssociations {
  id?: number;
  [key: string]: any;
}

export interface IComanagedAssociationsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ComanagedAssociations entity class for Autotask API
 * 
 * Co-managed service associations
 * Supported Operations: GET, POST, DELETE
 * Category: associations
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ComanagedAssociationsEntity.htm}
 */
export class ComanagedAssociations extends BaseEntity {
  private readonly endpoint = '/ComanagedAssociations';

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
        operation: 'createComanagedAssociations',
        requiredParams: ['comanagedAssociations'],
        optionalParams: [],
        returnType: 'IComanagedAssociations',
        endpoint: '/ComanagedAssociations',
      },
      {
        operation: 'getComanagedAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IComanagedAssociations',
        endpoint: '/ComanagedAssociations/{id}',
      },
      {
        operation: 'deleteComanagedAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ComanagedAssociations/{id}',
      },
      {
        operation: 'listComanagedAssociations',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IComanagedAssociations[]',
        endpoint: '/ComanagedAssociations',
      }
    ];
  }

  /**
   * Create a new comanagedassociations
   * @param comanagedAssociations - The comanagedassociations data to create
   * @returns Promise with the created comanagedassociations
   */
  async create(comanagedAssociations: IComanagedAssociations): Promise<ApiResponse<IComanagedAssociations>> {
    this.logger.info('Creating comanagedassociations', { comanagedAssociations });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, comanagedAssociations),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a comanagedassociations by ID
   * @param id - The comanagedassociations ID
   * @returns Promise with the comanagedassociations data
   */
  async get(id: number): Promise<ApiResponse<IComanagedAssociations>> {
    this.logger.info('Getting comanagedassociations', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a comanagedassociations
   * @param id - The comanagedassociations ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting comanagedassociations', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List comanagedassociations with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of comanagedassociations
   */
  async list(query: IComanagedAssociationsQuery = {}): Promise<ApiResponse<IComanagedAssociations[]>> {
    this.logger.info('Listing comanagedassociations', { query });
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
      async () => this.axios.get(`${this.endpoint}/query`, { params: searchBody }),
      `${this.endpoint}/query`,
      'GET'
    );
  }
}