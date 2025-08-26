import { AxiosInstance } from 'axios';
import winston from 'winston';
import { BaseSubClient } from '../base/BaseSubClient';
import {
  // Billing entities
  BillingCodes,
  BillingItems,
  BillingItemApprovalLevels,
  // Invoice entities
  Invoices,
  InvoiceTemplates,
  AdditionalInvoiceFieldValues,
  // Quote entities
  Quotes,
  QuoteItems,
  QuoteLocations,
  QuoteTemplates,
  // Purchase entities
  PurchaseOrders,
  PurchaseOrderItems,
  PurchaseOrderItemReceiving,
  PurchaseApprovals,
  // Sales entities
  SalesOrders,
  SalesOrderAttachments,
  // Expense entities
  ExpenseItems,
  ExpenseReports,
  ExpenseItemAttachments,
  ExpenseReportAttachments,
  // Order and change entities
  ChangeOrderCharges,
  // Tax entities
  Taxes,
  TaxCategories,
  TaxRegions,
  // Currency and payment entities
  Currencies,
  PaymentTerms,
  // Pricing entities
  PriceListMaterialCodes,
  PriceListProducts,
  PriceListProductTiers,
  PriceListRoles,
  PriceListServices,
  PriceListServiceBundles,
  PriceListWorkTypeModifiers,
} from '../../entities';

/**
 * FinancialClient handles all financial and billing-related entities:
 * - Invoicing and billing
 * - Quotes and estimates
 * - Purchase orders and procurement
 * - Expenses and expense reports
 * - Tax calculations and currencies
 * - Pricing and rate management
 */
export class FinancialClient extends BaseSubClient {
  // Billing entities
  public readonly billingCodes: BillingCodes;
  public readonly billingItems: BillingItems;
  public readonly billingItemApprovalLevels: BillingItemApprovalLevels;

  // Invoice entities
  public readonly invoices: Invoices;
  public readonly invoiceTemplates: InvoiceTemplates;
  public readonly additionalInvoiceFieldValues: AdditionalInvoiceFieldValues;

  // Quote entities
  public readonly quotes: Quotes;
  public readonly quoteItems: QuoteItems;
  public readonly quoteLocations: QuoteLocations;
  public readonly quoteTemplates: QuoteTemplates;

  // Purchase entities
  public readonly purchaseOrders: PurchaseOrders;
  public readonly purchaseOrderItems: PurchaseOrderItems;
  public readonly purchaseOrderItemReceiving: PurchaseOrderItemReceiving;
  public readonly purchaseApprovals: PurchaseApprovals;

  // Sales entities
  public readonly salesOrders: SalesOrders;
  public readonly salesOrderAttachments: SalesOrderAttachments;

  // Expense entities
  public readonly expenseItems: ExpenseItems;
  public readonly expenseReports: ExpenseReports;
  public readonly expenseItemAttachments: ExpenseItemAttachments;
  public readonly expenseReportAttachments: ExpenseReportAttachments;

  // Order and change entities
  public readonly changeOrderCharges: ChangeOrderCharges;

  // Tax entities
  public readonly taxes: Taxes;
  public readonly taxCategories: TaxCategories;
  public readonly taxRegions: TaxRegions;

  // Currency and payment entities
  public readonly currencies: Currencies;
  public readonly paymentTerms: PaymentTerms;

  // Pricing entities
  public readonly priceListMaterialCodes: PriceListMaterialCodes;
  public readonly priceListProducts: PriceListProducts;
  public readonly priceListProductTiers: PriceListProductTiers;
  public readonly priceListRoles: PriceListRoles;
  public readonly priceListServices: PriceListServices;
  public readonly priceListServiceBundles: PriceListServiceBundles;
  public readonly priceListWorkTypeModifiers: PriceListWorkTypeModifiers;

