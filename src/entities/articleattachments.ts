import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IArticleAttachments {
  id?: number;
  [key: string]: any;
}

export interface IArticleAttachmentsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ArticleAttachments entity class for Autotask API
 * 
 * File attachments for knowledge base articles
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ArticleAttachmentsEntity.htm}
 */
export class ArticleAttachments extends BaseEntity {
  private readonly endpoint = '/ArticleAttachments';

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
        operation: 'createArticleAttachments',
        requiredParams: ['articleAttachments'],
        optionalParams: [],
        returnType: 'IArticleAttachments',
        endpoint: '/ArticleAttachments',
      },
      {
        operation: 'getArticleAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IArticleAttachments',
        endpoint: '/ArticleAttachments/{id}',
      },
      {
        operation: 'deleteArticleAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ArticleAttachments/{id}',
      },
      {
        operation: 'listArticleAttachments',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IArticleAttachments[]',
        endpoint: '/ArticleAttachments',
      }
    ];
  }

  /**
   * Create a new articleattachments
   * @param articleAttachments - The articleattachments data to create
   * @returns Promise with the created articleattachments
   */
  async create(articleAttachments: IArticleAttachments): Promise<ApiResponse<IArticleAttachments>> {
    this.logger.info('Creating articleattachments', { articleAttachments });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, articleAttachments),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a articleattachments by ID
   * @param id - The articleattachments ID
   * @returns Promise with the articleattachments data
   */
  async get(id: number): Promise<ApiResponse<IArticleAttachments>> {
    this.logger.info('Getting articleattachments', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a articleattachments
   * @param id - The articleattachments ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting articleattachments', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List articleattachments with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of articleattachments
   */
  async list(query: IArticleAttachmentsQuery = {}): Promise<ApiResponse<IArticleAttachments[]>> {
    this.logger.info('Listing articleattachments', { query });
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