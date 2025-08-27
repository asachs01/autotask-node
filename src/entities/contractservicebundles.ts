import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IContractServiceBundles {
  id?: number;
  [key: string]: any;
}

export interface IContractServiceBundlesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ContractServiceBundles entity class for Autotask API
 * 
 * Service bundles within contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractServiceBundlesEntity.htm}
 */
export class ContractServiceBundles extends BaseEntity {
  private readonly endpoint = '/ContractServiceBundles';

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
        operation: 'createContractServiceBundles',
        requiredParams: ['contractServiceBundles'],
        optionalParams: [],
        returnType: 'IContractServiceBundles',
        endpoint: '/ContractServiceBundles',
      },
      {
        operation: 'getContractServiceBundles',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IContractServiceBundles',
        endpoint: '/ContractServiceBundles/{id}',
      },
      {
        operation: 'updateContractServiceBundles',
        requiredParams: ['id', 'contractServiceBundles'],
        optionalParams: [],
        returnType: 'IContractServiceBundles',
        endpoint: '/ContractServiceBundles/{id}',
      },
      {
        operation: 'deleteContractServiceBundles',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ContractServiceBundles/{id}',
      },
      {
        operation: 'listContractServiceBundles',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IContractServiceBundles[]',
        endpoint: '/ContractServiceBundles',
      }
    ];
  }

  /**
   * Create a new contractservicebundles
   * @param contractServiceBundles - The contractservicebundles data to create
   * @returns Promise with the created contractservicebundles
   */
  async create(contractServiceBundles: IContractServiceBundles): Promise<ApiResponse<IContractServiceBundles>> {
    this.logger.info('Creating contractservicebundles', { contractServiceBundles });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contractServiceBundles),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a contractservicebundles by ID
   * @param id - The contractservicebundles ID
   * @returns Promise with the contractservicebundles data
   */
  async get(id: number): Promise<ApiResponse<IContractServiceBundles>> {
    this.logger.info('Getting contractservicebundles', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a contractservicebundles
   * @param id - The contractservicebundles ID
   * @param contractServiceBundles - The updated contractservicebundles data
   * @returns Promise with the updated contractservicebundles
   */
  async update(
    id: number,
    contractServiceBundles: Partial<IContractServiceBundles>
  ): Promise<ApiResponse<IContractServiceBundles>> {
    this.logger.info('Updating contractservicebundles', { id, contractServiceBundles });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, contractServiceBundles),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a contractservicebundles
   * @param id - The contractservicebundles ID
   * @param contractServiceBundles - The partial contractservicebundles data to update
   * @returns Promise with the updated contractservicebundles
   */
  async patch(
    id: number,
    contractServiceBundles: Partial<IContractServiceBundles>
  ): Promise<ApiResponse<IContractServiceBundles>> {
    this.logger.info('Patching contractservicebundles', { id, contractServiceBundles });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, contractServiceBundles),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a contractservicebundles
   * @param id - The contractservicebundles ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contractservicebundles', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List contractservicebundles with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of contractservicebundles
   */
  async list(query: IContractServiceBundlesQuery = {}): Promise<ApiResponse<IContractServiceBundles[]>> {
    this.logger.info('Listing contractservicebundles', { query });
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