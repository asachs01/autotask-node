import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ICompanyNoteAttachments {
  id?: number;
  [key: string]: any;
}

export interface ICompanyNoteAttachmentsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * CompanyNoteAttachments entity class for Autotask API
 * 
 * File attachments for company notes
 * Supported Operations: GET, POST, DELETE
 * Category: notes
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CompanyNoteAttachmentsEntity.htm}
 */
export class CompanyNoteAttachments extends BaseEntity {
  private readonly endpoint = '/CompanyNoteAttachments';

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
        operation: 'createCompanyNoteAttachments',
        requiredParams: ['companyNoteAttachments'],
        optionalParams: [],
        returnType: 'ICompanyNoteAttachments',
        endpoint: '/CompanyNoteAttachments',
      },
      {
        operation: 'getCompanyNoteAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ICompanyNoteAttachments',
        endpoint: '/CompanyNoteAttachments/{id}',
      },
      {
        operation: 'deleteCompanyNoteAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/CompanyNoteAttachments/{id}',
      },
      {
        operation: 'listCompanyNoteAttachments',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ICompanyNoteAttachments[]',
        endpoint: '/CompanyNoteAttachments',
      }
    ];
  }

  /**
   * Create a new companynoteattachments
   * @param companyNoteAttachments - The companynoteattachments data to create
   * @returns Promise with the created companynoteattachments
   */
  async create(companyNoteAttachments: ICompanyNoteAttachments): Promise<ApiResponse<ICompanyNoteAttachments>> {
    this.logger.info('Creating companynoteattachments', { companyNoteAttachments });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, companyNoteAttachments),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a companynoteattachments by ID
   * @param id - The companynoteattachments ID
   * @returns Promise with the companynoteattachments data
   */
  async get(id: number): Promise<ApiResponse<ICompanyNoteAttachments>> {
    this.logger.info('Getting companynoteattachments', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a companynoteattachments
   * @param id - The companynoteattachments ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting companynoteattachments', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List companynoteattachments with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of companynoteattachments
   */
  async list(query: ICompanyNoteAttachmentsQuery = {}): Promise<ApiResponse<ICompanyNoteAttachments[]>> {
    this.logger.info('Listing companynoteattachments', { query });
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