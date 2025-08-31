import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IDocuments {
  id?: number;
  [key: string]: any;
}

export interface IDocumentsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Documents entity class for Autotask API
 * 
 * Documents and files in the system
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: knowledge
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DocumentsEntity.htm}
 */
export class Documents extends BaseEntity {
  private readonly endpoint = '/Documents';

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
        operation: 'createDocuments',
        requiredParams: ['documents'],
        optionalParams: [],
        returnType: 'IDocuments',
        endpoint: '/Documents',
      },
      {
        operation: 'getDocuments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IDocuments',
        endpoint: '/Documents/{id}',
      },
      {
        operation: 'updateDocuments',
        requiredParams: ['id', 'documents'],
        optionalParams: [],
        returnType: 'IDocuments',
        endpoint: '/Documents/{id}',
      },
      {
        operation: 'listDocuments',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IDocuments[]',
        endpoint: '/Documents',
      }
    ];
  }

  /**
   * Create a new documents
   * @param documents - The documents data to create
   * @returns Promise with the created documents
   */
  async create(documents: IDocuments): Promise<ApiResponse<IDocuments>> {
    this.logger.info('Creating documents', { documents });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, documents),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a documents by ID
   * @param id - The documents ID
   * @returns Promise with the documents data
   */
  async get(id: number): Promise<ApiResponse<IDocuments>> {
    this.logger.info('Getting documents', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a documents
   * @param id - The documents ID
   * @param documents - The updated documents data
   * @returns Promise with the updated documents
   */
  async update(
    id: number,
    documents: Partial<IDocuments>
  ): Promise<ApiResponse<IDocuments>> {
    this.logger.info('Updating documents', { id, documents });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, documents),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a documents
   * @param id - The documents ID
   * @param documents - The partial documents data to update
   * @returns Promise with the updated documents
   */
  async patch(
    id: number,
    documents: Partial<IDocuments>
  ): Promise<ApiResponse<IDocuments>> {
    this.logger.info('Patching documents', { id, documents });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, documents),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * List documents with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of documents
   */
  async list(query: IDocumentsQuery = {}): Promise<ApiResponse<IDocuments[]>> {
    this.logger.info('Listing documents', { query });
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