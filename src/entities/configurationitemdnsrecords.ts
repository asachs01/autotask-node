import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IConfigurationItemDnsRecords {
  id?: number;
  [key: string]: any;
}

export interface IConfigurationItemDnsRecordsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ConfigurationItemDnsRecords entity class for Autotask API
 * 
 * DNS records for configuration items
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: configuration
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ConfigurationItemDnsRecordsEntity.htm}
 */
export class ConfigurationItemDnsRecords extends BaseEntity {
  private readonly endpoint = '/ConfigurationItemDnsRecords';

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
        operation: 'createConfigurationItemDnsRecords',
        requiredParams: ['configurationItemDnsRecords'],
        optionalParams: [],
        returnType: 'IConfigurationItemDnsRecords',
        endpoint: '/ConfigurationItemDnsRecords',
      },
      {
        operation: 'getConfigurationItemDnsRecords',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IConfigurationItemDnsRecords',
        endpoint: '/ConfigurationItemDnsRecords/{id}',
      },
      {
        operation: 'updateConfigurationItemDnsRecords',
        requiredParams: ['id', 'configurationItemDnsRecords'],
        optionalParams: [],
        returnType: 'IConfigurationItemDnsRecords',
        endpoint: '/ConfigurationItemDnsRecords/{id}',
      },
      {
        operation: 'deleteConfigurationItemDnsRecords',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ConfigurationItemDnsRecords/{id}',
      },
      {
        operation: 'listConfigurationItemDnsRecords',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IConfigurationItemDnsRecords[]',
        endpoint: '/ConfigurationItemDnsRecords',
      }
    ];
  }

  /**
   * Create a new configurationitemdnsrecords
   * @param configurationItemDnsRecords - The configurationitemdnsrecords data to create
   * @returns Promise with the created configurationitemdnsrecords
   */
  async create(configurationItemDnsRecords: IConfigurationItemDnsRecords): Promise<ApiResponse<IConfigurationItemDnsRecords>> {
    this.logger.info('Creating configurationitemdnsrecords', { configurationItemDnsRecords });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, configurationItemDnsRecords),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a configurationitemdnsrecords by ID
   * @param id - The configurationitemdnsrecords ID
   * @returns Promise with the configurationitemdnsrecords data
   */
  async get(id: number): Promise<ApiResponse<IConfigurationItemDnsRecords>> {
    this.logger.info('Getting configurationitemdnsrecords', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a configurationitemdnsrecords
   * @param id - The configurationitemdnsrecords ID
   * @param configurationItemDnsRecords - The updated configurationitemdnsrecords data
   * @returns Promise with the updated configurationitemdnsrecords
   */
  async update(
    id: number,
    configurationItemDnsRecords: Partial<IConfigurationItemDnsRecords>
  ): Promise<ApiResponse<IConfigurationItemDnsRecords>> {
    this.logger.info('Updating configurationitemdnsrecords', { id, configurationItemDnsRecords });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, configurationItemDnsRecords),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a configurationitemdnsrecords
   * @param id - The configurationitemdnsrecords ID
   * @param configurationItemDnsRecords - The partial configurationitemdnsrecords data to update
   * @returns Promise with the updated configurationitemdnsrecords
   */
  async patch(
    id: number,
    configurationItemDnsRecords: Partial<IConfigurationItemDnsRecords>
  ): Promise<ApiResponse<IConfigurationItemDnsRecords>> {
    this.logger.info('Patching configurationitemdnsrecords', { id, configurationItemDnsRecords });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, configurationItemDnsRecords),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a configurationitemdnsrecords
   * @param id - The configurationitemdnsrecords ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting configurationitemdnsrecords', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List configurationitemdnsrecords with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of configurationitemdnsrecords
   */
  async list(query: IConfigurationItemDnsRecordsQuery = {}): Promise<ApiResponse<IConfigurationItemDnsRecords[]>> {
    this.logger.info('Listing configurationitemdnsrecords', { query });
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