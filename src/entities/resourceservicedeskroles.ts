import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IResourceServiceDeskRoles {
  id?: number;
  [key: string]: any;
}

export interface IResourceServiceDeskRolesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ResourceServiceDeskRoles entity class for Autotask API
 * 
 * Service desk role assignments for resources
 * Supported Operations: GET, POST, DELETE
 * Category: lookup
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourceServiceDeskRolesEntity.htm}
 */
export class ResourceServiceDeskRoles extends BaseEntity {
  private readonly endpoint = '/ResourceServiceDeskRoles';

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
        operation: 'createResourceServiceDeskRoles',
        requiredParams: ['resourceServiceDeskRoles'],
        optionalParams: [],
        returnType: 'IResourceServiceDeskRoles',
        endpoint: '/ResourceServiceDeskRoles',
      },
      {
        operation: 'getResourceServiceDeskRoles',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IResourceServiceDeskRoles',
        endpoint: '/ResourceServiceDeskRoles/{id}',
      },
      {
        operation: 'deleteResourceServiceDeskRoles',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ResourceServiceDeskRoles/{id}',
      },
      {
        operation: 'listResourceServiceDeskRoles',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IResourceServiceDeskRoles[]',
        endpoint: '/ResourceServiceDeskRoles',
      }
    ];
  }

  /**
   * Create a new resourceservicedeskroles
   * @param resourceServiceDeskRoles - The resourceservicedeskroles data to create
   * @returns Promise with the created resourceservicedeskroles
   */
  async create(resourceServiceDeskRoles: IResourceServiceDeskRoles): Promise<ApiResponse<IResourceServiceDeskRoles>> {
    this.logger.info('Creating resourceservicedeskroles', { resourceServiceDeskRoles });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, resourceServiceDeskRoles),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a resourceservicedeskroles by ID
   * @param id - The resourceservicedeskroles ID
   * @returns Promise with the resourceservicedeskroles data
   */
  async get(id: number): Promise<ApiResponse<IResourceServiceDeskRoles>> {
    this.logger.info('Getting resourceservicedeskroles', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a resourceservicedeskroles
   * @param id - The resourceservicedeskroles ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting resourceservicedeskroles', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List resourceservicedeskroles with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of resourceservicedeskroles
   */
  async list(query: IResourceServiceDeskRolesQuery = {}): Promise<ApiResponse<IResourceServiceDeskRoles[]>> {
    this.logger.info('Listing resourceservicedeskroles', { query });
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