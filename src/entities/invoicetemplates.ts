import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IInvoiceTemplates {
  id?: number;
  [key: string]: any;
}

export interface IInvoiceTemplatesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * InvoiceTemplates entity class for Autotask API
 * 
 * Templates for generating invoices
 * Supported Operations: GET
 * Category: financial
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InvoiceTemplatesEntity.htm}
 */
export class InvoiceTemplates extends BaseEntity {
  private readonly endpoint = '/InvoiceTemplates';

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
        operation: 'getInvoiceTemplates',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IInvoiceTemplates',
        endpoint: '/InvoiceTemplates/{id}',
      },
      {
        operation: 'listInvoiceTemplates',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IInvoiceTemplates[]',
        endpoint: '/InvoiceTemplates',
      }
    ];
  }

  /**
   * Get a invoicetemplates by ID
   * @param id - The invoicetemplates ID
   * @returns Promise with the invoicetemplates data
   */
  async get(id: number): Promise<ApiResponse<IInvoiceTemplates>> {
    this.logger.info('Getting invoicetemplates', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List invoicetemplates with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of invoicetemplates
   */
  async list(query: IInvoiceTemplatesQuery = {}): Promise<ApiResponse<IInvoiceTemplates[]>> {
    this.logger.info('Listing invoicetemplates', { query });
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