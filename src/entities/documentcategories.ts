import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IDocumentCategories {
  id?: number;
  [key: string]: any;
}

export interface IDocumentCategoriesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * DocumentCategories entity class for Autotask API
 * 
 * Categories for organizing documents
 * Supported Operations: GET
 * Category: knowledge
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DocumentCategoriesEntity.htm}
 */
export class DocumentCategories extends BaseEntity {
  private readonly endpoint = '/DocumentCategories';

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
        operation: 'getDocumentCategories',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IDocumentCategories',
        endpoint: '/DocumentCategories/{id}',
      },
      {
        operation: 'listDocumentCategories',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IDocumentCategories[]',
        endpoint: '/DocumentCategories',
      }
    ];
  }

  /**
   * Get a documentcategories by ID
   * @param id - The documentcategories ID
   * @returns Promise with the documentcategories data
   */
  async get(id: number): Promise<ApiResponse<IDocumentCategories>> {
    this.logger.info('Getting documentcategories', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List documentcategories with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of documentcategories
   */
  async list(query: IDocumentCategoriesQuery = {}): Promise<ApiResponse<IDocumentCategories[]>> {
    this.logger.info('Listing documentcategories', { query });
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