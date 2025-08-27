import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ITicketAdditionalConfigurationItems {
  id?: number;
  [key: string]: any;
}

export interface ITicketAdditionalConfigurationItemsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * TicketAdditionalConfigurationItems entity class for Autotask API
 * 
 * Additional configuration items associated with tickets
 * Supported Operations: GET, POST, DELETE
 * Category: ticketing
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketAdditionalConfigurationItemsEntity.htm}
 */
export class TicketAdditionalConfigurationItems extends BaseEntity {
  private readonly endpoint = '/TicketAdditionalConfigurationItems';

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
        operation: 'createTicketAdditionalConfigurationItems',
        requiredParams: ['ticketAdditionalConfigurationItems'],
        optionalParams: [],
        returnType: 'ITicketAdditionalConfigurationItems',
        endpoint: '/TicketAdditionalConfigurationItems',
      },
      {
        operation: 'getTicketAdditionalConfigurationItems',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ITicketAdditionalConfigurationItems',
        endpoint: '/TicketAdditionalConfigurationItems/{id}',
      },
      {
        operation: 'deleteTicketAdditionalConfigurationItems',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/TicketAdditionalConfigurationItems/{id}',
      },
      {
        operation: 'listTicketAdditionalConfigurationItems',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ITicketAdditionalConfigurationItems[]',
        endpoint: '/TicketAdditionalConfigurationItems',
      }
    ];
  }

  /**
   * Create a new ticketadditionalconfigurationitems
   * @param ticketAdditionalConfigurationItems - The ticketadditionalconfigurationitems data to create
   * @returns Promise with the created ticketadditionalconfigurationitems
   */
  async create(ticketAdditionalConfigurationItems: ITicketAdditionalConfigurationItems): Promise<ApiResponse<ITicketAdditionalConfigurationItems>> {
    this.logger.info('Creating ticketadditionalconfigurationitems', { ticketAdditionalConfigurationItems });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, ticketAdditionalConfigurationItems),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a ticketadditionalconfigurationitems by ID
   * @param id - The ticketadditionalconfigurationitems ID
   * @returns Promise with the ticketadditionalconfigurationitems data
   */
  async get(id: number): Promise<ApiResponse<ITicketAdditionalConfigurationItems>> {
    this.logger.info('Getting ticketadditionalconfigurationitems', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a ticketadditionalconfigurationitems
   * @param id - The ticketadditionalconfigurationitems ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting ticketadditionalconfigurationitems', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List ticketadditionalconfigurationitems with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of ticketadditionalconfigurationitems
   */
  async list(query: ITicketAdditionalConfigurationItemsQuery = {}): Promise<ApiResponse<ITicketAdditionalConfigurationItems[]>> {
    this.logger.info('Listing ticketadditionalconfigurationitems', { query });
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