import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IKnowledgeBaseCategories {
  id?: number;
  [key: string]: any;
}

export interface IKnowledgeBaseCategoriesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * KnowledgeBaseCategories entity class for Autotask API
 * 
 * Categories for knowledge base articles
 * Supported Operations: GET
 * Category: knowledge
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/KnowledgeBaseCategoriesEntity.htm}
 */
export class KnowledgeBaseCategories extends BaseEntity {
  private readonly endpoint = '/KnowledgeBaseCategories';

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
        operation: 'getKnowledgeBaseCategories',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IKnowledgeBaseCategories',
        endpoint: '/KnowledgeBaseCategories/{id}',
      },
      {
        operation: 'listKnowledgeBaseCategories',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IKnowledgeBaseCategories[]',
        endpoint: '/KnowledgeBaseCategories',
      }
    ];
  }

  /**
   * Get a knowledgebasecategories by ID
   * @param id - The knowledgebasecategories ID
   * @returns Promise with the knowledgebasecategories data
   */
  async get(id: number): Promise<ApiResponse<IKnowledgeBaseCategories>> {
    this.logger.info('Getting knowledgebasecategories', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List knowledgebasecategories with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of knowledgebasecategories
   */
  async list(query: IKnowledgeBaseCategoriesQuery = {}): Promise<ApiResponse<IKnowledgeBaseCategories[]>> {
    this.logger.info('Listing knowledgebasecategories', { query });
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