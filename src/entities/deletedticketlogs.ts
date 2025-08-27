import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IDeletedTicketLogs {
  id?: number;
  [key: string]: any;
}

export interface IDeletedTicketLogsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * DeletedTicketLogs entity class for Autotask API
 * 
 * Audit logs for deleted tickets
 * Supported Operations: GET
 * Category: logs
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DeletedTicketLogsEntity.htm}
 */
export class DeletedTicketLogs extends BaseEntity {
  private readonly endpoint = '/DeletedTicketLogs';

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
        operation: 'getDeletedTicketLogs',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IDeletedTicketLogs',
        endpoint: '/DeletedTicketLogs/{id}',
      },
      {
        operation: 'listDeletedTicketLogs',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IDeletedTicketLogs[]',
        endpoint: '/DeletedTicketLogs',
      }
    ];
  }

  /**
   * Get a deletedticketlogs by ID
   * @param id - The deletedticketlogs ID
   * @returns Promise with the deletedticketlogs data
   */
  async get(id: number): Promise<ApiResponse<IDeletedTicketLogs>> {
    this.logger.info('Getting deletedticketlogs', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List deletedticketlogs with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of deletedticketlogs
   */
  async list(query: IDeletedTicketLogsQuery = {}): Promise<ApiResponse<IDeletedTicketLogs[]>> {
    this.logger.info('Listing deletedticketlogs', { query });
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