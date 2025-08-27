import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IDomainRegistrars {
  id?: number;
  [key: string]: any;
}

export interface IDomainRegistrarsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * DomainRegistrars entity class for Autotask API
 * 
 * Domain registrar information
 * Supported Operations: GET
 * Category: lookup
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DomainRegistrarsEntity.htm}
 */
export class DomainRegistrars extends BaseEntity {
  private readonly endpoint = '/DomainRegistrars';

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
        operation: 'getDomainRegistrars',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IDomainRegistrars',
        endpoint: '/DomainRegistrars/{id}',
      },
      {
        operation: 'listDomainRegistrars',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IDomainRegistrars[]',
        endpoint: '/DomainRegistrars',
      }
    ];
  }

  /**
   * Get a domainregistrars by ID
   * @param id - The domainregistrars ID
   * @returns Promise with the domainregistrars data
   */
  async get(id: number): Promise<ApiResponse<IDomainRegistrars>> {
    this.logger.info('Getting domainregistrars', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List domainregistrars with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of domainregistrars
   */
  async list(query: IDomainRegistrarsQuery = {}): Promise<ApiResponse<IDomainRegistrars[]>> {
    this.logger.info('Listing domainregistrars', { query });
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