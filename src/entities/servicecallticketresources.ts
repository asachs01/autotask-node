import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IServiceCallTicketResources {
  id?: number;
  [key: string]: any;
}

export interface IServiceCallTicketResourcesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ServiceCallTicketResources entity class for Autotask API
 * 
 * Resource assignments for service call tickets
 * Supported Operations: GET, POST, DELETE
 * Category: service_calls
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ServiceCallTicketResourceEntity.htm}
 */
export class ServiceCallTicketResources extends BaseEntity {
  private readonly endpoint = '/ServiceCallTicketResources';

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
        operation: 'createServiceCallTicketResources',
        requiredParams: ['serviceCallTicketResources'],
        optionalParams: [],
        returnType: 'IServiceCallTicketResources',
        endpoint: '/ServiceCallTicketResources',
      },
      {
        operation: 'getServiceCallTicketResources',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IServiceCallTicketResources',
        endpoint: '/ServiceCallTicketResources/{id}',
      },
      {
        operation: 'deleteServiceCallTicketResources',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ServiceCallTicketResources/{id}',
      },
      {
        operation: 'listServiceCallTicketResources',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IServiceCallTicketResources[]',
        endpoint: '/ServiceCallTicketResources',
      }
    ];
  }

  /**
   * Create a new servicecallticketresources
   * @param serviceCallTicketResources - The servicecallticketresources data to create
   * @returns Promise with the created servicecallticketresources
   */
  async create(serviceCallTicketResources: IServiceCallTicketResources): Promise<ApiResponse<IServiceCallTicketResources>> {
    this.logger.info('Creating servicecallticketresources', { serviceCallTicketResources });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, serviceCallTicketResources),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a servicecallticketresources by ID
   * @param id - The servicecallticketresources ID
   * @returns Promise with the servicecallticketresources data
   */
  async get(id: number): Promise<ApiResponse<IServiceCallTicketResources>> {
    this.logger.info('Getting servicecallticketresources', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a servicecallticketresources
   * @param id - The servicecallticketresources ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting servicecallticketresources', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List servicecallticketresources with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of servicecallticketresources
   */
  async list(query: IServiceCallTicketResourcesQuery = {}): Promise<ApiResponse<IServiceCallTicketResources[]>> {
    this.logger.info('Listing servicecallticketresources', { query });
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