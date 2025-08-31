import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IArticleTagAssociations {
  id?: number;
  [key: string]: any;
}

export interface IArticleTagAssociationsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ArticleTagAssociations entity class for Autotask API
 * 
 * Tag associations for articles
 * Supported Operations: GET, POST, DELETE
 * Category: knowledge
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ArticleTagAssociationsEntity.htm}
 */
export class ArticleTagAssociations extends BaseEntity {
  private readonly endpoint = '/ArticleTagAssociations';

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
        operation: 'createArticleTagAssociations',
        requiredParams: ['articleTagAssociations'],
        optionalParams: [],
        returnType: 'IArticleTagAssociations',
        endpoint: '/ArticleTagAssociations',
      },
      {
        operation: 'getArticleTagAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IArticleTagAssociations',
        endpoint: '/ArticleTagAssociations/{id}',
      },
      {
        operation: 'deleteArticleTagAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ArticleTagAssociations/{id}',
      },
      {
        operation: 'listArticleTagAssociations',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IArticleTagAssociations[]',
        endpoint: '/ArticleTagAssociations',
      }
    ];
  }

  /**
   * Create a new articletagassociations
   * @param articleTagAssociations - The articletagassociations data to create
   * @returns Promise with the created articletagassociations
   */
  async create(articleTagAssociations: IArticleTagAssociations): Promise<ApiResponse<IArticleTagAssociations>> {
    this.logger.info('Creating articletagassociations', { articleTagAssociations });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, articleTagAssociations),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a articletagassociations by ID
   * @param id - The articletagassociations ID
   * @returns Promise with the articletagassociations data
   */
  async get(id: number): Promise<ApiResponse<IArticleTagAssociations>> {
    this.logger.info('Getting articletagassociations', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a articletagassociations
   * @param id - The articletagassociations ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting articletagassociations', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List articletagassociations with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of articletagassociations
   */
  async list(query: IArticleTagAssociationsQuery = {}): Promise<ApiResponse<IArticleTagAssociations[]>> {
    this.logger.info('Listing articletagassociations', { query });
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