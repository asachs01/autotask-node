"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialClient = void 0;
const BaseSubClient_1 = require("../base/BaseSubClient");
const entities_1 = require("../../entities");
/**
 * FinancialClient handles all financial and billing-related entities:
 * - Invoicing and billing
 * - Quotes and estimates
 * - Purchase orders and procurement
 * - Expenses and expense reports
 * - Tax calculations and currencies
 * - Pricing and rate management
 */
class FinancialClient extends BaseSubClient_1.BaseSubClient {
    constructor(axios, logger) {
        super(axios, logger, 'FinancialClient');
        // Billing entities
        this.billingCodes = new entities_1.BillingCodes(this.axios, this.logger);
        this.billingItems = new entities_1.BillingItems(this.axios, this.logger);
        this.billingItemApprovalLevels = new entities_1.BillingItemApprovalLevels(this.axios, this.logger);
        // Invoice entities
        this.invoices = new entities_1.Invoices(this.axios, this.logger);
        this.invoiceTemplates = new entities_1.InvoiceTemplates(this.axios, this.logger);
        this.additionalInvoiceFieldValues = new entities_1.AdditionalInvoiceFieldValues(this.axios, this.logger);
        // Quote entities
        this.quotes = new entities_1.Quotes(this.axios, this.logger);
        this.quoteItems = new entities_1.QuoteItems(this.axios, this.logger);
        this.quoteLocations = new entities_1.QuoteLocations(this.axios, this.logger);
        this.quoteTemplates = new entities_1.QuoteTemplates(this.axios, this.logger);
        // Purchase entities
        this.purchaseOrders = new entities_1.PurchaseOrders(this.axios, this.logger);
        this.purchaseOrderItems = new entities_1.PurchaseOrderItems(this.axios, this.logger);
        this.purchaseOrderItemReceiving = new entities_1.PurchaseOrderItemReceiving(this.axios, this.logger);
        this.purchaseApprovals = new entities_1.PurchaseApprovals(this.axios, this.logger);
        // Sales entities
        this.salesOrders = new entities_1.SalesOrders(this.axios, this.logger);
        this.salesOrderAttachments = new entities_1.SalesOrderAttachments(this.axios, this.logger);
        // Expense entities
        this.expenseItems = new entities_1.ExpenseItems(this.axios, this.logger);
        this.expenseReports = new entities_1.ExpenseReports(this.axios, this.logger);
        this.expenseItemAttachments = new entities_1.ExpenseItemAttachments(this.axios, this.logger);
        this.expenseReportAttachments = new entities_1.ExpenseReportAttachments(this.axios, this.logger);
        // Order and change entities
        this.changeOrderCharges = new entities_1.ChangeOrderCharges(this.axios, this.logger);
        // Tax entities
        this.taxes = new entities_1.Taxes(this.axios, this.logger);
        this.taxCategories = new entities_1.TaxCategories(this.axios, this.logger);
        this.taxRegions = new entities_1.TaxRegions(this.axios, this.logger);
        // Currency and payment entities
        this.currencies = new entities_1.Currencies(this.axios, this.logger);
        this.paymentTerms = new entities_1.PaymentTerms(this.axios, this.logger);
        // Pricing entities
        this.priceListMaterialCodes = new entities_1.PriceListMaterialCodes(this.axios, this.logger);
        this.priceListProducts = new entities_1.PriceListProducts(this.axios, this.logger);
        this.priceListProductTiers = new entities_1.PriceListProductTiers(this.axios, this.logger);
        this.priceListRoles = new entities_1.PriceListRoles(this.axios, this.logger);
        this.priceListServices = new entities_1.PriceListServices(this.axios, this.logger);
        this.priceListServiceBundles = new entities_1.PriceListServiceBundles(this.axios, this.logger);
        this.priceListWorkTypeModifiers = new entities_1.PriceListWorkTypeModifiers(this.axios, this.logger);
    }
    getName() {
        return 'FinancialClient';
    }
    async doConnectionTest() {
        // Test connection with a simple billing codes query
        await this.axios.get('/BillingCodes?$select=id&$top=1');
    }
    // Convenience methods for common financial operations
    /**
     * Get active billing codes
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active billing codes
     */
    async getActiveBillingCodes(pageSize = 500) {
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
    async getPendingInvoices(pageSize = 500) {
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
    async getUnpaidInvoices(pageSize = 500) {
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
    async getInvoicesByCompany(companyId, pageSize = 500) {
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
    async getQuotesByCompany(companyId, pageSize = 500) {
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
    async getPendingQuotes(pageSize = 500) {
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
    async getRecentInvoices(days = 30, pageSize = 500) {
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
    async getRecentQuotes(days = 30, pageSize = 500) {
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
    async getRecentPurchaseOrders(days = 30, pageSize = 500) {
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
    async searchBillingCodes(query, searchFields = ['name', 'description'], pageSize = 100) {
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
    async searchInvoices(query, searchFields = ['invoiceNumber', 'subject'], pageSize = 100) {
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
    async getExpenseReportsByCompany(companyId, pageSize = 500) {
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
    async getPendingPurchaseOrders(pageSize = 500) {
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
exports.FinancialClient = FinancialClient;
//# sourceMappingURL=FinancialClient.js.map