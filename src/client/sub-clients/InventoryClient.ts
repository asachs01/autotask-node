import { AxiosInstance } from 'axios';
import winston from 'winston';
import { BaseSubClient } from '../base/BaseSubClient';
import {
  // Inventory management
  InventoryItems,
  InventoryItemSerialNumbers,
  InventoryLocations,
  InventoryProducts,
  InventoryStockedItems,
  InventoryStockedItemsAdd,
  InventoryStockedItemsRemove,
  InventoryStockedItemsTransfer,
  InventoryTransfers,
  // Products
  Products,
  ProductNotes,
  ProductTiers,
  ProductVendors,
  // Subscriptions
  SubscriptionPeriods,
  Subscriptions,
} from '../../entities';

/**
 * InventoryClient handles all inventory and product management entities:
 * - Inventory items and stock management
 * - Product catalog and information
 * - Inventory transfers and transactions
 * - Subscription management
 */
export class InventoryClient extends BaseSubClient {
  // Inventory management
  public readonly inventoryItems: InventoryItems;
  public readonly inventoryItemSerialNumbers: InventoryItemSerialNumbers;
  public readonly inventoryLocations: InventoryLocations;
  public readonly inventoryProducts: InventoryProducts;
  public readonly inventoryStockedItems: InventoryStockedItems;
  public readonly inventoryStockedItemsAdd: InventoryStockedItemsAdd;
  public readonly inventoryStockedItemsRemove: InventoryStockedItemsRemove;
  public readonly inventoryStockedItemsTransfer: InventoryStockedItemsTransfer;
  public readonly inventoryTransfers: InventoryTransfers;

  // Products
  public readonly products: Products;
  public readonly productNotes: ProductNotes;
  public readonly productTiers: ProductTiers;
  public readonly productVendors: ProductVendors;

  // Subscriptions
  public readonly subscriptionPeriods: SubscriptionPeriods;
  public readonly subscriptions: Subscriptions;

  constructor(axios: AxiosInstance, logger: winston.Logger) {
    super(axios, logger, 'InventoryClient');

    // Inventory management
    this.inventoryItems = new InventoryItems(this.axios, this.logger);
    this.inventoryItemSerialNumbers = new InventoryItemSerialNumbers(this.axios, this.logger);
    this.inventoryLocations = new InventoryLocations(this.axios, this.logger);
    this.inventoryProducts = new InventoryProducts(this.axios, this.logger);
    this.inventoryStockedItems = new InventoryStockedItems(this.axios, this.logger);
    this.inventoryStockedItemsAdd = new InventoryStockedItemsAdd(this.axios, this.logger);
    this.inventoryStockedItemsRemove = new InventoryStockedItemsRemove(this.axios, this.logger);
    this.inventoryStockedItemsTransfer = new InventoryStockedItemsTransfer(this.axios, this.logger);
    this.inventoryTransfers = new InventoryTransfers(this.axios, this.logger);

    // Products
    this.products = new Products(this.axios, this.logger);
    this.productNotes = new ProductNotes(this.axios, this.logger);
    this.productTiers = new ProductTiers(this.axios, this.logger);
    this.productVendors = new ProductVendors(this.axios, this.logger);

    // Subscriptions
    this.subscriptionPeriods = new SubscriptionPeriods(this.axios, this.logger);
    this.subscriptions = new Subscriptions(this.axios, this.logger);
  }

  getName(): string {
    return 'InventoryClient';
  }

  protected async doConnectionTest(): Promise<void> {
    // Test connection with a simple products query
    await this.axios.get('/Products?$select=id&$top=1');
  }


  // Convenience methods for common operations

  /**
   * Get active products
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with active products
   */
  async getActiveProducts(pageSize: number = 500) {
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
  async getActiveInventoryItems(pageSize: number = 500) {
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
  async getInventoryItemsByLocation(locationId: number, pageSize: number = 500) {
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
  async getLowStockItems(pageSize: number = 500) {
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
  async getProductsByCompany(companyId: number, pageSize: number = 500) {
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
  async getRecentInventoryTransfers(days: number = 7, pageSize: number = 500) {
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
  async getActiveSubscriptions(pageSize: number = 500) {
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
  async getSubscriptionsByCompany(companyId: number, pageSize: number = 500) {
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
  async searchProducts(
    query: string,
    searchFields: string[] = ['name', 'description'],
    pageSize: number = 100
  ) {
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
  async searchInventoryItems(
    query: string,
    searchFields: string[] = ['name', 'partNumber'],
    pageSize: number = 100
  ) {
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
  async getOutOfStockItems(pageSize: number = 500) {
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
  async getRecentProductChanges(days: number = 30, pageSize: number = 500) {
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
