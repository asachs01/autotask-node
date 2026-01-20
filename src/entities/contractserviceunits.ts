import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IContractServiceUnits {
  id?: number;
  [key: string]: any;
}

export interface IContractServiceUnitsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ContractServiceUnits entity class for Autotask API
 * 
 * Units for contract services
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractServiceUnitsEntity.htm}
 */
export class ContractServiceUnits extends BaseEntity {
  private readonly endpoint = '/ContractServiceUnits';

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
        operation: 'createContractServiceUnits',
        requiredParams: ['contractServiceUnits'],
        optionalParams: [],
        returnType: 'IContractServiceUnits',
        endpoint: '/ContractServiceUnits',
      },
      {
        operation: 'getContractServiceUnits',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IContractServiceUnits',
        endpoint: '/ContractServiceUnits/{id}',
      },
      {
        operation: 'updateContractServiceUnits',
        requiredParams: ['id', 'contractServiceUnits'],
        optionalParams: [],
        returnType: 'IContractServiceUnits',
        endpoint: '/ContractServiceUnits/{id}',
      },
      {
        operation: 'deleteContractServiceUnits',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ContractServiceUnits/{id}',
      },
      {
        operation: 'listContractServiceUnits',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IContractServiceUnits[]',
        endpoint: '/ContractServiceUnits',
      }
    ];
  }

  /**
   * Create a new contractserviceunits
   * @param contractServiceUnits - The contractserviceunits data to create
   * @returns Promise with the created contractserviceunits
   */
  async create(contractServiceUnits: IContractServiceUnits): Promise<ApiResponse<IContractServiceUnits>> {
    this.logger.info('Creating contractserviceunits', { contractServiceUnits });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contractServiceUnits),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a contractserviceunits by ID
   * @param id - The contractserviceunits ID
   * @returns Promise with the contractserviceunits data
   */
  async get(id: number): Promise<ApiResponse<IContractServiceUnits>> {
    this.logger.info('Getting contractserviceunits', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a contractserviceunits
   * @param id - The contractserviceunits ID
   * @param contractServiceUnits - The updated contractserviceunits data
   * @returns Promise with the updated contractserviceunits
   */
  async update(
    id: number,
    contractServiceUnits: Partial<IContractServiceUnits>
  ): Promise<ApiResponse<IContractServiceUnits>> {
    this.logger.info('Updating contractserviceunits', { id, contractServiceUnits });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, contractServiceUnits),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a contractserviceunits
   * @param id - The contractserviceunits ID
   * @param contractServiceUnits - The partial contractserviceunits data to update
   * @returns Promise with the updated contractserviceunits
   */
  async patch(
    id: number,
    contractServiceUnits: Partial<IContractServiceUnits>
  ): Promise<ApiResponse<IContractServiceUnits>> {
    this.logger.info('Patching contractserviceunits', { id, contractServiceUnits });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, contractServiceUnits),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a contractserviceunits
   * @param id - The contractserviceunits ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contractserviceunits', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List contractserviceunits with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of contractserviceunits
   */
  async list(query: IContractServiceUnitsQuery = {}): Promise<ApiResponse<IContractServiceUnits[]>> {
    this.logger.info('Listing contractserviceunits', { query });
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