import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ITicketChangeRequestApprovals {
  id?: number;
  [key: string]: any;
}

export interface ITicketChangeRequestApprovalsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * TicketChangeRequestApprovals entity class for Autotask API
 * 
 * Approvals for ticket change requests
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: ticketing
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketChangeRequestApprovalsEntity.htm}
 */
export class TicketChangeRequestApprovals extends BaseEntity {
  private readonly endpoint = '/TicketChangeRequestApprovals';

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
        operation: 'createTicketChangeRequestApprovals',
        requiredParams: ['ticketChangeRequestApprovals'],
        optionalParams: [],
        returnType: 'ITicketChangeRequestApprovals',
        endpoint: '/TicketChangeRequestApprovals',
      },
      {
        operation: 'getTicketChangeRequestApprovals',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ITicketChangeRequestApprovals',
        endpoint: '/TicketChangeRequestApprovals/{id}',
      },
      {
        operation: 'updateTicketChangeRequestApprovals',
        requiredParams: ['id', 'ticketChangeRequestApprovals'],
        optionalParams: [],
        returnType: 'ITicketChangeRequestApprovals',
        endpoint: '/TicketChangeRequestApprovals/{id}',
      },
      {
        operation: 'listTicketChangeRequestApprovals',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ITicketChangeRequestApprovals[]',
        endpoint: '/TicketChangeRequestApprovals',
      }
    ];
  }

  /**
   * Create a new ticketchangerequestapprovals
   * @param ticketChangeRequestApprovals - The ticketchangerequestapprovals data to create
   * @returns Promise with the created ticketchangerequestapprovals
   */
  async create(ticketChangeRequestApprovals: ITicketChangeRequestApprovals): Promise<ApiResponse<ITicketChangeRequestApprovals>> {
    this.logger.info('Creating ticketchangerequestapprovals', { ticketChangeRequestApprovals });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, ticketChangeRequestApprovals),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a ticketchangerequestapprovals by ID
   * @param id - The ticketchangerequestapprovals ID
   * @returns Promise with the ticketchangerequestapprovals data
   */
  async get(id: number): Promise<ApiResponse<ITicketChangeRequestApprovals>> {
    this.logger.info('Getting ticketchangerequestapprovals', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a ticketchangerequestapprovals
   * @param id - The ticketchangerequestapprovals ID
   * @param ticketChangeRequestApprovals - The updated ticketchangerequestapprovals data
   * @returns Promise with the updated ticketchangerequestapprovals
   */
  async update(
    id: number,
    ticketChangeRequestApprovals: Partial<ITicketChangeRequestApprovals>
  ): Promise<ApiResponse<ITicketChangeRequestApprovals>> {
    this.logger.info('Updating ticketchangerequestapprovals', { id, ticketChangeRequestApprovals });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, ticketChangeRequestApprovals),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a ticketchangerequestapprovals
   * @param id - The ticketchangerequestapprovals ID
   * @param ticketChangeRequestApprovals - The partial ticketchangerequestapprovals data to update
   * @returns Promise with the updated ticketchangerequestapprovals
   */
  async patch(
    id: number,
    ticketChangeRequestApprovals: Partial<ITicketChangeRequestApprovals>
  ): Promise<ApiResponse<ITicketChangeRequestApprovals>> {
    this.logger.info('Patching ticketchangerequestapprovals', { id, ticketChangeRequestApprovals });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, ticketChangeRequestApprovals),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * List ticketchangerequestapprovals with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of ticketchangerequestapprovals
   */
  async list(query: ITicketChangeRequestApprovalsQuery = {}): Promise<ApiResponse<ITicketChangeRequestApprovals[]>> {
    this.logger.info('Listing ticketchangerequestapprovals', { query });
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