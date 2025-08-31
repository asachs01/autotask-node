import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IContractCharges {
  id?: number;
  [key: string]: any;
}

export interface IContractChargesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ContractCharges entity class for Autotask API
 * 
 * Charges associated with contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractChargesEntity.htm}
 */
export class ContractCharges extends BaseEntity {
  private readonly endpoint = '/ContractCharges';

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
        operation: 'createContractCharges',
        requiredParams: ['contractCharges'],
        optionalParams: [],
        returnType: 'IContractCharges',
        endpoint: '/ContractCharges',
      },
      {
        operation: 'getContractCharges',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IContractCharges',
        endpoint: '/ContractCharges/{id}',
      },
      {
        operation: 'updateContractCharges',
        requiredParams: ['id', 'contractCharges'],
        optionalParams: [],
        returnType: 'IContractCharges',
        endpoint: '/ContractCharges/{id}',
      },
      {
        operation: 'deleteContractCharges',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ContractCharges/{id}',
      },
      {
        operation: 'listContractCharges',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IContractCharges[]',
        endpoint: '/ContractCharges',
      }
    ];
  }

  /**
   * Create a new contractcharges
   * @param contractCharges - The contractcharges data to create
   * @returns Promise with the created contractcharges
   */
  async create(contractCharges: IContractCharges): Promise<ApiResponse<IContractCharges>> {
    this.logger.info('Creating contractcharges', { contractCharges });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contractCharges),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a contractcharges by ID
   * @param id - The contractcharges ID
   * @returns Promise with the contractcharges data
   */
  async get(id: number): Promise<ApiResponse<IContractCharges>> {
    this.logger.info('Getting contractcharges', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a contractcharges
   * @param id - The contractcharges ID
   * @param contractCharges - The updated contractcharges data
   * @returns Promise with the updated contractcharges
   */
  async update(
    id: number,
    contractCharges: Partial<IContractCharges>
  ): Promise<ApiResponse<IContractCharges>> {
    this.logger.info('Updating contractcharges', { id, contractCharges });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, contractCharges),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a contractcharges
   * @param id - The contractcharges ID
   * @param contractCharges - The partial contractcharges data to update
   * @returns Promise with the updated contractcharges
   */
  async patch(
    id: number,
    contractCharges: Partial<IContractCharges>
  ): Promise<ApiResponse<IContractCharges>> {
    this.logger.info('Patching contractcharges', { id, contractCharges });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, contractCharges),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a contractcharges
   * @param id - The contractcharges ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contractcharges', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List contractcharges with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of contractcharges
   */
  async list(query: IContractChargesQuery = {}): Promise<ApiResponse<IContractCharges[]>> {
    this.logger.info('Listing contractcharges', { query });
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