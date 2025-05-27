import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface Quote {
  id?: number;
  accountId?: number;
  quoteNumber?: string;
  quoteDate?: string;
  expirationDate?: string;
  validUntilDate?: string;
  quoteTotal?: number;
  taxTotal?: number;
  totalAmount?: number;
  status?: number;
  description?: string;
  comments?: string;
  purchaseOrderNumber?: string;
  quoteTemplateId?: number;
  createdDate?: string;
  createdBy?: number;
  lastModifiedDate?: string;
  lastModifiedBy?: number;
  webServiceDate?: string;
  contactId?: number;
  opportunityId?: number;
  projectId?: number;
  soldDate?: string;
  isActive?: boolean;
  taxGroup?: number;
  taxRegion?: number;
  currencyId?: number;
  exchangeRate?: number;
  internalCurrencyQuoteTotal?: number;
  internalCurrencyTaxTotal?: number;
  internalCurrencyTotalAmount?: number;
  billToLocationId?: number;
  shipToLocationId?: number;
  paymentTerms?: number;
  paymentMethodId?: number;
  [key: string]: any;
}

export interface QuoteQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export class Quotes extends BaseEntity {
  private readonly endpoint = '/Quotes';

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
        operation: 'createQuote',
        requiredParams: ['quote'],
        optionalParams: [],
        returnType: 'Quote',
        endpoint: '/Quotes',
      },
      {
        operation: 'getQuote',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'Quote',
        endpoint: '/Quotes/{id}',
      },
      {
        operation: 'updateQuote',
        requiredParams: ['id', 'quote'],
        optionalParams: [],
        returnType: 'Quote',
        endpoint: '/Quotes/{id}',
      },
      {
        operation: 'deleteQuote',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/Quotes/{id}',
      },
      {
        operation: 'listQuotes',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'Quote[]',
        endpoint: '/Quotes',
      },
    ];
  }

  async create(quote: Quote): Promise<ApiResponse<Quote>> {
    this.logger.info('Creating quote', { quote });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, quote),
      this.endpoint,
      'POST'
    );
  }

  async get(id: number): Promise<ApiResponse<Quote>> {
    this.logger.info('Getting quote', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  async update(id: number, quote: Partial<Quote>): Promise<ApiResponse<Quote>> {
    this.logger.info('Updating quote', { id, quote });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, quote),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting quote', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  async list(query: QuoteQuery = {}): Promise<ApiResponse<Quote[]>> {
    this.logger.info('Listing quotes', { query });
    const searchBody: Record<string, any> = {};
    
    // Ensure there's a filter - Autotask API requires a filter
    if (!query.filter || Object.keys(query.filter).length === 0) {
      searchBody.filter = [
        {
          "op": "gte",
          "field": "id",
          "value": 0
        }
      ];
    } else {
      // If filter is provided as an object, convert to array format expected by API
      if (!Array.isArray(query.filter)) {
        const filterArray = [];
        for (const [field, value] of Object.entries(query.filter)) {
          filterArray.push({
            "op": "eq",
            "field": field,
            "value": value
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
    
    this.logger.info('Listing quotes with search body', { searchBody });
    
    return this.executeRequest(
      async () => this.axios.post(`${this.endpoint}/query`, searchBody),
      `${this.endpoint}/query`,
      'POST'
    );
  }

  /**
   * Get all quotes for a specific account
   */
  async getByAccount(accountId: number): Promise<ApiResponse<Quote[]>> {
    this.logger.info('Getting quotes by account ID', { accountId });
    return this.list({
      filter: { accountId }
    });
  }

  /**
   * Get quotes by status
   */
  async getByStatus(status: number): Promise<ApiResponse<Quote[]>> {
    this.logger.info('Getting quotes by status', { status });
    return this.list({
      filter: { status }
    });
  }

  /**
   * Get active quotes
   */
  async getActive(): Promise<ApiResponse<Quote[]>> {
    this.logger.info('Getting active quotes');
    return this.list({
      filter: { isActive: true }
    });
  }

  /**
   * Get expired quotes
   */
  async getExpired(): Promise<ApiResponse<Quote[]>> {
    this.logger.info('Getting expired quotes');
    const today = new Date().toISOString().split('T')[0];
    return this.list({
      filter: [
        { "op": "lt", "field": "expirationDate", "value": today },
        { "op": "eq", "field": "isActive", "value": true }
      ]
    });
  }

  /**
   * Get quotes within a date range
   */
  async getByDateRange(startDate: string, endDate: string): Promise<ApiResponse<Quote[]>> {
    this.logger.info('Getting quotes by date range', { startDate, endDate });
    return this.list({
      filter: [
        { "op": "gte", "field": "quoteDate", "value": startDate },
        { "op": "lte", "field": "quoteDate", "value": endDate }
      ]
    });
  }

  /**
   * Get quotes by quote number pattern
   */
  async getByQuoteNumber(quoteNumber: string): Promise<ApiResponse<Quote[]>> {
    this.logger.info('Getting quotes by quote number', { quoteNumber });
    return this.list({
      filter: { quoteNumber }
    });
  }

  /**
   * Get quotes for a specific opportunity
   */
  async getByOpportunity(opportunityId: number): Promise<ApiResponse<Quote[]>> {
    this.logger.info('Getting quotes by opportunity ID', { opportunityId });
    return this.list({
      filter: { opportunityId }
    });
  }

  /**
   * Get quotes for a specific project
   */
  async getByProject(projectId: number): Promise<ApiResponse<Quote[]>> {
    this.logger.info('Getting quotes by project ID', { projectId });
    return this.list({
      filter: { projectId }
    });
  }

  /**
   * Get sold quotes
   */
  async getSold(): Promise<ApiResponse<Quote[]>> {
    this.logger.info('Getting sold quotes');
    return this.list({
      filter: [
        { "op": "isnotnull", "field": "soldDate" }
      ]
    });
  }
} 