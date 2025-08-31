import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IInventoryLocations {
  id?: number;
  [key: string]: any;
}

export interface IInventoryLocationsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * InventoryLocations entity class for Autotask API
 * 
 * Physical locations for inventory storage
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: inventory
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InventoryLocationsEntity.htm}
 */
export class InventoryLocations extends BaseEntity {
  private readonly endpoint = '/InventoryLocations';

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
        operation: 'createInventoryLocations',
        requiredParams: ['inventoryLocations'],
        optionalParams: [],
        returnType: 'IInventoryLocations',
        endpoint: '/InventoryLocations',
      },
      {
        operation: 'getInventoryLocations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IInventoryLocations',
        endpoint: '/InventoryLocations/{id}',
      },
      {
        operation: 'updateInventoryLocations',
        requiredParams: ['id', 'inventoryLocations'],
        optionalParams: [],
        returnType: 'IInventoryLocations',
        endpoint: '/InventoryLocations/{id}',
      },
      {
        operation: 'deleteInventoryLocations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/InventoryLocations/{id}',
      },
      {
        operation: 'listInventoryLocations',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IInventoryLocations[]',
        endpoint: '/InventoryLocations',
      }
    ];
  }

  /**
   * Create a new inventorylocations
   * @param inventoryLocations - The inventorylocations data to create
   * @returns Promise with the created inventorylocations
   */
  async create(inventoryLocations: IInventoryLocations): Promise<ApiResponse<IInventoryLocations>> {
    this.logger.info('Creating inventorylocations', { inventoryLocations });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, inventoryLocations),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a inventorylocations by ID
   * @param id - The inventorylocations ID
   * @returns Promise with the inventorylocations data
   */
  async get(id: number): Promise<ApiResponse<IInventoryLocations>> {
    this.logger.info('Getting inventorylocations', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a inventorylocations
   * @param id - The inventorylocations ID
   * @param inventoryLocations - The updated inventorylocations data
   * @returns Promise with the updated inventorylocations
   */
  async update(
    id: number,
    inventoryLocations: Partial<IInventoryLocations>
  ): Promise<ApiResponse<IInventoryLocations>> {
    this.logger.info('Updating inventorylocations', { id, inventoryLocations });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, inventoryLocations),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a inventorylocations
   * @param id - The inventorylocations ID
   * @param inventoryLocations - The partial inventorylocations data to update
   * @returns Promise with the updated inventorylocations
   */
  async patch(
    id: number,
    inventoryLocations: Partial<IInventoryLocations>
  ): Promise<ApiResponse<IInventoryLocations>> {
    this.logger.info('Patching inventorylocations', { id, inventoryLocations });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, inventoryLocations),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a inventorylocations
   * @param id - The inventorylocations ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting inventorylocations', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List inventorylocations with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of inventorylocations
   */
  async list(query: IInventoryLocationsQuery = {}): Promise<ApiResponse<IInventoryLocations[]>> {
    this.logger.info('Listing inventorylocations', { query });
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
    if (query.pageSize) searchBody.MaxRecords = query.pageSize;

    return this.executeQueryRequest(
      async () => this.axios.post(`${this.endpoint}/query`, searchBody),
      `${this.endpoint}/query`,
      'POST'
    );
  }
}