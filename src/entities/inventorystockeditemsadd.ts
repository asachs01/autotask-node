import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IInventoryStockedItemsAdd {
  id?: number;
  [key: string]: any;
}

export interface IInventoryStockedItemsAddQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * InventoryStockedItemsAdd entity class for Autotask API
 * 
 * Add items to inventory stock
 * Supported Operations: POST
 * Category: inventory
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InventoryStockedItemsAdd.htm}
 */
export class InventoryStockedItemsAdd extends BaseEntity {
  private readonly endpoint = '/InventoryStockedItemsAdd';

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
        operation: 'createInventoryStockedItemsAdd',
        requiredParams: ['inventoryStockedItemsAdd'],
        optionalParams: [],
        returnType: 'IInventoryStockedItemsAdd',
        endpoint: '/InventoryStockedItemsAdd',
      },
      {
        operation: 'listInventoryStockedItemsAdd',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IInventoryStockedItemsAdd[]',
        endpoint: '/InventoryStockedItemsAdd',
      }
    ];
  }

  /**
   * Create a new inventorystockeditemsadd
   * @param inventoryStockedItemsAdd - The inventorystockeditemsadd data to create
   * @returns Promise with the created inventorystockeditemsadd
   */
  async create(inventoryStockedItemsAdd: IInventoryStockedItemsAdd): Promise<ApiResponse<IInventoryStockedItemsAdd>> {
    this.logger.info('Creating inventorystockeditemsadd', { inventoryStockedItemsAdd });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, inventoryStockedItemsAdd),
      this.endpoint,
      'POST'
    );
  }

  /**
   * List inventorystockeditemsadd with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of inventorystockeditemsadd
   */
  async list(query: IInventoryStockedItemsAddQuery = {}): Promise<ApiResponse<IInventoryStockedItemsAdd[]>> {
    this.logger.info('Listing inventorystockeditemsadd', { query });
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
          // Handle nested objects like { id: { gte: 0 } }
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // Extract operator and value from nested object
            const [op, val] = Object.entries(value)[0] as [string, any];
            filterArray.push({
              op: op,
              field: field,
              value: val,
            });
          } else {
            filterArray.push({
              op: 'eq',
              field: field,
              value: value,
            });
          }
        }
        searchBody.filter = filterArray;
      } else {
        searchBody.filter = query.filter;
      }
    }

    if (query.sort) searchBody.sort = query.sort;
    if (query.page) searchBody.page = query.page;
    if (query.pageSize) searchBody.maxRecords = query.pageSize;

    return this.executeQueryRequest(
      async () => this.axios.post(`${this.endpoint}/query`, searchBody),
      `${this.endpoint}/query`,
      'POST'
    );
  }
}