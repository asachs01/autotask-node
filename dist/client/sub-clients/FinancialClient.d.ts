import { AxiosInstance } from 'axios';
import winston from 'winston';
import { BaseSubClient } from '../base/BaseSubClient';
import { BillingCodes, BillingItems, BillingItemApprovalLevels, Invoices, InvoiceTemplates, AdditionalInvoiceFieldValues, Quotes, QuoteItems, QuoteLocations, QuoteTemplates, PurchaseOrders, PurchaseOrderItems, PurchaseOrderItemReceiving, PurchaseApprovals, SalesOrders, SalesOrderAttachments, ExpenseItems, ExpenseReports, ExpenseItemAttachments, ExpenseReportAttachments, ChangeOrderCharges, Taxes, TaxCategories, TaxRegions, Currencies, PaymentTerms, PriceListMaterialCodes, PriceListProducts, PriceListProductTiers, PriceListRoles, PriceListServices, PriceListServiceBundles, PriceListWorkTypeModifiers } from '../../entities';
/**
 * FinancialClient handles all financial and billing-related entities:
 * - Invoicing and billing
 * - Quotes and estimates
 * - Purchase orders and procurement
 * - Expenses and expense reports
 * - Tax calculations and currencies
 * - Pricing and rate management
 */
export declare class FinancialClient extends BaseSubClient {
    readonly billingCodes: BillingCodes;
    readonly billingItems: BillingItems;
    readonly billingItemApprovalLevels: BillingItemApprovalLevels;
    readonly invoices: Invoices;
    readonly invoiceTemplates: InvoiceTemplates;
    readonly additionalInvoiceFieldValues: AdditionalInvoiceFieldValues;
    readonly quotes: Quotes;
    readonly quoteItems: QuoteItems;
    readonly quoteLocations: QuoteLocations;
    readonly quoteTemplates: QuoteTemplates;
    readonly purchaseOrders: PurchaseOrders;
    readonly purchaseOrderItems: PurchaseOrderItems;
    readonly purchaseOrderItemReceiving: PurchaseOrderItemReceiving;
    readonly purchaseApprovals: PurchaseApprovals;
    readonly salesOrders: SalesOrders;
    readonly salesOrderAttachments: SalesOrderAttachments;
    readonly expenseItems: ExpenseItems;
    readonly expenseReports: ExpenseReports;
    readonly expenseItemAttachments: ExpenseItemAttachments;
    readonly expenseReportAttachments: ExpenseReportAttachments;
    readonly changeOrderCharges: ChangeOrderCharges;
    readonly taxes: Taxes;
    readonly taxCategories: TaxCategories;
    readonly taxRegions: TaxRegions;
    readonly currencies: Currencies;
    readonly paymentTerms: PaymentTerms;
    readonly priceListMaterialCodes: PriceListMaterialCodes;
    readonly priceListProducts: PriceListProducts;
    readonly priceListProductTiers: PriceListProductTiers;
    readonly priceListRoles: PriceListRoles;
    readonly priceListServices: PriceListServices;
    readonly priceListServiceBundles: PriceListServiceBundles;
    readonly priceListWorkTypeModifiers: PriceListWorkTypeModifiers;
    constructor(axios: AxiosInstance, logger: winston.Logger);
    getName(): string;
    protected doConnectionTest(): Promise<void>;
    /**
     * Get active billing codes
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active billing codes
     */
    getActiveBillingCodes(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/billingcodes").IBillingCodes[]>>;
    /**
     * Get pending invoices
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with pending invoices
     */
    getPendingInvoices(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/invoices").IInvoices[]>>;
    /**
     * Get unpaid invoices
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with unpaid invoices
     */
    getUnpaidInvoices(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/invoices").IInvoices[]>>;
    /**
     * Get invoices by company
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company invoices
     */
    getInvoicesByCompany(companyId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/invoices").IInvoices[]>>;
    /**
     * Get quotes by company
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company quotes
     */
    getQuotesByCompany(companyId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/quotes").IQuotes[]>>;
    /**
     * Get pending quotes
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with pending quotes
     */
    getPendingQuotes(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/quotes").IQuotes[]>>;
    /**
     * Get recent invoices created within specified days
     * @param days - Number of days to look back (default: 30)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent invoices
     */
    getRecentInvoices(days?: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/invoices").IInvoices[]>>;
    /**
     * Get recent quotes created within specified days
     * @param days - Number of days to look back (default: 30)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent quotes
     */
    getRecentQuotes(days?: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/quotes").IQuotes[]>>;
    /**
     * Get recent purchase orders created within specified days
     * @param days - Number of days to look back (default: 30)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent purchase orders
     */
    getRecentPurchaseOrders(days?: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/purchaseorders").IPurchaseOrders[]>>;
    /**
     * Search billing codes by name or description
     * @param query - Search query string
     * @param searchFields - Fields to search in (default: ['name', 'description'])
     * @param pageSize - Number of records to return (default: 100)
     * @returns Promise with matching billing codes
     */
    searchBillingCodes(query: string, searchFields?: string[], pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/billingcodes").IBillingCodes[]>>;
    /**
     * Search invoices by invoice number or description
     * @param query - Search query string
     * @param searchFields - Fields to search in (default: ['invoiceNumber', 'subject'])
     * @param pageSize - Number of records to return (default: 100)
     * @returns Promise with matching invoices
     */
    searchInvoices(query: string, searchFields?: string[], pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/invoices").IInvoices[]>>;
    /**
     * Get expense reports by company
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company expense reports
     */
    getExpenseReportsByCompany(companyId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/expensereports").IExpenseReports[]>>;
    /**
     * Get pending purchase orders
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with pending purchase orders
     */
    getPendingPurchaseOrders(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/purchaseorders").IPurchaseOrders[]>>;
}
//# sourceMappingURL=FinancialClient.d.ts.map