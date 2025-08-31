import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IClientPortalUsers {
  id?: number;
  [key: string]: any;
}

export interface IClientPortalUsersQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ClientPortalUsers entity class for Autotask API
 * 
 * Users with access to the client portal
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: portal
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ClientPortalUsersEntity.htm}
 */
export class ClientPortalUsers extends BaseEntity {
  private readonly endpoint = '/ClientPortalUsers';

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
        operation: 'createClientPortalUsers',
        requiredParams: ['clientPortalUsers'],
        optionalParams: [],
        returnType: 'IClientPortalUsers',
        endpoint: '/ClientPortalUsers',
      },
      {
        operation: 'getClientPortalUsers',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IClientPortalUsers',
        endpoint: '/ClientPortalUsers/{id}',
      },
      {
        operation: 'updateClientPortalUsers',
        requiredParams: ['id', 'clientPortalUsers'],
        optionalParams: [],
        returnType: 'IClientPortalUsers',
        endpoint: '/ClientPortalUsers/{id}',
      },
      {
        operation: 'deleteClientPortalUsers',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ClientPortalUsers/{id}',
      },
      {
        operation: 'listClientPortalUsers',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IClientPortalUsers[]',
        endpoint: '/ClientPortalUsers',
      }
    ];
  }

  /**
   * Create a new clientportalusers
   * @param clientPortalUsers - The clientportalusers data to create
   * @returns Promise with the created clientportalusers
   */
  async create(clientPortalUsers: IClientPortalUsers): Promise<ApiResponse<IClientPortalUsers>> {
    this.logger.info('Creating clientportalusers', { clientPortalUsers });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, clientPortalUsers),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a clientportalusers by ID
   * @param id - The clientportalusers ID
   * @returns Promise with the clientportalusers data
   */
  async get(id: number): Promise<ApiResponse<IClientPortalUsers>> {
    this.logger.info('Getting clientportalusers', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a clientportalusers
   * @param id - The clientportalusers ID
   * @param clientPortalUsers - The updated clientportalusers data
   * @returns Promise with the updated clientportalusers
   */
  async update(
    id: number,
    clientPortalUsers: Partial<IClientPortalUsers>
  ): Promise<ApiResponse<IClientPortalUsers>> {
    this.logger.info('Updating clientportalusers', { id, clientPortalUsers });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, clientPortalUsers),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a clientportalusers
   * @param id - The clientportalusers ID
   * @param clientPortalUsers - The partial clientportalusers data to update
   * @returns Promise with the updated clientportalusers
   */
  async patch(
    id: number,
    clientPortalUsers: Partial<IClientPortalUsers>
  ): Promise<ApiResponse<IClientPortalUsers>> {
    this.logger.info('Patching clientportalusers', { id, clientPortalUsers });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, clientPortalUsers),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a clientportalusers
   * @param id - The clientportalusers ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting clientportalusers', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List clientportalusers with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of clientportalusers
   */
  async list(query: IClientPortalUsersQuery = {}): Promise<ApiResponse<IClientPortalUsers[]>> {
    this.logger.info('Listing clientportalusers', { query });
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