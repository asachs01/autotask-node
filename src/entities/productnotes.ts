import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IProductNotes {
  id?: number;
  [key: string]: any;
}

export interface IProductNotesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ProductNotes entity class for Autotask API
 * 
 * Notes for products
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: notes
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ProductNotesEntity.htm}
 */
export class ProductNotes extends BaseEntity {
  private readonly endpoint = '/ProductNotes';

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
        operation: 'createProductNotes',
        requiredParams: ['productNotes'],
        optionalParams: [],
        returnType: 'IProductNotes',
        endpoint: '/ProductNotes',
      },
      {
        operation: 'getProductNotes',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IProductNotes',
        endpoint: '/ProductNotes/{id}',
      },
      {
        operation: 'updateProductNotes',
        requiredParams: ['id', 'productNotes'],
        optionalParams: [],
        returnType: 'IProductNotes',
        endpoint: '/ProductNotes/{id}',
      },
      {
        operation: 'listProductNotes',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IProductNotes[]',
        endpoint: '/ProductNotes',
      }
    ];
  }

  /**
   * Create a new productnotes
   * @param productNotes - The productnotes data to create
   * @returns Promise with the created productnotes
   */
  async create(productNotes: IProductNotes): Promise<ApiResponse<IProductNotes>> {
    this.logger.info('Creating productnotes', { productNotes });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, productNotes),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a productnotes by ID
   * @param id - The productnotes ID
   * @returns Promise with the productnotes data
   */
  async get(id: number): Promise<ApiResponse<IProductNotes>> {
    this.logger.info('Getting productnotes', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a productnotes
   * @param id - The productnotes ID
   * @param productNotes - The updated productnotes data
   * @returns Promise with the updated productnotes
   */
  async update(
    id: number,
    productNotes: Partial<IProductNotes>
  ): Promise<ApiResponse<IProductNotes>> {
    this.logger.info('Updating productnotes', { id, productNotes });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, productNotes),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a productnotes
   * @param id - The productnotes ID
   * @param productNotes - The partial productnotes data to update
   * @returns Promise with the updated productnotes
   */
  async patch(
    id: number,
    productNotes: Partial<IProductNotes>
  ): Promise<ApiResponse<IProductNotes>> {
    this.logger.info('Patching productnotes', { id, productNotes });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, productNotes),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * List productnotes with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of productnotes
   */
  async list(query: IProductNotesQuery = {}): Promise<ApiResponse<IProductNotes[]>> {
    this.logger.info('Listing productnotes', { query });
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