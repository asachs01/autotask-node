import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IConfigurationItemSslSubjectAlternativeName {
  id?: number;
  [key: string]: any;
}

export interface IConfigurationItemSslSubjectAlternativeNameQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ConfigurationItemSslSubjectAlternativeName entity class for Autotask API
 * 
 * SSL subject alternative names for configuration items
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: configuration
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ConfigurationItemSslSubjectAlternativeNameEntity.htm}
 */
export class ConfigurationItemSslSubjectAlternativeName extends BaseEntity {
  private readonly endpoint = '/ConfigurationItemSslSubjectAlternativeName';

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
        operation: 'createConfigurationItemSslSubjectAlternativeName',
        requiredParams: ['configurationItemSslSubjectAlternativeName'],
        optionalParams: [],
        returnType: 'IConfigurationItemSslSubjectAlternativeName',
        endpoint: '/ConfigurationItemSslSubjectAlternativeName',
      },
      {
        operation: 'getConfigurationItemSslSubjectAlternativeName',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IConfigurationItemSslSubjectAlternativeName',
        endpoint: '/ConfigurationItemSslSubjectAlternativeName/{id}',
      },
      {
        operation: 'updateConfigurationItemSslSubjectAlternativeName',
        requiredParams: ['id', 'configurationItemSslSubjectAlternativeName'],
        optionalParams: [],
        returnType: 'IConfigurationItemSslSubjectAlternativeName',
        endpoint: '/ConfigurationItemSslSubjectAlternativeName/{id}',
      },
      {
        operation: 'deleteConfigurationItemSslSubjectAlternativeName',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ConfigurationItemSslSubjectAlternativeName/{id}',
      },
      {
        operation: 'listConfigurationItemSslSubjectAlternativeName',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IConfigurationItemSslSubjectAlternativeName[]',
        endpoint: '/ConfigurationItemSslSubjectAlternativeName',
      }
    ];
  }

  /**
   * Create a new configurationitemsslsubjectalternativename
   * @param configurationItemSslSubjectAlternativeName - The configurationitemsslsubjectalternativename data to create
   * @returns Promise with the created configurationitemsslsubjectalternativename
   */
  async create(configurationItemSslSubjectAlternativeName: IConfigurationItemSslSubjectAlternativeName): Promise<ApiResponse<IConfigurationItemSslSubjectAlternativeName>> {
    this.logger.info('Creating configurationitemsslsubjectalternativename', { configurationItemSslSubjectAlternativeName });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, configurationItemSslSubjectAlternativeName),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a configurationitemsslsubjectalternativename by ID
   * @param id - The configurationitemsslsubjectalternativename ID
   * @returns Promise with the configurationitemsslsubjectalternativename data
   */
  async get(id: number): Promise<ApiResponse<IConfigurationItemSslSubjectAlternativeName>> {
    this.logger.info('Getting configurationitemsslsubjectalternativename', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a configurationitemsslsubjectalternativename
   * @param id - The configurationitemsslsubjectalternativename ID
   * @param configurationItemSslSubjectAlternativeName - The updated configurationitemsslsubjectalternativename data
   * @returns Promise with the updated configurationitemsslsubjectalternativename
   */
  async update(
    id: number,
    configurationItemSslSubjectAlternativeName: Partial<IConfigurationItemSslSubjectAlternativeName>
  ): Promise<ApiResponse<IConfigurationItemSslSubjectAlternativeName>> {
    this.logger.info('Updating configurationitemsslsubjectalternativename', { id, configurationItemSslSubjectAlternativeName });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, configurationItemSslSubjectAlternativeName),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a configurationitemsslsubjectalternativename
   * @param id - The configurationitemsslsubjectalternativename ID
   * @param configurationItemSslSubjectAlternativeName - The partial configurationitemsslsubjectalternativename data to update
   * @returns Promise with the updated configurationitemsslsubjectalternativename
   */
  async patch(
    id: number,
    configurationItemSslSubjectAlternativeName: Partial<IConfigurationItemSslSubjectAlternativeName>
  ): Promise<ApiResponse<IConfigurationItemSslSubjectAlternativeName>> {
    this.logger.info('Patching configurationitemsslsubjectalternativename', { id, configurationItemSslSubjectAlternativeName });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, configurationItemSslSubjectAlternativeName),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a configurationitemsslsubjectalternativename
   * @param id - The configurationitemsslsubjectalternativename ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting configurationitemsslsubjectalternativename', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List configurationitemsslsubjectalternativename with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of configurationitemsslsubjectalternativename
   */
  async list(query: IConfigurationItemSslSubjectAlternativeNameQuery = {}): Promise<ApiResponse<IConfigurationItemSslSubjectAlternativeName[]>> {
    this.logger.info('Listing configurationitemsslsubjectalternativename', { query });
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