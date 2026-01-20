import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IArticleConfigurationItemCategoryAssociations {
  id?: number;
  [key: string]: any;
}

export interface IArticleConfigurationItemCategoryAssociationsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ArticleConfigurationItemCategoryAssociations entity class for Autotask API
 * 
 * Associations between articles and configuration item categories
 * Supported Operations: GET, POST, DELETE
 * Category: knowledge
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ArticleConfigurationItemCategoryAssociationsEntity.htm}
 */
export class ArticleConfigurationItemCategoryAssociations extends BaseEntity {
  private readonly endpoint = '/ArticleConfigurationItemCategoryAssociations';

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
        operation: 'createArticleConfigurationItemCategoryAssociations',
        requiredParams: ['articleConfigurationItemCategoryAssociations'],
        optionalParams: [],
        returnType: 'IArticleConfigurationItemCategoryAssociations',
        endpoint: '/ArticleConfigurationItemCategoryAssociations',
      },
      {
        operation: 'getArticleConfigurationItemCategoryAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IArticleConfigurationItemCategoryAssociations',
        endpoint: '/ArticleConfigurationItemCategoryAssociations/{id}',
      },
      {
        operation: 'deleteArticleConfigurationItemCategoryAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ArticleConfigurationItemCategoryAssociations/{id}',
      },
      {
        operation: 'listArticleConfigurationItemCategoryAssociations',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IArticleConfigurationItemCategoryAssociations[]',
        endpoint: '/ArticleConfigurationItemCategoryAssociations',
      }
    ];
  }

  /**
   * Create a new articleconfigurationitemcategoryassociations
   * @param articleConfigurationItemCategoryAssociations - The articleconfigurationitemcategoryassociations data to create
   * @returns Promise with the created articleconfigurationitemcategoryassociations
   */
  async create(articleConfigurationItemCategoryAssociations: IArticleConfigurationItemCategoryAssociations): Promise<ApiResponse<IArticleConfigurationItemCategoryAssociations>> {
    this.logger.info('Creating articleconfigurationitemcategoryassociations', { articleConfigurationItemCategoryAssociations });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, articleConfigurationItemCategoryAssociations),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a articleconfigurationitemcategoryassociations by ID
   * @param id - The articleconfigurationitemcategoryassociations ID
   * @returns Promise with the articleconfigurationitemcategoryassociations data
   */
  async get(id: number): Promise<ApiResponse<IArticleConfigurationItemCategoryAssociations>> {
    this.logger.info('Getting articleconfigurationitemcategoryassociations', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a articleconfigurationitemcategoryassociations
   * @param id - The articleconfigurationitemcategoryassociations ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting articleconfigurationitemcategoryassociations', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List articleconfigurationitemcategoryassociations with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of articleconfigurationitemcategoryassociations
   */
  async list(query: IArticleConfigurationItemCategoryAssociationsQuery = {}): Promise<ApiResponse<IArticleConfigurationItemCategoryAssociations[]>> {
    this.logger.info('Listing articleconfigurationitemcategoryassociations', { query });
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