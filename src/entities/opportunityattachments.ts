import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IOpportunityAttachments {
  id?: number;
  [key: string]: any;
}

export interface IOpportunityAttachmentsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * OpportunityAttachments entity class for Autotask API
 * 
 * File attachments for opportunities
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/OpportunityAttachmentsEntity.htm}
 */
export class OpportunityAttachments extends BaseEntity {
  private readonly endpoint = '/OpportunityAttachments';

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
        operation: 'createOpportunityAttachments',
        requiredParams: ['opportunityAttachments'],
        optionalParams: [],
        returnType: 'IOpportunityAttachments',
        endpoint: '/OpportunityAttachments',
      },
      {
        operation: 'getOpportunityAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IOpportunityAttachments',
        endpoint: '/OpportunityAttachments/{id}',
      },
      {
        operation: 'deleteOpportunityAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/OpportunityAttachments/{id}',
      },
      {
        operation: 'listOpportunityAttachments',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IOpportunityAttachments[]',
        endpoint: '/OpportunityAttachments',
      }
    ];
  }

  /**
   * Create a new opportunityattachments
   * @param opportunityAttachments - The opportunityattachments data to create
   * @returns Promise with the created opportunityattachments
   */
  async create(opportunityAttachments: IOpportunityAttachments): Promise<ApiResponse<IOpportunityAttachments>> {
    this.logger.info('Creating opportunityattachments', { opportunityAttachments });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, opportunityAttachments),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a opportunityattachments by ID
   * @param id - The opportunityattachments ID
   * @returns Promise with the opportunityattachments data
   */
  async get(id: number): Promise<ApiResponse<IOpportunityAttachments>> {
    this.logger.info('Getting opportunityattachments', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a opportunityattachments
   * @param id - The opportunityattachments ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting opportunityattachments', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List opportunityattachments with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of opportunityattachments
   */
  async list(query: IOpportunityAttachmentsQuery = {}): Promise<ApiResponse<IOpportunityAttachments[]>> {
    this.logger.info('Listing opportunityattachments', { query });
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