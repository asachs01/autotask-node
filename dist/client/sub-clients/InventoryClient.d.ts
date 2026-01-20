import { AxiosInstance } from 'axios';
import winston from 'winston';
import { BaseSubClient } from '../base/BaseSubClient';
import { InventoryItems, InventoryItemSerialNumbers, InventoryLocations, InventoryProducts, InventoryStockedItems, InventoryStockedItemsAdd, InventoryStockedItemsRemove, InventoryStockedItemsTransfer, InventoryTransfers, Products, ProductNotes, ProductTiers, ProductVendors, SubscriptionPeriods, Subscriptions } from '../../entities';
/**
 * InventoryClient handles all inventory and product management entities:
 * - Inventory items and stock management
 * - Product catalog and information
 * - Inventory transfers and transactions
 * - Subscription management
 */
export declare class InventoryClient extends BaseSubClient {
    readonly inventoryItems: InventoryItems;
    readonly inventoryItemSerialNumbers: InventoryItemSerialNumbers;
    readonly inventoryLocations: InventoryLocations;
    readonly inventoryProducts: InventoryProducts;
    readonly inventoryStockedItems: InventoryStockedItems;
    readonly inventoryStockedItemsAdd: InventoryStockedItemsAdd;
    readonly inventoryStockedItemsRemove: InventoryStockedItemsRemove;
    readonly inventoryStockedItemsTransfer: InventoryStockedItemsTransfer;
    readonly inventoryTransfers: InventoryTransfers;
    readonly products: Products;
    readonly productNotes: ProductNotes;
    readonly productTiers: ProductTiers;
    readonly productVendors: ProductVendors;
    readonly subscriptionPeriods: SubscriptionPeriods;
    readonly subscriptions: Subscriptions;
    constructor(axios: AxiosInstance, logger: winston.Logger);
    getName(): string;
    protected doConnectionTest(): Promise<void>;
    /**
     * Get active products
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active products
     */
    getActiveProducts(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/products").IProducts[]>>;
    /**
     * Get active inventory items
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active inventory items
     */
    getActiveInventoryItems(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/inventoryitems").IInventoryItems[]>>;
    /**
     * Get inventory items by location
     * @param locationId - Location ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with location inventory items
     */
    getInventoryItemsByLocation(locationId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/inventoryitems").IInventoryItems[]>>;
    /**
     * Get low stock items (items with stock below minimum)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with low stock items
     */
    getLowStockItems(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/inventoryitems").IInventoryItems[]>>;
    /**
     * Get products by company (for managed products)
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company products
     */
    getProductsByCompany(companyId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/products").IProducts[]>>;
    /**
     * Get recent inventory transfers within specified days
     * @param days - Number of days to look back (default: 7)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent transfers
     */
    getRecentInventoryTransfers(days?: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/inventorytransfers").IInventoryTransfers[]>>;
    /**
     * Get active subscriptions
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active subscriptions
     */
    getActiveSubscriptions(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/subscriptions").ISubscriptions[]>>;
    /**
     * Get subscriptions by company
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company subscriptions
     */
    getSubscriptionsByCompany(companyId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/subscriptions").ISubscriptions[]>>;
    /**
     * Search products by name or description
     * @param query - Search query string
     * @param searchFields - Fields to search in (default: ['name', 'description'])
     * @param pageSize - Number of records to return (default: 100)
     * @returns Promise with matching products
     */
    searchProducts(query: string, searchFields?: string[], pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/products").IProducts[]>>;
    /**
     * Search inventory items by name or part number
     * @param query - Search query string
     * @param searchFields - Fields to search in (default: ['name', 'partNumber'])
     * @param pageSize - Number of records to return (default: 100)
     * @returns Promise with matching inventory items
     */
    searchInventoryItems(query: string, searchFields?: string[], pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/inventoryitems").IInventoryItems[]>>;
    /**
     * Get out of stock items
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with out of stock items
     */
    getOutOfStockItems(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/inventoryitems").IInventoryItems[]>>;
    /**
     * Get recent product changes within specified days
     * @param days - Number of days to look back (default: 30)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recently modified products
     */
    getRecentProductChanges(days?: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/products").IProducts[]>>;
}
//# sourceMappingURL=InventoryClient.d.ts.map