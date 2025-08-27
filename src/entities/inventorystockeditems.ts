import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IInventoryStockedItems {
  id?: number;
  [key: string]: any;
}

export interface IInventoryStockedItemsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * InventoryStockedItems entity class for Autotask API
 * 
 * Items currently stocked in inventory
 * Supported Operations: GET
 * Category: inventory
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InventoryStockedItems.htm}
 */
export class InventoryStockedItems extends BaseEntity {
  private readonly endpoint = '/InventoryStockedItems';

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
        operation: 'getInventoryStockedItems',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IInventoryStockedItems',
        endpoint: '/InventoryStockedItems/{id}',
      },
      {
        operation: 'listInventoryStockedItems',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IInventoryStockedItems[]',
        endpoint: '/InventoryStockedItems',
      }
    ];
  }

  /**
   * Get a inventorystockeditems by ID
   * @param id - The inventorystockeditems ID
   * @returns Promise with the inventorystockeditems data
   */
  async get(id: number): Promise<ApiResponse<IInventoryStockedItems>> {
    this.logger.info('Getting inventorystockeditems', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List inventorystockeditems with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of inventorystockeditems
   */
  async list(query: IInventoryStockedItemsQuery = {}): Promise<ApiResponse<IInventoryStockedItems[]>> {
    this.logger.info('Listing inventorystockeditems', { query });
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