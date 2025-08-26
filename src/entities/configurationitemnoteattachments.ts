import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IConfigurationItemNoteAttachments {
  id?: number;
  [key: string]: any;
}

export interface IConfigurationItemNoteAttachmentsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ConfigurationItemNoteAttachments entity class for Autotask API
 * 
 * File attachments for configuration item notes
 * Supported Operations: GET, POST, DELETE
 * Category: notes
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ConfigurationItemNoteAttachmentsEntity.htm}
 */
export class ConfigurationItemNoteAttachments extends BaseEntity {
  private readonly endpoint = '/ConfigurationItemNoteAttachments';

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
        operation: 'createConfigurationItemNoteAttachments',
        requiredParams: ['configurationItemNoteAttachments'],
        optionalParams: [],
        returnType: 'IConfigurationItemNoteAttachments',
        endpoint: '/ConfigurationItemNoteAttachments',
      },
      {
        operation: 'getConfigurationItemNoteAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IConfigurationItemNoteAttachments',
        endpoint: '/ConfigurationItemNoteAttachments/{id}',
      },
      {
        operation: 'deleteConfigurationItemNoteAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ConfigurationItemNoteAttachments/{id}',
      },
      {
        operation: 'listConfigurationItemNoteAttachments',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IConfigurationItemNoteAttachments[]',
        endpoint: '/ConfigurationItemNoteAttachments',
      }
    ];
  }

  /**
   * Create a new configurationitemnoteattachments
   * @param configurationItemNoteAttachments - The configurationitemnoteattachments data to create
   * @returns Promise with the created configurationitemnoteattachments
   */
  async create(configurationItemNoteAttachments: IConfigurationItemNoteAttachments): Promise<ApiResponse<IConfigurationItemNoteAttachments>> {
    this.logger.info('Creating configurationitemnoteattachments', { configurationItemNoteAttachments });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, configurationItemNoteAttachments),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a configurationitemnoteattachments by ID
   * @param id - The configurationitemnoteattachments ID
   * @returns Promise with the configurationitemnoteattachments data
   */
  async get(id: number): Promise<ApiResponse<IConfigurationItemNoteAttachments>> {
    this.logger.info('Getting configurationitemnoteattachments', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a configurationitemnoteattachments
   * @param id - The configurationitemnoteattachments ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting configurationitemnoteattachments', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List configurationitemnoteattachments with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of configurationitemnoteattachments
   */
  async list(query: IConfigurationItemNoteAttachmentsQuery = {}): Promise<ApiResponse<IConfigurationItemNoteAttachments[]>> {
    this.logger.info('Listing configurationitemnoteattachments', { query });
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