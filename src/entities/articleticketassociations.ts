import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IArticleTicketAssociations {
  id?: number;
  [key: string]: any;
}

export interface IArticleTicketAssociationsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ArticleTicketAssociations entity class for Autotask API
 * 
 * Associations between articles and tickets
 * Supported Operations: GET, POST, DELETE
 * Category: knowledge
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ArticleTicketAssociationsEntity.htm}
 */
export class ArticleTicketAssociations extends BaseEntity {
  private readonly endpoint = '/ArticleTicketAssociations';

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
        operation: 'createArticleTicketAssociations',
        requiredParams: ['articleTicketAssociations'],
        optionalParams: [],
        returnType: 'IArticleTicketAssociations',
        endpoint: '/ArticleTicketAssociations',
      },
      {
        operation: 'getArticleTicketAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IArticleTicketAssociations',
        endpoint: '/ArticleTicketAssociations/{id}',
      },
      {
        operation: 'deleteArticleTicketAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ArticleTicketAssociations/{id}',
      },
      {
        operation: 'listArticleTicketAssociations',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IArticleTicketAssociations[]',
        endpoint: '/ArticleTicketAssociations',
      }
    ];
  }

  /**
   * Create a new articleticketassociations
   * @param articleTicketAssociations - The articleticketassociations data to create
   * @returns Promise with the created articleticketassociations
   */
  async create(articleTicketAssociations: IArticleTicketAssociations): Promise<ApiResponse<IArticleTicketAssociations>> {
    this.logger.info('Creating articleticketassociations', { articleTicketAssociations });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, articleTicketAssociations),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a articleticketassociations by ID
   * @param id - The articleticketassociations ID
   * @returns Promise with the articleticketassociations data
   */
  async get(id: number): Promise<ApiResponse<IArticleTicketAssociations>> {
    this.logger.info('Getting articleticketassociations', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a articleticketassociations
   * @param id - The articleticketassociations ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting articleticketassociations', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List articleticketassociations with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of articleticketassociations
   */
  async list(query: IArticleTicketAssociationsQuery = {}): Promise<ApiResponse<IArticleTicketAssociations[]>> {
    this.logger.info('Listing articleticketassociations', { query });
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