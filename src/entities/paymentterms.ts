import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IPaymentTerms {
  id?: number;
  [key: string]: any;
}

export interface IPaymentTermsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * PaymentTerms entity class for Autotask API
 * 
 * Available payment terms for invoicing
 * Supported Operations: GET
 * Category: financial
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PaymentTermsEntity.htm}
 */
export class PaymentTerms extends BaseEntity {
  private readonly endpoint = '/PaymentTerms';

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
        operation: 'getPaymentTerms',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IPaymentTerms',
        endpoint: '/PaymentTerms/{id}',
      },
      {
        operation: 'listPaymentTerms',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IPaymentTerms[]',
        endpoint: '/PaymentTerms',
      }
    ];
  }

  /**
   * Get a paymentterms by ID
   * @param id - The paymentterms ID
   * @returns Promise with the paymentterms data
   */
  async get(id: number): Promise<ApiResponse<IPaymentTerms>> {
    this.logger.info('Getting paymentterms', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List paymentterms with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of paymentterms
   */
  async list(query: IPaymentTermsQuery = {}): Promise<ApiResponse<IPaymentTerms[]>> {
    this.logger.info('Listing paymentterms', { query });
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