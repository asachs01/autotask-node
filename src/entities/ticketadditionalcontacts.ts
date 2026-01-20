import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ITicketAdditionalContacts {
  id?: number;
  [key: string]: any;
}

export interface ITicketAdditionalContactsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * TicketAdditionalContacts entity class for Autotask API
 * 
 * Additional contacts associated with tickets
 * Supported Operations: GET, POST, DELETE
 * Category: ticketing
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketAdditionalContactsEntity.htm}
 */
export class TicketAdditionalContacts extends BaseEntity {
  private readonly endpoint = '/TicketAdditionalContacts';

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
        operation: 'createTicketAdditionalContacts',
        requiredParams: ['ticketAdditionalContacts'],
        optionalParams: [],
        returnType: 'ITicketAdditionalContacts',
        endpoint: '/TicketAdditionalContacts',
      },
      {
        operation: 'getTicketAdditionalContacts',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ITicketAdditionalContacts',
        endpoint: '/TicketAdditionalContacts/{id}',
      },
      {
        operation: 'deleteTicketAdditionalContacts',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/TicketAdditionalContacts/{id}',
      },
      {
        operation: 'listTicketAdditionalContacts',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ITicketAdditionalContacts[]',
        endpoint: '/TicketAdditionalContacts',
      }
    ];
  }

  /**
   * Create a new ticketadditionalcontacts
   * @param ticketAdditionalContacts - The ticketadditionalcontacts data to create
   * @returns Promise with the created ticketadditionalcontacts
   */
  async create(ticketAdditionalContacts: ITicketAdditionalContacts): Promise<ApiResponse<ITicketAdditionalContacts>> {
    this.logger.info('Creating ticketadditionalcontacts', { ticketAdditionalContacts });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, ticketAdditionalContacts),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a ticketadditionalcontacts by ID
   * @param id - The ticketadditionalcontacts ID
   * @returns Promise with the ticketadditionalcontacts data
   */
  async get(id: number): Promise<ApiResponse<ITicketAdditionalContacts>> {
    this.logger.info('Getting ticketadditionalcontacts', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a ticketadditionalcontacts
   * @param id - The ticketadditionalcontacts ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting ticketadditionalcontacts', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List ticketadditionalcontacts with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of ticketadditionalcontacts
   */
  async list(query: ITicketAdditionalContactsQuery = {}): Promise<ApiResponse<ITicketAdditionalContacts[]>> {
    this.logger.info('Listing ticketadditionalcontacts', { query });
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
    if (query.pageSize) searchBody.maxRecords = query.pageSize;

    return this.executeQueryRequest(
      async () => this.axios.post(`${this.endpoint}/query`, searchBody),
      `${this.endpoint}/query`,
      'POST'
    );
  }
}