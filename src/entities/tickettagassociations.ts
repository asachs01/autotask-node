import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ITicketTagAssociations {
  id?: number;
  [key: string]: any;
}

export interface ITicketTagAssociationsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * TicketTagAssociations entity class for Autotask API
 * 
 * Tag associations for tickets
 * Supported Operations: GET, POST, DELETE
 * Category: ticketing
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketTagAssociationsEntity.htm}
 */
export class TicketTagAssociations extends BaseEntity {
  private readonly endpoint = '/TicketTagAssociations';

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
        operation: 'createTicketTagAssociations',
        requiredParams: ['ticketTagAssociations'],
        optionalParams: [],
        returnType: 'ITicketTagAssociations',
        endpoint: '/TicketTagAssociations',
      },
      {
        operation: 'getTicketTagAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ITicketTagAssociations',
        endpoint: '/TicketTagAssociations/{id}',
      },
      {
        operation: 'deleteTicketTagAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/TicketTagAssociations/{id}',
      },
      {
        operation: 'listTicketTagAssociations',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ITicketTagAssociations[]',
        endpoint: '/TicketTagAssociations',
      }
    ];
  }

  /**
   * Create a new tickettagassociations
   * @param ticketTagAssociations - The tickettagassociations data to create
   * @returns Promise with the created tickettagassociations
   */
  async create(ticketTagAssociations: ITicketTagAssociations): Promise<ApiResponse<ITicketTagAssociations>> {
    this.logger.info('Creating tickettagassociations', { ticketTagAssociations });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, ticketTagAssociations),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a tickettagassociations by ID
   * @param id - The tickettagassociations ID
   * @returns Promise with the tickettagassociations data
   */
  async get(id: number): Promise<ApiResponse<ITicketTagAssociations>> {
    this.logger.info('Getting tickettagassociations', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a tickettagassociations
   * @param id - The tickettagassociations ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting tickettagassociations', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List tickettagassociations with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of tickettagassociations
   */
  async list(query: ITicketTagAssociationsQuery = {}): Promise<ApiResponse<ITicketTagAssociations[]>> {
    this.logger.info('Listing tickettagassociations', { query });
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