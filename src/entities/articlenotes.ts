import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IArticleNotes {
  id?: number;
  [key: string]: any;
}

export interface IArticleNotesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ArticleNotes entity class for Autotask API
 * 
 * Notes for knowledge base articles
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: notes
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ArticleNotesEntity.htm}
 */
export class ArticleNotes extends BaseEntity {
  private readonly endpoint = '/ArticleNotes';

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
        operation: 'createArticleNotes',
        requiredParams: ['articleNotes'],
        optionalParams: [],
        returnType: 'IArticleNotes',
        endpoint: '/ArticleNotes',
      },
      {
        operation: 'getArticleNotes',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IArticleNotes',
        endpoint: '/ArticleNotes/{id}',
      },
      {
        operation: 'updateArticleNotes',
        requiredParams: ['id', 'articleNotes'],
        optionalParams: [],
        returnType: 'IArticleNotes',
        endpoint: '/ArticleNotes/{id}',
      },
      {
        operation: 'listArticleNotes',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IArticleNotes[]',
        endpoint: '/ArticleNotes',
      }
    ];
  }

  /**
   * Create a new articlenotes
   * @param articleNotes - The articlenotes data to create
   * @returns Promise with the created articlenotes
   */
  async create(articleNotes: IArticleNotes): Promise<ApiResponse<IArticleNotes>> {
    this.logger.info('Creating articlenotes', { articleNotes });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, articleNotes),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a articlenotes by ID
   * @param id - The articlenotes ID
   * @returns Promise with the articlenotes data
   */
  async get(id: number): Promise<ApiResponse<IArticleNotes>> {
    this.logger.info('Getting articlenotes', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a articlenotes
   * @param id - The articlenotes ID
   * @param articleNotes - The updated articlenotes data
   * @returns Promise with the updated articlenotes
   */
  async update(
    id: number,
    articleNotes: Partial<IArticleNotes>
  ): Promise<ApiResponse<IArticleNotes>> {
    this.logger.info('Updating articlenotes', { id, articleNotes });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, articleNotes),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a articlenotes
   * @param id - The articlenotes ID
   * @param articleNotes - The partial articlenotes data to update
   * @returns Promise with the updated articlenotes
   */
  async patch(
    id: number,
    articleNotes: Partial<IArticleNotes>
  ): Promise<ApiResponse<IArticleNotes>> {
    this.logger.info('Patching articlenotes', { id, articleNotes });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, articleNotes),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * List articlenotes with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of articlenotes
   */
  async list(query: IArticleNotesQuery = {}): Promise<ApiResponse<IArticleNotes[]>> {
    this.logger.info('Listing articlenotes', { query });
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