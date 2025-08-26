import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IInternalLocations {
  id?: number;
  [key: string]: any;
}

export interface IInternalLocationsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * InternalLocations entity class for Autotask API
 * 
 * Internal office locations
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: organizational
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InternalLocationsEntity.htm}
 */
export class InternalLocations extends BaseEntity {
  private readonly endpoint = '/InternalLocations';

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
        operation: 'createInternalLocations',
        requiredParams: ['internalLocations'],
        optionalParams: [],
        returnType: 'IInternalLocations',
        endpoint: '/InternalLocations',
      },
      {
        operation: 'getInternalLocations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IInternalLocations',
        endpoint: '/InternalLocations/{id}',
      },
      {
        operation: 'updateInternalLocations',
        requiredParams: ['id', 'internalLocations'],
        optionalParams: [],
        returnType: 'IInternalLocations',
        endpoint: '/InternalLocations/{id}',
      },
      {
        operation: 'deleteInternalLocations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/InternalLocations/{id}',
      },
      {
        operation: 'listInternalLocations',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IInternalLocations[]',
        endpoint: '/InternalLocations',
      }
    ];
  }

  /**
   * Create a new internallocations
   * @param internalLocations - The internallocations data to create
   * @returns Promise with the created internallocations
   */
  async create(internalLocations: IInternalLocations): Promise<ApiResponse<IInternalLocations>> {
    this.logger.info('Creating internallocations', { internalLocations });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, internalLocations),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a internallocations by ID
   * @param id - The internallocations ID
   * @returns Promise with the internallocations data
   */
  async get(id: number): Promise<ApiResponse<IInternalLocations>> {
    this.logger.info('Getting internallocations', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a internallocations
   * @param id - The internallocations ID
   * @param internalLocations - The updated internallocations data
   * @returns Promise with the updated internallocations
   */
  async update(
    id: number,
    internalLocations: Partial<IInternalLocations>
  ): Promise<ApiResponse<IInternalLocations>> {
    this.logger.info('Updating internallocations', { id, internalLocations });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, internalLocations),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a internallocations
   * @param id - The internallocations ID
   * @param internalLocations - The partial internallocations data to update
   * @returns Promise with the updated internallocations
   */
  async patch(
    id: number,
    internalLocations: Partial<IInternalLocations>
  ): Promise<ApiResponse<IInternalLocations>> {
    this.logger.info('Patching internallocations', { id, internalLocations });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, internalLocations),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a internallocations
   * @param id - The internallocations ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting internallocations', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List internallocations with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of internallocations
   */
  async list(query: IInternalLocationsQuery = {}): Promise<ApiResponse<IInternalLocations[]>> {
    this.logger.info('Listing internallocations', { query });
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