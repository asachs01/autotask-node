import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ITicketAttachments {
  id?: number;
  [key: string]: any;
}

export interface ITicketAttachmentsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * TicketAttachments entity class for Autotask API
 * 
 * File attachments for tickets
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketAttachmentsEntity.htm}
 */
export class TicketAttachments extends BaseEntity {
  private readonly endpoint = '/TicketAttachments';

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
        operation: 'createTicketAttachments',
        requiredParams: ['ticketAttachments'],
        optionalParams: [],
        returnType: 'ITicketAttachments',
        endpoint: '/TicketAttachments',
      },
      {
        operation: 'getTicketAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ITicketAttachments',
        endpoint: '/TicketAttachments/{id}',
      },
      {
        operation: 'deleteTicketAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/TicketAttachments/{id}',
      },
      {
        operation: 'listTicketAttachments',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ITicketAttachments[]',
        endpoint: '/TicketAttachments',
      }
    ];
  }

  /**
   * Create a new ticketattachments
   * @param ticketAttachments - The ticketattachments data to create
   * @returns Promise with the created ticketattachments
   */
  async create(ticketAttachments: ITicketAttachments): Promise<ApiResponse<ITicketAttachments>> {
    this.logger.info('Creating ticketattachments', { ticketAttachments });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, ticketAttachments),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a ticketattachments by ID
   * @param id - The ticketattachments ID
   * @returns Promise with the ticketattachments data
   */
  async get(id: number): Promise<ApiResponse<ITicketAttachments>> {
    this.logger.info('Getting ticketattachments', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a ticketattachments
   * @param id - The ticketattachments ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting ticketattachments', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List ticketattachments with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of ticketattachments
   */
  async list(query: ITicketAttachmentsQuery = {}): Promise<ApiResponse<ITicketAttachments[]>> {
    this.logger.info('Listing ticketattachments', { query });
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