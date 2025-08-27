import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IArticleToDocumentAssociations {
  id?: number;
  [key: string]: any;
}

export interface IArticleToDocumentAssociationsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ArticleToDocumentAssociations entity class for Autotask API
 * 
 * Associations between articles and documents
 * Supported Operations: GET, POST, DELETE
 * Category: knowledge
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ArticleToDocumentAssociationsEntity.htm}
 */
export class ArticleToDocumentAssociations extends BaseEntity {
  private readonly endpoint = '/ArticleToDocumentAssociations';

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
        operation: 'createArticleToDocumentAssociations',
        requiredParams: ['articleToDocumentAssociations'],
        optionalParams: [],
        returnType: 'IArticleToDocumentAssociations',
        endpoint: '/ArticleToDocumentAssociations',
      },
      {
        operation: 'getArticleToDocumentAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IArticleToDocumentAssociations',
        endpoint: '/ArticleToDocumentAssociations/{id}',
      },
      {
        operation: 'deleteArticleToDocumentAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ArticleToDocumentAssociations/{id}',
      },
      {
        operation: 'listArticleToDocumentAssociations',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IArticleToDocumentAssociations[]',
        endpoint: '/ArticleToDocumentAssociations',
      }
    ];
  }

  /**
   * Create a new articletodocumentassociations
   * @param articleToDocumentAssociations - The articletodocumentassociations data to create
   * @returns Promise with the created articletodocumentassociations
   */
  async create(articleToDocumentAssociations: IArticleToDocumentAssociations): Promise<ApiResponse<IArticleToDocumentAssociations>> {
    this.logger.info('Creating articletodocumentassociations', { articleToDocumentAssociations });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, articleToDocumentAssociations),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a articletodocumentassociations by ID
   * @param id - The articletodocumentassociations ID
   * @returns Promise with the articletodocumentassociations data
   */
  async get(id: number): Promise<ApiResponse<IArticleToDocumentAssociations>> {
    this.logger.info('Getting articletodocumentassociations', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a articletodocumentassociations
   * @param id - The articletodocumentassociations ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting articletodocumentassociations', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List articletodocumentassociations with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of articletodocumentassociations
   */
  async list(query: IArticleToDocumentAssociationsQuery = {}): Promise<ApiResponse<IArticleToDocumentAssociations[]>> {
    this.logger.info('Listing articletodocumentassociations', { query });
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