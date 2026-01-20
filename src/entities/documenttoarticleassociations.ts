import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IDocumentToArticleAssociations {
  id?: number;
  [key: string]: any;
}

export interface IDocumentToArticleAssociationsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * DocumentToArticleAssociations entity class for Autotask API
 * 
 * Associations between documents and articles
 * Supported Operations: GET, POST, DELETE
 * Category: knowledge
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DocumentToArticleAssociationsEntity.htm}
 */
export class DocumentToArticleAssociations extends BaseEntity {
  private readonly endpoint = '/DocumentToArticleAssociations';

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
        operation: 'createDocumentToArticleAssociations',
        requiredParams: ['documentToArticleAssociations'],
        optionalParams: [],
        returnType: 'IDocumentToArticleAssociations',
        endpoint: '/DocumentToArticleAssociations',
      },
      {
        operation: 'getDocumentToArticleAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IDocumentToArticleAssociations',
        endpoint: '/DocumentToArticleAssociations/{id}',
      },
      {
        operation: 'deleteDocumentToArticleAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/DocumentToArticleAssociations/{id}',
      },
      {
        operation: 'listDocumentToArticleAssociations',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IDocumentToArticleAssociations[]',
        endpoint: '/DocumentToArticleAssociations',
      }
    ];
  }

  /**
   * Create a new documenttoarticleassociations
   * @param documentToArticleAssociations - The documenttoarticleassociations data to create
   * @returns Promise with the created documenttoarticleassociations
   */
  async create(documentToArticleAssociations: IDocumentToArticleAssociations): Promise<ApiResponse<IDocumentToArticleAssociations>> {
    this.logger.info('Creating documenttoarticleassociations', { documentToArticleAssociations });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, documentToArticleAssociations),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a documenttoarticleassociations by ID
   * @param id - The documenttoarticleassociations ID
   * @returns Promise with the documenttoarticleassociations data
   */
  async get(id: number): Promise<ApiResponse<IDocumentToArticleAssociations>> {
    this.logger.info('Getting documenttoarticleassociations', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a documenttoarticleassociations
   * @param id - The documenttoarticleassociations ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting documenttoarticleassociations', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List documenttoarticleassociations with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of documenttoarticleassociations
   */
  async list(query: IDocumentToArticleAssociationsQuery = {}): Promise<ApiResponse<IDocumentToArticleAssociations[]>> {
    this.logger.info('Listing documenttoarticleassociations', { query });
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