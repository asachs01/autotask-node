import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IContractServices {
  id?: number;
  [key: string]: any;
}

export interface IContractServicesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ContractServices entity class for Autotask API
 * 
 * Services included in contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractServicesEntity.htm}
 */
export class ContractServices extends BaseEntity {
  private readonly endpoint = '/ContractServices';

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
        operation: 'createContractServices',
        requiredParams: ['contractServices'],
        optionalParams: [],
        returnType: 'IContractServices',
        endpoint: '/ContractServices',
      },
      {
        operation: 'getContractServices',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IContractServices',
        endpoint: '/ContractServices/{id}',
      },
      {
        operation: 'updateContractServices',
        requiredParams: ['id', 'contractServices'],
        optionalParams: [],
        returnType: 'IContractServices',
        endpoint: '/ContractServices/{id}',
      },
      {
        operation: 'deleteContractServices',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ContractServices/{id}',
      },
      {
        operation: 'listContractServices',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IContractServices[]',
        endpoint: '/ContractServices',
      }
    ];
  }

  /**
   * Create a new contractservices
   * @param contractServices - The contractservices data to create
   * @returns Promise with the created contractservices
   */
  async create(contractServices: IContractServices): Promise<ApiResponse<IContractServices>> {
    this.logger.info('Creating contractservices', { contractServices });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contractServices),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a contractservices by ID
   * @param id - The contractservices ID
   * @returns Promise with the contractservices data
   */
  async get(id: number): Promise<ApiResponse<IContractServices>> {
    this.logger.info('Getting contractservices', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a contractservices
   * @param id - The contractservices ID
   * @param contractServices - The updated contractservices data
   * @returns Promise with the updated contractservices
   */
  async update(
    id: number,
    contractServices: Partial<IContractServices>
  ): Promise<ApiResponse<IContractServices>> {
    this.logger.info('Updating contractservices', { id, contractServices });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, contractServices),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a contractservices
   * @param id - The contractservices ID
   * @param contractServices - The partial contractservices data to update
   * @returns Promise with the updated contractservices
   */
  async patch(
    id: number,
    contractServices: Partial<IContractServices>
  ): Promise<ApiResponse<IContractServices>> {
    this.logger.info('Patching contractservices', { id, contractServices });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, contractServices),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a contractservices
   * @param id - The contractservices ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contractservices', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List contractservices with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of contractservices
   */
  async list(query: IContractServicesQuery = {}): Promise<ApiResponse<IContractServices[]>> {
    this.logger.info('Listing contractservices', { query });
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