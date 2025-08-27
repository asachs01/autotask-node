import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ICompanyAttachments {
  id?: number;
  [key: string]: any;
}

export interface ICompanyAttachmentsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * CompanyAttachments entity class for Autotask API
 * 
 * File attachments for companies
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CompanyAttachmentsEntity.htm}
 */
export class CompanyAttachments extends BaseEntity {
  private readonly endpoint = '/CompanyAttachments';

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
        operation: 'createCompanyAttachments',
        requiredParams: ['companyAttachments'],
        optionalParams: [],
        returnType: 'ICompanyAttachments',
        endpoint: '/CompanyAttachments',
      },
      {
        operation: 'getCompanyAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ICompanyAttachments',
        endpoint: '/CompanyAttachments/{id}',
      },
      {
        operation: 'deleteCompanyAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/CompanyAttachments/{id}',
      },
      {
        operation: 'listCompanyAttachments',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ICompanyAttachments[]',
        endpoint: '/CompanyAttachments',
      }
    ];
  }

  /**
   * Create a new companyattachments
   * @param companyAttachments - The companyattachments data to create
   * @returns Promise with the created companyattachments
   */
  async create(companyAttachments: ICompanyAttachments): Promise<ApiResponse<ICompanyAttachments>> {
    this.logger.info('Creating companyattachments', { companyAttachments });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, companyAttachments),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a companyattachments by ID
   * @param id - The companyattachments ID
   * @returns Promise with the companyattachments data
   */
  async get(id: number): Promise<ApiResponse<ICompanyAttachments>> {
    this.logger.info('Getting companyattachments', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a companyattachments
   * @param id - The companyattachments ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting companyattachments', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List companyattachments with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of companyattachments
   */
  async list(query: ICompanyAttachmentsQuery = {}): Promise<ApiResponse<ICompanyAttachments[]>> {
    this.logger.info('Listing companyattachments', { query });
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