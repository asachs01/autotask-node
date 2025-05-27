import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface Invoice {
  id?: number;
  accountId?: number;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  payDate?: string;
  invoiceTotal?: number;
  taxTotal?: number;
  totalAmount?: number;
  amountDue?: number;
  amountPaid?: number;
  status?: number;
  paymentTerms?: number;
  description?: string;
  comments?: string;
  purchaseOrderNumber?: string;
  invoiceEditorTemplateId?: number;
  createdDate?: string;
  createdBy?: number;
  lastModifiedDate?: string;
  lastModifiedBy?: number;
  webServiceDate?: string;
  fromDate?: string;
  toDate?: string;
  isVoided?: boolean;
  voidedDate?: string;
  voidedBy?: number;
  taxGroup?: number;
  taxRegion?: number;
  currencyId?: number;
  exchangeRate?: number;
  internalCurrencyInvoiceTotal?: number;
  internalCurrencyTaxTotal?: number;
  internalCurrencyTotalAmount?: number;
  internalCurrencyAmountDue?: number;
  internalCurrencyAmountPaid?: number;
  [key: string]: any;
}

export interface InvoiceQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export class Invoices extends BaseEntity {
  private readonly endpoint = '/Invoices';

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
        operation: 'createInvoice',
        requiredParams: ['invoice'],
        optionalParams: [],
        returnType: 'Invoice',
        endpoint: '/Invoices',
      },
      {
        operation: 'getInvoice',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'Invoice',
        endpoint: '/Invoices/{id}',
      },
      {
        operation: 'updateInvoice',
        requiredParams: ['id', 'invoice'],
        optionalParams: [],
        returnType: 'Invoice',
        endpoint: '/Invoices/{id}',
      },
      {
        operation: 'deleteInvoice',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/Invoices/{id}',
      },
      {
        operation: 'listInvoices',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'Invoice[]',
        endpoint: '/Invoices',
      },
    ];
  }

  async create(invoice: Invoice): Promise<ApiResponse<Invoice>> {
    this.logger.info('Creating invoice', { invoice });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, invoice),
      this.endpoint,
      'POST'
    );
  }

  async get(id: number): Promise<ApiResponse<Invoice>> {
    this.logger.info('Getting invoice', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  async update(id: number, invoice: Partial<Invoice>): Promise<ApiResponse<Invoice>> {
    this.logger.info('Updating invoice', { id, invoice });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, invoice),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting invoice', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  async list(query: InvoiceQuery = {}): Promise<ApiResponse<Invoice[]>> {
    this.logger.info('Listing invoices', { query });
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
    
    this.logger.info('Listing invoices with search body', { searchBody });
    
    return this.executeRequest(
      async () => this.axios.post(`${this.endpoint}/query`, searchBody),
      `${this.endpoint}/query`,
      'POST'
    );
  }

  /**
   * Get all invoices for a specific account
   */
  async getByAccount(accountId: number): Promise<ApiResponse<Invoice[]>> {
    this.logger.info('Getting invoices by account ID', { accountId });
    return this.list({
      filter: { accountId }
    });
  }

  /**
   * Get invoices by status
   */
  async getByStatus(status: number): Promise<ApiResponse<Invoice[]>> {
    this.logger.info('Getting invoices by status', { status });
    return this.list({
      filter: { status }
    });
  }

  /**
   * Get unpaid invoices
   */
  async getUnpaid(): Promise<ApiResponse<Invoice[]>> {
    this.logger.info('Getting unpaid invoices');
    return this.list({
      filter: [
        { "op": "gt", "field": "amountDue", "value": 0 }
      ]
    });
  }

  /**
   * Get overdue invoices
   */
  async getOverdue(): Promise<ApiResponse<Invoice[]>> {
    this.logger.info('Getting overdue invoices');
    const today = new Date().toISOString().split('T')[0];
    return this.list({
      filter: [
        { "op": "gt", "field": "amountDue", "value": 0 },
        { "op": "lt", "field": "dueDate", "value": today }
      ]
    });
  }

  /**
   * Get invoices within a date range
   */
  async getByDateRange(startDate: string, endDate: string): Promise<ApiResponse<Invoice[]>> {
    this.logger.info('Getting invoices by date range', { startDate, endDate });
    return this.list({
      filter: [
        { "op": "gte", "field": "invoiceDate", "value": startDate },
        { "op": "lte", "field": "invoiceDate", "value": endDate }
      ]
    });
  }

  /**
   * Get invoices by invoice number pattern
   */
  async getByInvoiceNumber(invoiceNumber: string): Promise<ApiResponse<Invoice[]>> {
    this.logger.info('Getting invoices by invoice number', { invoiceNumber });
    return this.list({
      filter: { invoiceNumber }
    });
  }
} 