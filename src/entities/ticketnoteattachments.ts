import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ITicketNoteAttachments {
  id?: number;
  [key: string]: any;
}

export interface ITicketNoteAttachmentsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * TicketNoteAttachments entity class for Autotask API
 * 
 * File attachments for ticket notes
 * Supported Operations: GET, POST, DELETE
 * Category: notes
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketNoteAttachmentsEntity.htm}
 */
export class TicketNoteAttachments extends BaseEntity {
  private readonly endpoint = '/TicketNoteAttachments';

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
        operation: 'createTicketNoteAttachments',
        requiredParams: ['ticketNoteAttachments'],
        optionalParams: [],
        returnType: 'ITicketNoteAttachments',
        endpoint: '/TicketNoteAttachments',
      },
      {
        operation: 'getTicketNoteAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ITicketNoteAttachments',
        endpoint: '/TicketNoteAttachments/{id}',
      },
      {
        operation: 'deleteTicketNoteAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/TicketNoteAttachments/{id}',
      },
      {
        operation: 'listTicketNoteAttachments',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ITicketNoteAttachments[]',
        endpoint: '/TicketNoteAttachments',
      }
    ];
  }

  /**
   * Create a new ticketnoteattachments
   * @param ticketNoteAttachments - The ticketnoteattachments data to create
   * @returns Promise with the created ticketnoteattachments
   */
  async create(ticketNoteAttachments: ITicketNoteAttachments): Promise<ApiResponse<ITicketNoteAttachments>> {
    this.logger.info('Creating ticketnoteattachments', { ticketNoteAttachments });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, ticketNoteAttachments),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a ticketnoteattachments by ID
   * @param id - The ticketnoteattachments ID
   * @returns Promise with the ticketnoteattachments data
   */
  async get(id: number): Promise<ApiResponse<ITicketNoteAttachments>> {
    this.logger.info('Getting ticketnoteattachments', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a ticketnoteattachments
   * @param id - The ticketnoteattachments ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting ticketnoteattachments', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List ticketnoteattachments with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of ticketnoteattachments
   */
  async list(query: ITicketNoteAttachmentsQuery = {}): Promise<ApiResponse<ITicketNoteAttachments[]>> {
    this.logger.info('Listing ticketnoteattachments', { query });
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