  constructor(axios: AxiosInstance, logger: winston.Logger) {
    super(axios, logger, 'FinancialClient');

    // Billing entities
    this.billingCodes = new BillingCodes(this.axios, this.logger);
    this.billingItems = new BillingItems(this.axios, this.logger);
    this.billingItemApprovalLevels = new BillingItemApprovalLevels(this.axios, this.logger);

    // Invoice entities
    this.invoices = new Invoices(this.axios, this.logger);
    this.invoiceTemplates = new InvoiceTemplates(this.axios, this.logger);
    this.additionalInvoiceFieldValues = new AdditionalInvoiceFieldValues(this.axios, this.logger);

    // Quote entities
    this.quotes = new Quotes(this.axios, this.logger);
    this.quoteItems = new QuoteItems(this.axios, this.logger);
    this.quoteLocations = new QuoteLocations(this.axios, this.logger);
    this.quoteTemplates = new QuoteTemplates(this.axios, this.logger);

    // Purchase entities
    this.purchaseOrders = new PurchaseOrders(this.axios, this.logger);
    this.purchaseOrderItems = new PurchaseOrderItems(this.axios, this.logger);
    this.purchaseOrderItemReceiving = new PurchaseOrderItemReceiving(this.axios, this.logger);
    this.purchaseApprovals = new PurchaseApprovals(this.axios, this.logger);

    // Sales entities
    this.salesOrders = new SalesOrders(this.axios, this.logger);
    this.salesOrderAttachments = new SalesOrderAttachments(this.axios, this.logger);

    // Expense entities
    this.expenseItems = new ExpenseItems(this.axios, this.logger);
    this.expenseReports = new ExpenseReports(this.axios, this.logger);
    this.expenseItemAttachments = new ExpenseItemAttachments(this.axios, this.logger);
    this.expenseReportAttachments = new ExpenseReportAttachments(this.axios, this.logger);

    // Order and change entities
    this.changeOrderCharges = new ChangeOrderCharges(this.axios, this.logger);

    // Tax entities
    this.taxes = new Taxes(this.axios, this.logger);
    this.taxCategories = new TaxCategories(this.axios, this.logger);
    this.taxRegions = new TaxRegions(this.axios, this.logger);

    // Currency and payment entities
    this.currencies = new Currencies(this.axios, this.logger);
    this.paymentTerms = new PaymentTerms(this.axios, this.logger);

    // Pricing entities
    this.priceListMaterialCodes = new PriceListMaterialCodes(this.axios, this.logger);
    this.priceListProducts = new PriceListProducts(this.axios, this.logger);
    this.priceListProductTiers = new PriceListProductTiers(this.axios, this.logger);
    this.priceListRoles = new PriceListRoles(this.axios, this.logger);
    this.priceListServices = new PriceListServices(this.axios, this.logger);
    this.priceListServiceBundles = new PriceListServiceBundles(this.axios, this.logger);
    this.priceListWorkTypeModifiers = new PriceListWorkTypeModifiers(this.axios, this.logger);
  }

  getName(): string {
    return 'FinancialClient';
  }

  protected async doConnectionTest(): Promise<void> {
    // Test connection with a simple billing codes query
    await this.axios.get('/BillingCodes?$select=id&$top=1');
  }

  // Convenience methods for common financial operations

  /**
   * Get active billing codes
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with active billing codes
   */
  async getActiveBillingCodes(pageSize: number = 500) {
    return this.billingCodes.list({
      filter: [
        {
          op: 'eq',
          field: 'active',
          value: true,
        },
      ],
      pageSize,
    });
  }

  /**
   * Get pending invoices
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with pending invoices
   */
  async getPendingInvoices(pageSize: number = 500) {
    return this.invoices.list({
      filter: [
        {
          op: 'eq',
          field: 'status',
          value: 1, // Pending status
        },
      ],
      pageSize,
    });
  }

  /**
   * Get unpaid invoices
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with unpaid invoices
   */
  async getUnpaidInvoices(pageSize: number = 500) {
    return this.invoices.list({
      filter: [
        {
          op: 'neq',
          field: 'status',
          value: 3, // Paid status
        },
      ],
      pageSize,
    });
  }

  /**
   * Get invoices by company
   * @param companyId - Company ID
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with company invoices
   */
  async getInvoicesByCompany(companyId: number, pageSize: number = 500) {
    return this.invoices.list({
      filter: [
        {
          op: 'eq',
          field: 'accountID',
          value: companyId,
        },
      ],
      pageSize,
    });
  }

