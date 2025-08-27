import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IBillingItemApprovalLevels {
  id?: number;
  [key: string]: any;
}

export interface IBillingItemApprovalLevelsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * BillingItemApprovalLevels entity class for Autotask API
 * 
 * Approval levels for billing items
 * Supported Operations: GET
 * Category: financial
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/BillingItemApprovalLevelsEntity.htm}
 */
export class BillingItemApprovalLevels extends BaseEntity {
  private readonly endpoint = '/BillingItemApprovalLevels';

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
        operation: 'getBillingItemApprovalLevels',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IBillingItemApprovalLevels',
        endpoint: '/BillingItemApprovalLevels/{id}',
      },
      {
        operation: 'listBillingItemApprovalLevels',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IBillingItemApprovalLevels[]',
        endpoint: '/BillingItemApprovalLevels',
      }
    ];
  }

  /**
   * Get a billingitemapprovallevels by ID
   * @param id - The billingitemapprovallevels ID
   * @returns Promise with the billingitemapprovallevels data
   */
  async get(id: number): Promise<ApiResponse<IBillingItemApprovalLevels>> {
    this.logger.info('Getting billingitemapprovallevels', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List billingitemapprovallevels with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of billingitemapprovallevels
   */
  async list(query: IBillingItemApprovalLevelsQuery = {}): Promise<ApiResponse<IBillingItemApprovalLevels[]>> {
    this.logger.info('Listing billingitemapprovallevels', { query });
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