import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IDocumentTagAssociations {
  id?: number;
  [key: string]: any;
}

export interface IDocumentTagAssociationsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * DocumentTagAssociations entity class for Autotask API
 * 
 * Tag associations for documents
 * Supported Operations: GET, POST, DELETE
 * Category: knowledge
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DocumentTagAssociationsEntity.htm}
 */
export class DocumentTagAssociations extends BaseEntity {
  private readonly endpoint = '/DocumentTagAssociations';

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
        operation: 'createDocumentTagAssociations',
        requiredParams: ['documentTagAssociations'],
        optionalParams: [],
        returnType: 'IDocumentTagAssociations',
        endpoint: '/DocumentTagAssociations',
      },
      {
        operation: 'getDocumentTagAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IDocumentTagAssociations',
        endpoint: '/DocumentTagAssociations/{id}',
      },
      {
        operation: 'deleteDocumentTagAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/DocumentTagAssociations/{id}',
      },
      {
        operation: 'listDocumentTagAssociations',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IDocumentTagAssociations[]',
        endpoint: '/DocumentTagAssociations',
      }
    ];
  }

  /**
   * Create a new documenttagassociations
   * @param documentTagAssociations - The documenttagassociations data to create
   * @returns Promise with the created documenttagassociations
   */
  async create(documentTagAssociations: IDocumentTagAssociations): Promise<ApiResponse<IDocumentTagAssociations>> {
    this.logger.info('Creating documenttagassociations', { documentTagAssociations });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, documentTagAssociations),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a documenttagassociations by ID
   * @param id - The documenttagassociations ID
   * @returns Promise with the documenttagassociations data
   */
  async get(id: number): Promise<ApiResponse<IDocumentTagAssociations>> {
    this.logger.info('Getting documenttagassociations', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a documenttagassociations
   * @param id - The documenttagassociations ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting documenttagassociations', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List documenttagassociations with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of documenttagassociations
   */
  async list(query: IDocumentTagAssociationsQuery = {}): Promise<ApiResponse<IDocumentTagAssociations[]>> {
    this.logger.info('Listing documenttagassociations', { query });
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
    if (query.pageSize) searchBody.maxRecords = query.pageSize;

    return this.executeQueryRequest(
      async () => this.axios.post(`${this.endpoint}/query`, searchBody),
      `${this.endpoint}/query`,
      'POST'
    );
  }
}