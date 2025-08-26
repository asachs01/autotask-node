import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IDocumentConfigurationItemAssociations {
  id?: number;
  [key: string]: any;
}

export interface IDocumentConfigurationItemAssociationsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * DocumentConfigurationItemAssociations entity class for Autotask API
 * 
 * Associations between documents and configuration items
 * Supported Operations: GET, POST, DELETE
 * Category: knowledge
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DocumentConfigurationItemAssociationsEntity.htm}
 */
export class DocumentConfigurationItemAssociations extends BaseEntity {
  private readonly endpoint = '/DocumentConfigurationItemAssociations';

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
        operation: 'createDocumentConfigurationItemAssociations',
        requiredParams: ['documentConfigurationItemAssociations'],
        optionalParams: [],
        returnType: 'IDocumentConfigurationItemAssociations',
        endpoint: '/DocumentConfigurationItemAssociations',
      },
      {
        operation: 'getDocumentConfigurationItemAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IDocumentConfigurationItemAssociations',
        endpoint: '/DocumentConfigurationItemAssociations/{id}',
      },
      {
        operation: 'deleteDocumentConfigurationItemAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/DocumentConfigurationItemAssociations/{id}',
      },
      {
        operation: 'listDocumentConfigurationItemAssociations',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IDocumentConfigurationItemAssociations[]',
        endpoint: '/DocumentConfigurationItemAssociations',
      }
    ];
  }

  /**
   * Create a new documentconfigurationitemassociations
   * @param documentConfigurationItemAssociations - The documentconfigurationitemassociations data to create
   * @returns Promise with the created documentconfigurationitemassociations
   */
  async create(documentConfigurationItemAssociations: IDocumentConfigurationItemAssociations): Promise<ApiResponse<IDocumentConfigurationItemAssociations>> {
    this.logger.info('Creating documentconfigurationitemassociations', { documentConfigurationItemAssociations });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, documentConfigurationItemAssociations),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a documentconfigurationitemassociations by ID
   * @param id - The documentconfigurationitemassociations ID
   * @returns Promise with the documentconfigurationitemassociations data
   */
  async get(id: number): Promise<ApiResponse<IDocumentConfigurationItemAssociations>> {
    this.logger.info('Getting documentconfigurationitemassociations', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a documentconfigurationitemassociations
   * @param id - The documentconfigurationitemassociations ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting documentconfigurationitemassociations', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List documentconfigurationitemassociations with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of documentconfigurationitemassociations
   */
  async list(query: IDocumentConfigurationItemAssociationsQuery = {}): Promise<ApiResponse<IDocumentConfigurationItemAssociations[]>> {
    this.logger.info('Listing documentconfigurationitemassociations', { query });
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