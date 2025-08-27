import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IServiceBundles {
  id?: number;
  [key: string]: any;
}

export interface IServiceBundlesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ServiceBundles entity class for Autotask API
 * 
 * Bundled service offerings
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: contracts
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ServiceBundlesEntity.htm}
 */
export class ServiceBundles extends BaseEntity {
  private readonly endpoint = '/ServiceBundles';

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
        operation: 'createServiceBundles',
        requiredParams: ['serviceBundles'],
        optionalParams: [],
        returnType: 'IServiceBundles',
        endpoint: '/ServiceBundles',
      },
      {
        operation: 'getServiceBundles',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IServiceBundles',
        endpoint: '/ServiceBundles/{id}',
      },
      {
        operation: 'updateServiceBundles',
        requiredParams: ['id', 'serviceBundles'],
        optionalParams: [],
        returnType: 'IServiceBundles',
        endpoint: '/ServiceBundles/{id}',
      },
      {
        operation: 'listServiceBundles',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IServiceBundles[]',
        endpoint: '/ServiceBundles',
      }
    ];
  }

  /**
   * Create a new servicebundles
   * @param serviceBundles - The servicebundles data to create
   * @returns Promise with the created servicebundles
   */
  async create(serviceBundles: IServiceBundles): Promise<ApiResponse<IServiceBundles>> {
    this.logger.info('Creating servicebundles', { serviceBundles });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, serviceBundles),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a servicebundles by ID
   * @param id - The servicebundles ID
   * @returns Promise with the servicebundles data
   */
  async get(id: number): Promise<ApiResponse<IServiceBundles>> {
    this.logger.info('Getting servicebundles', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a servicebundles
   * @param id - The servicebundles ID
   * @param serviceBundles - The updated servicebundles data
   * @returns Promise with the updated servicebundles
   */
  async update(
    id: number,
    serviceBundles: Partial<IServiceBundles>
  ): Promise<ApiResponse<IServiceBundles>> {
    this.logger.info('Updating servicebundles', { id, serviceBundles });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, serviceBundles),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a servicebundles
   * @param id - The servicebundles ID
   * @param serviceBundles - The partial servicebundles data to update
   * @returns Promise with the updated servicebundles
   */
  async patch(
    id: number,
    serviceBundles: Partial<IServiceBundles>
  ): Promise<ApiResponse<IServiceBundles>> {
    this.logger.info('Patching servicebundles', { id, serviceBundles });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, serviceBundles),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * List servicebundles with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of servicebundles
   */
  async list(query: IServiceBundlesQuery = {}): Promise<ApiResponse<IServiceBundles[]>> {
    this.logger.info('Listing servicebundles', { query });
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