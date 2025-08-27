import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IServiceLevelAgreementResults {
  id?: number;
  [key: string]: any;
}

export interface IServiceLevelAgreementResultsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ServiceLevelAgreementResults entity class for Autotask API
 * 
 * Results and performance metrics for SLAs
 * Supported Operations: GET
 * Category: associations
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ServiceLevelAgreementResultsEntity.htm}
 */
export class ServiceLevelAgreementResults extends BaseEntity {
  private readonly endpoint = '/ServiceLevelAgreementResults';

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
        operation: 'getServiceLevelAgreementResults',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IServiceLevelAgreementResults',
        endpoint: '/ServiceLevelAgreementResults/{id}',
      },
      {
        operation: 'listServiceLevelAgreementResults',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IServiceLevelAgreementResults[]',
        endpoint: '/ServiceLevelAgreementResults',
      }
    ];
  }

  /**
   * Get a servicelevelagreementresults by ID
   * @param id - The servicelevelagreementresults ID
   * @returns Promise with the servicelevelagreementresults data
   */
  async get(id: number): Promise<ApiResponse<IServiceLevelAgreementResults>> {
    this.logger.info('Getting servicelevelagreementresults', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List servicelevelagreementresults with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of servicelevelagreementresults
   */
  async list(query: IServiceLevelAgreementResultsQuery = {}): Promise<ApiResponse<IServiceLevelAgreementResults[]>> {
    this.logger.info('Listing servicelevelagreementresults', { query });
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