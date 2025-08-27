import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IConfigurationItems {
  id?: number;
  [key: string]: any;
}

export interface IConfigurationItemsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ConfigurationItems entity class for Autotask API
 * 
 * Configuration items and assets
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: configuration
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ConfigurationItemsEntity.htm}
 */
export class ConfigurationItems extends BaseEntity {
  private readonly endpoint = '/ConfigurationItems';

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
        operation: 'createConfigurationItems',
        requiredParams: ['configurationItems'],
        optionalParams: [],
        returnType: 'IConfigurationItems',
        endpoint: '/ConfigurationItems',
      },
      {
        operation: 'getConfigurationItems',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IConfigurationItems',
        endpoint: '/ConfigurationItems/{id}',
      },
      {
        operation: 'updateConfigurationItems',
        requiredParams: ['id', 'configurationItems'],
        optionalParams: [],
        returnType: 'IConfigurationItems',
        endpoint: '/ConfigurationItems/{id}',
      },
      {
        operation: 'listConfigurationItems',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IConfigurationItems[]',
        endpoint: '/ConfigurationItems',
      }
    ];
  }

  /**
   * Create a new configurationitems
   * @param configurationItems - The configurationitems data to create
   * @returns Promise with the created configurationitems
   */
  async create(configurationItems: IConfigurationItems): Promise<ApiResponse<IConfigurationItems>> {
    this.logger.info('Creating configurationitems', { configurationItems });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, configurationItems),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a configurationitems by ID
   * @param id - The configurationitems ID
   * @returns Promise with the configurationitems data
   */
  async get(id: number): Promise<ApiResponse<IConfigurationItems>> {
    this.logger.info('Getting configurationitems', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a configurationitems
   * @param id - The configurationitems ID
   * @param configurationItems - The updated configurationitems data
   * @returns Promise with the updated configurationitems
   */
  async update(
    id: number,
    configurationItems: Partial<IConfigurationItems>
  ): Promise<ApiResponse<IConfigurationItems>> {
    this.logger.info('Updating configurationitems', { id, configurationItems });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, configurationItems),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a configurationitems
   * @param id - The configurationitems ID
   * @param configurationItems - The partial configurationitems data to update
   * @returns Promise with the updated configurationitems
   */
  async patch(
    id: number,
    configurationItems: Partial<IConfigurationItems>
  ): Promise<ApiResponse<IConfigurationItems>> {
    this.logger.info('Patching configurationitems', { id, configurationItems });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, configurationItems),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * List configurationitems with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of configurationitems
   */
  async list(query: IConfigurationItemsQuery = {}): Promise<ApiResponse<IConfigurationItems[]>> {
    this.logger.info('Listing configurationitems', { query });
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