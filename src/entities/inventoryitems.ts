import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IInventoryItems {
  id?: number;
  [key: string]: any;
}

export interface IInventoryItemsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * InventoryItems entity class for Autotask API
 * 
 * Items in inventory
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: inventory
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InventoryItemsEntity.htm}
 */
export class InventoryItems extends BaseEntity {
  private readonly endpoint = '/InventoryItems';

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
        operation: 'createInventoryItems',
        requiredParams: ['inventoryItems'],
        optionalParams: [],
        returnType: 'IInventoryItems',
        endpoint: '/InventoryItems',
      },
      {
        operation: 'getInventoryItems',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IInventoryItems',
        endpoint: '/InventoryItems/{id}',
      },
      {
        operation: 'updateInventoryItems',
        requiredParams: ['id', 'inventoryItems'],
        optionalParams: [],
        returnType: 'IInventoryItems',
        endpoint: '/InventoryItems/{id}',
      },
      {
        operation: 'deleteInventoryItems',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/InventoryItems/{id}',
      },
      {
        operation: 'listInventoryItems',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IInventoryItems[]',
        endpoint: '/InventoryItems',
      }
    ];
  }

  /**
   * Create a new inventoryitems
   * @param inventoryItems - The inventoryitems data to create
   * @returns Promise with the created inventoryitems
   */
  async create(inventoryItems: IInventoryItems): Promise<ApiResponse<IInventoryItems>> {
    this.logger.info('Creating inventoryitems', { inventoryItems });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, inventoryItems),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a inventoryitems by ID
   * @param id - The inventoryitems ID
   * @returns Promise with the inventoryitems data
   */
  async get(id: number): Promise<ApiResponse<IInventoryItems>> {
    this.logger.info('Getting inventoryitems', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a inventoryitems
   * @param id - The inventoryitems ID
   * @param inventoryItems - The updated inventoryitems data
   * @returns Promise with the updated inventoryitems
   */
  async update(
    id: number,
    inventoryItems: Partial<IInventoryItems>
  ): Promise<ApiResponse<IInventoryItems>> {
    this.logger.info('Updating inventoryitems', { id, inventoryItems });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, inventoryItems),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a inventoryitems
   * @param id - The inventoryitems ID
   * @param inventoryItems - The partial inventoryitems data to update
   * @returns Promise with the updated inventoryitems
   */
  async patch(
    id: number,
    inventoryItems: Partial<IInventoryItems>
  ): Promise<ApiResponse<IInventoryItems>> {
    this.logger.info('Patching inventoryitems', { id, inventoryItems });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, inventoryItems),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a inventoryitems
   * @param id - The inventoryitems ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting inventoryitems', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List inventoryitems with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of inventoryitems
   */
  async list(query: IInventoryItemsQuery = {}): Promise<ApiResponse<IInventoryItems[]>> {
    this.logger.info('Listing inventoryitems', { query });
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