import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ITicketCategoryFieldDefaults {
  id?: number;
  [key: string]: any;
}

export interface ITicketCategoryFieldDefaultsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * TicketCategoryFieldDefaults entity class for Autotask API
 * 
 * Default field values for ticket categories
 * Supported Operations: GET
 * Category: ticketing
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketCategoryFieldDefaultsEntity.htm}
 */
export class TicketCategoryFieldDefaults extends BaseEntity {
  private readonly endpoint = '/TicketCategoryFieldDefaults';

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
        operation: 'getTicketCategoryFieldDefaults',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ITicketCategoryFieldDefaults',
        endpoint: '/TicketCategoryFieldDefaults/{id}',
      },
      {
        operation: 'listTicketCategoryFieldDefaults',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ITicketCategoryFieldDefaults[]',
        endpoint: '/TicketCategoryFieldDefaults',
      }
    ];
  }

  /**
   * Get a ticketcategoryfielddefaults by ID
   * @param id - The ticketcategoryfielddefaults ID
   * @returns Promise with the ticketcategoryfielddefaults data
   */
  async get(id: number): Promise<ApiResponse<ITicketCategoryFieldDefaults>> {
    this.logger.info('Getting ticketcategoryfielddefaults', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List ticketcategoryfielddefaults with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of ticketcategoryfielddefaults
   */
  async list(query: ITicketCategoryFieldDefaultsQuery = {}): Promise<ApiResponse<ITicketCategoryFieldDefaults[]>> {
    this.logger.info('Listing ticketcategoryfielddefaults', { query });
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