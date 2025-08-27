import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IDocumentAttachments {
  id?: number;
  [key: string]: any;
}

export interface IDocumentAttachmentsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * DocumentAttachments entity class for Autotask API
 * 
 * File attachments for documents
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DocumentAttachmentsEntity.htm}
 */
export class DocumentAttachments extends BaseEntity {
  private readonly endpoint = '/DocumentAttachments';

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
        operation: 'createDocumentAttachments',
        requiredParams: ['documentAttachments'],
        optionalParams: [],
        returnType: 'IDocumentAttachments',
        endpoint: '/DocumentAttachments',
      },
      {
        operation: 'getDocumentAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IDocumentAttachments',
        endpoint: '/DocumentAttachments/{id}',
      },
      {
        operation: 'deleteDocumentAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/DocumentAttachments/{id}',
      },
      {
        operation: 'listDocumentAttachments',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IDocumentAttachments[]',
        endpoint: '/DocumentAttachments',
      }
    ];
  }

  /**
   * Create a new documentattachments
   * @param documentAttachments - The documentattachments data to create
   * @returns Promise with the created documentattachments
   */
  async create(documentAttachments: IDocumentAttachments): Promise<ApiResponse<IDocumentAttachments>> {
    this.logger.info('Creating documentattachments', { documentAttachments });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, documentAttachments),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a documentattachments by ID
   * @param id - The documentattachments ID
   * @returns Promise with the documentattachments data
   */
  async get(id: number): Promise<ApiResponse<IDocumentAttachments>> {
    this.logger.info('Getting documentattachments', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a documentattachments
   * @param id - The documentattachments ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting documentattachments', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List documentattachments with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of documentattachments
   */
  async list(query: IDocumentAttachmentsQuery = {}): Promise<ApiResponse<IDocumentAttachments[]>> {
    this.logger.info('Listing documentattachments', { query });
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