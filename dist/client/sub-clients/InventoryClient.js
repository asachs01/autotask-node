"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryClient = void 0;
const BaseSubClient_1 = require("../base/BaseSubClient");
const entities_1 = require("../../entities");
/**
 * InventoryClient handles all inventory and product management entities:
 * - Inventory items and stock management
 * - Product catalog and information
 * - Inventory transfers and transactions
 * - Subscription management
 */
class InventoryClient extends BaseSubClient_1.BaseSubClient {
    constructor(axios, logger) {
        super(axios, logger, 'InventoryClient');
        // Inventory management
        this.inventoryItems = new entities_1.InventoryItems(this.axios, this.logger);
        this.inventoryItemSerialNumbers = new entities_1.InventoryItemSerialNumbers(this.axios, this.logger);
        this.inventoryLocations = new entities_1.InventoryLocations(this.axios, this.logger);
        this.inventoryProducts = new entities_1.InventoryProducts(this.axios, this.logger);
        this.inventoryStockedItems = new entities_1.InventoryStockedItems(this.axios, this.logger);
        this.inventoryStockedItemsAdd = new entities_1.InventoryStockedItemsAdd(this.axios, this.logger);
        this.inventoryStockedItemsRemove = new entities_1.InventoryStockedItemsRemove(this.axios, this.logger);
        this.inventoryStockedItemsTransfer = new entities_1.InventoryStockedItemsTransfer(this.axios, this.logger);
        this.inventoryTransfers = new entities_1.InventoryTransfers(this.axios, this.logger);
        // Products
        this.products = new entities_1.Products(this.axios, this.logger);
        this.productNotes = new entities_1.ProductNotes(this.axios, this.logger);
        this.productTiers = new entities_1.ProductTiers(this.axios, this.logger);
        this.productVendors = new entities_1.ProductVendors(this.axios, this.logger);
        // Subscriptions
        this.subscriptionPeriods = new entities_1.SubscriptionPeriods(this.axios, this.logger);
        this.subscriptions = new entities_1.Subscriptions(this.axios, this.logger);
    }
    getName() {
        return 'InventoryClient';
    }
    async doConnectionTest() {
        // Test connection with a simple products query
        await this.axios.get('/Products?$select=id&$top=1');
    }
    // Convenience methods for common operations
    /**
     * Get active products
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active products
     */
    async getActiveProducts(pageSize = 500) {
        return this.products.list({
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
     * Get active inventory items
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active inventory items
     */
    async getActiveInventoryItems(pageSize = 500) {
        return this.inventoryItems.list({
            filter: [
                {
                    op: 'eq',
                    field: 'isActive',
                    value: true,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get inventory items by location
     * @param locationId - Location ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with location inventory items
     */
    async getInventoryItemsByLocation(locationId, pageSize = 500) {
        return this.inventoryItems.list({
            filter: [
                {
                    op: 'eq',
                    field: 'locationID',
                    value: locationId,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get low stock items (items with stock below minimum)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with low stock items
     */
    async getLowStockItems(pageSize = 500) {
        return this.inventoryItems.list({
            filter: [
                {
                    op: 'lt',
                    field: 'quantityOnHand',
                    value: '{{minimumQuantity}}', // This would need to be dynamically calculated
                },
            ],
            pageSize,
        });
    }
    /**
     * Get products by company (for managed products)
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company products
     */
    async getProductsByCompany(companyId, pageSize = 500) {
        return this.products.list({
            filter: [
                {
                    op: 'eq',
                    field: 'defaultAccountID',
                    value: companyId,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get recent inventory transfers within specified days
     * @param days - Number of days to look back (default: 7)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent transfers
     */
    async getRecentInventoryTransfers(days = 7, pageSize = 500) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return this.inventoryTransfers.list({
            filter: [
                {
                    op: 'gte',
                    field: 'transferDate',
                    value: cutoffDate.toISOString(),
                },
            ],
            pageSize,
            sort: 'transferDate desc',
        });
    }
    /**
     * Get active subscriptions
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active subscriptions
     */
    async getActiveSubscriptions(pageSize = 500) {
        return this.subscriptions.list({
            filter: [
                {
                    op: 'eq',
                    field: 'status',
                    value: 'Active',
                },
            ],
            pageSize,
        });
    }
    /**
     * Get subscriptions by company
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company subscriptions
     */
    async getSubscriptionsByCompany(companyId, pageSize = 500) {
        return this.subscriptions.list({
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
     * Search products by name or description
     * @param query - Search query string
     * @param searchFields - Fields to search in (default: ['name', 'description'])
     * @param pageSize - Number of records to return (default: 100)
     * @returns Promise with matching products
     */
    async searchProducts(query, searchFields = ['name', 'description'], pageSize = 100) {
        const filters = searchFields.map(field => ({
            op: 'contains',
            field,
            value: query,
        }));
        return this.products.list({
            filter: filters.length === 1 ? filters : [{ op: 'or', items: filters }],
            pageSize,
            sort: 'name asc',
        });
    }
    /**
     * Search inventory items by name or part number
     * @param query - Search query string
     * @param searchFields - Fields to search in (default: ['name', 'partNumber'])
     * @param pageSize - Number of records to return (default: 100)
     * @returns Promise with matching inventory items
     */
    async searchInventoryItems(query, searchFields = ['name', 'partNumber'], pageSize = 100) {
        const filters = searchFields.map(field => ({
            op: 'contains',
            field,
            value: query,
        }));
        return this.inventoryItems.list({
            filter: filters.length === 1 ? filters : [{ op: 'or', items: filters }],
            pageSize,
            sort: 'name asc',
        });
    }
    /**
     * Get out of stock items
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with out of stock items
     */
    async getOutOfStockItems(pageSize = 500) {
        return this.inventoryItems.list({
            filter: [
                {
                    op: 'eq',
                    field: 'quantityOnHand',
                    value: 0,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get recent product changes within specified days
     * @param days - Number of days to look back (default: 30)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recently modified products
     */
    async getRecentProductChanges(days = 30, pageSize = 500) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return this.products.list({
            filter: [
                {
                    op: 'gte',
                    field: 'lastModifiedDate',
                    value: cutoffDate.toISOString(),
                },
            ],
            pageSize,
            sort: 'lastModifiedDate desc',
        });
    }
}
exports.InventoryClient = InventoryClient;
//# sourceMappingURL=InventoryClient.js.map