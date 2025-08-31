import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IConfigurationItemBillingProductAssociations {
  id?: number;
  [key: string]: any;
}

export interface IConfigurationItemBillingProductAssociationsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ConfigurationItemBillingProductAssociations entity class for Autotask API
 * 
 * Associations between configuration items and billing products
 * Supported Operations: GET, POST, DELETE
 * Category: configuration
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ConfigurationItemBillingProductAssociationsEntity.htm}
 */
export class ConfigurationItemBillingProductAssociations extends BaseEntity {
  private readonly endpoint = '/ConfigurationItemBillingProductAssociations';

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
        operation: 'createConfigurationItemBillingProductAssociations',
        requiredParams: ['configurationItemBillingProductAssociations'],
        optionalParams: [],
        returnType: 'IConfigurationItemBillingProductAssociations',
        endpoint: '/ConfigurationItemBillingProductAssociations',
      },
      {
        operation: 'getConfigurationItemBillingProductAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IConfigurationItemBillingProductAssociations',
        endpoint: '/ConfigurationItemBillingProductAssociations/{id}',
      },
      {
        operation: 'deleteConfigurationItemBillingProductAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ConfigurationItemBillingProductAssociations/{id}',
      },
      {
        operation: 'listConfigurationItemBillingProductAssociations',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IConfigurationItemBillingProductAssociations[]',
        endpoint: '/ConfigurationItemBillingProductAssociations',
      }
    ];
  }

  /**
   * Create a new configurationitembillingproductassociations
   * @param configurationItemBillingProductAssociations - The configurationitembillingproductassociations data to create
   * @returns Promise with the created configurationitembillingproductassociations
   */
  async create(configurationItemBillingProductAssociations: IConfigurationItemBillingProductAssociations): Promise<ApiResponse<IConfigurationItemBillingProductAssociations>> {
    this.logger.info('Creating configurationitembillingproductassociations', { configurationItemBillingProductAssociations });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, configurationItemBillingProductAssociations),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a configurationitembillingproductassociations by ID
   * @param id - The configurationitembillingproductassociations ID
   * @returns Promise with the configurationitembillingproductassociations data
   */
  async get(id: number): Promise<ApiResponse<IConfigurationItemBillingProductAssociations>> {
    this.logger.info('Getting configurationitembillingproductassociations', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a configurationitembillingproductassociations
   * @param id - The configurationitembillingproductassociations ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting configurationitembillingproductassociations', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List configurationitembillingproductassociations with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of configurationitembillingproductassociations
   */
  async list(query: IConfigurationItemBillingProductAssociationsQuery = {}): Promise<ApiResponse<IConfigurationItemBillingProductAssociations[]>> {
    this.logger.info('Listing configurationitembillingproductassociations', { query });
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