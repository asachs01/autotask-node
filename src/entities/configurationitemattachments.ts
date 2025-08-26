import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IConfigurationItemAttachments {
  id?: number;
  [key: string]: any;
}

export interface IConfigurationItemAttachmentsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ConfigurationItemAttachments entity class for Autotask API
 * 
 * File attachments for configuration items
 * Supported Operations: GET, POST, DELETE
 * Category: configuration
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ConfigurationItemAttachmentsEntity.htm}
 */
export class ConfigurationItemAttachments extends BaseEntity {
  private readonly endpoint = '/ConfigurationItemAttachments';

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
        operation: 'createConfigurationItemAttachments',
        requiredParams: ['configurationItemAttachments'],
        optionalParams: [],
        returnType: 'IConfigurationItemAttachments',
        endpoint: '/ConfigurationItemAttachments',
      },
      {
        operation: 'getConfigurationItemAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IConfigurationItemAttachments',
        endpoint: '/ConfigurationItemAttachments/{id}',
      },
      {
        operation: 'deleteConfigurationItemAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ConfigurationItemAttachments/{id}',
      },
      {
        operation: 'listConfigurationItemAttachments',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IConfigurationItemAttachments[]',
        endpoint: '/ConfigurationItemAttachments',
      }
    ];
  }

  /**
   * Create a new configurationitemattachments
   * @param configurationItemAttachments - The configurationitemattachments data to create
   * @returns Promise with the created configurationitemattachments
   */
  async create(configurationItemAttachments: IConfigurationItemAttachments): Promise<ApiResponse<IConfigurationItemAttachments>> {
    this.logger.info('Creating configurationitemattachments', { configurationItemAttachments });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, configurationItemAttachments),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a configurationitemattachments by ID
   * @param id - The configurationitemattachments ID
   * @returns Promise with the configurationitemattachments data
   */
  async get(id: number): Promise<ApiResponse<IConfigurationItemAttachments>> {
    this.logger.info('Getting configurationitemattachments', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a configurationitemattachments
   * @param id - The configurationitemattachments ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting configurationitemattachments', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List configurationitemattachments with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of configurationitemattachments
   */
  async list(query: IConfigurationItemAttachmentsQuery = {}): Promise<ApiResponse<IConfigurationItemAttachments[]>> {
    this.logger.info('Listing configurationitemattachments', { query });
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