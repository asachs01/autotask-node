import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ICompanyLocations {
  id?: number;
  [key: string]: any;
}

export interface ICompanyLocationsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * CompanyLocations entity class for Autotask API
 * 
 * Physical locations associated with companies
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: organizational
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CompanyLocationsEntity.htm}
 */
export class CompanyLocations extends BaseEntity {
  private readonly endpoint = '/CompanyLocations';

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
        operation: 'createCompanyLocations',
        requiredParams: ['companyLocations'],
        optionalParams: [],
        returnType: 'ICompanyLocations',
        endpoint: '/CompanyLocations',
      },
      {
        operation: 'getCompanyLocations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ICompanyLocations',
        endpoint: '/CompanyLocations/{id}',
      },
      {
        operation: 'updateCompanyLocations',
        requiredParams: ['id', 'companyLocations'],
        optionalParams: [],
        returnType: 'ICompanyLocations',
        endpoint: '/CompanyLocations/{id}',
      },
      {
        operation: 'deleteCompanyLocations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/CompanyLocations/{id}',
      },
      {
        operation: 'listCompanyLocations',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ICompanyLocations[]',
        endpoint: '/CompanyLocations',
      }
    ];
  }

  /**
   * Create a new companylocations
   * @param companyLocations - The companylocations data to create
   * @returns Promise with the created companylocations
   */
  async create(companyLocations: ICompanyLocations): Promise<ApiResponse<ICompanyLocations>> {
    this.logger.info('Creating companylocations', { companyLocations });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, companyLocations),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a companylocations by ID
   * @param id - The companylocations ID
   * @returns Promise with the companylocations data
   */
  async get(id: number): Promise<ApiResponse<ICompanyLocations>> {
    this.logger.info('Getting companylocations', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a companylocations
   * @param id - The companylocations ID
   * @param companyLocations - The updated companylocations data
   * @returns Promise with the updated companylocations
   */
  async update(
    id: number,
    companyLocations: Partial<ICompanyLocations>
  ): Promise<ApiResponse<ICompanyLocations>> {
    this.logger.info('Updating companylocations', { id, companyLocations });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, companyLocations),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a companylocations
   * @param id - The companylocations ID
   * @param companyLocations - The partial companylocations data to update
   * @returns Promise with the updated companylocations
   */
  async patch(
    id: number,
    companyLocations: Partial<ICompanyLocations>
  ): Promise<ApiResponse<ICompanyLocations>> {
    this.logger.info('Patching companylocations', { id, companyLocations });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, companyLocations),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a companylocations
   * @param id - The companylocations ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting companylocations', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List companylocations with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of companylocations
   */
  async list(query: ICompanyLocationsQuery = {}): Promise<ApiResponse<ICompanyLocations[]>> {
    this.logger.info('Listing companylocations', { query });
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