  /**
   * Get quotes by company
   * @param companyId - Company ID
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with company quotes
   */
  async getQuotesByCompany(companyId: number, pageSize: number = 500) {
    return this.quotes.list({
      filter: [
        {
          op: 'eq',
          field: 'accountID',
          value: companyId,
        },
      ],
      pageSize,
    });
  }

  /**
   * Get pending quotes
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with pending quotes
   */
  async getPendingQuotes(pageSize: number = 500) {
    return this.quotes.list({
      filter: [
        {
          op: 'eq',
          field: 'quoteStatus',
          value: 1, // Pending status
        },
      ],
      pageSize,
    });
  }

  /**
   * Get recent invoices created within specified days
   * @param days - Number of days to look back (default: 30)
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with recent invoices
   */
  async getRecentInvoices(days: number = 30, pageSize: number = 500) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.invoices.list({
      filter: [
        {
          op: 'gte',
          field: 'createDate',
          value: cutoffDate.toISOString(),
        },
      ],
      pageSize,
      sort: 'createDate desc',
    });
  }

  /**
   * Get recent quotes created within specified days
   * @param days - Number of days to look back (default: 30)
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with recent quotes
   */
  async getRecentQuotes(days: number = 30, pageSize: number = 500) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.quotes.list({
      filter: [
        {
          op: 'gte',
          field: 'createDate',
          value: cutoffDate.toISOString(),
        },
      ],
      pageSize,
      sort: 'createDate desc',
    });
  }

  /**
   * Get recent purchase orders created within specified days
   * @param days - Number of days to look back (default: 30)
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with recent purchase orders
   */
  async getRecentPurchaseOrders(days: number = 30, pageSize: number = 500) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.purchaseOrders.list({
      filter: [
        {
          op: 'gte',
          field: 'createDate',
          value: cutoffDate.toISOString(),
        },
      ],
      pageSize,
      sort: 'createDate desc',
    });
  }

  /**
   * Search billing codes by name or description
   * @param query - Search query string
   * @param searchFields - Fields to search in (default: ['name', 'description'])
   * @param pageSize - Number of records to return (default: 100)
   * @returns Promise with matching billing codes
   */
  async searchBillingCodes(
    query: string,
    searchFields: string[] = ['name', 'description'],
    pageSize: number = 100
  ) {
    const filters = searchFields.map(field => ({
      op: 'contains',
      field,
      value: query,
    }));

    return this.billingCodes.list({
      filter: filters.length === 1 ? filters : [{ op: 'or', items: filters }],
      pageSize,
      sort: 'name asc',
    });
  }

  /**
   * Search invoices by invoice number or description
   * @param query - Search query string
   * @param searchFields - Fields to search in (default: ['invoiceNumber', 'subject'])
   * @param pageSize - Number of records to return (default: 100)
   * @returns Promise with matching invoices
   */
  async searchInvoices(
    query: string,
    searchFields: string[] = ['invoiceNumber', 'subject'],
    pageSize: number = 100
  ) {
    const filters = searchFields.map(field => ({
      op: 'contains',
      field,
      value: query,
    }));

    return this.invoices.list({
      filter: filters.length === 1 ? filters : [{ op: 'or', items: filters }],
      pageSize,
      sort: 'createDate desc',
    });
  }

  /**
   * Get expense reports by company
   * @param companyId - Company ID
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with company expense reports
   */
  async getExpenseReportsByCompany(companyId: number, pageSize: number = 500) {
    return this.expenseReports.list({
      filter: [
        {
          op: 'eq',
          field: 'accountID',
          value: companyId,
        },
      ],
      pageSize,
    });
  }

  /**
   * Get pending purchase orders
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with pending purchase orders
   */
  async getPendingPurchaseOrders(pageSize: number = 500) {
    return this.purchaseOrders.list({
      filter: [
        {
          op: 'eq',
          field: 'status',
          value: 1, // Pending status
        },
      ],
      pageSize,
    });
  }
}