import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ICompanyToDos {
  id?: number;
  [key: string]: any;
}

export interface ICompanyToDosQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * CompanyToDos entity class for Autotask API
 * 
 * To-do items associated with companies
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: organizational
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CompanyToDosEntity.htm}
 */
export class CompanyToDos extends BaseEntity {
  private readonly endpoint = '/CompanyToDos';

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
        operation: 'createCompanyToDos',
        requiredParams: ['companyToDos'],
        optionalParams: [],
        returnType: 'ICompanyToDos',
        endpoint: '/CompanyToDos',
      },
      {
        operation: 'getCompanyToDos',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ICompanyToDos',
        endpoint: '/CompanyToDos/{id}',
      },
      {
        operation: 'updateCompanyToDos',
        requiredParams: ['id', 'companyToDos'],
        optionalParams: [],
        returnType: 'ICompanyToDos',
        endpoint: '/CompanyToDos/{id}',
      },
      {
        operation: 'deleteCompanyToDos',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/CompanyToDos/{id}',
      },
      {
        operation: 'listCompanyToDos',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ICompanyToDos[]',
        endpoint: '/CompanyToDos',
      }
    ];
  }

  /**
   * Create a new companytodos
   * @param companyToDos - The companytodos data to create
   * @returns Promise with the created companytodos
   */
  async create(companyToDos: ICompanyToDos): Promise<ApiResponse<ICompanyToDos>> {
    this.logger.info('Creating companytodos', { companyToDos });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, companyToDos),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a companytodos by ID
   * @param id - The companytodos ID
   * @returns Promise with the companytodos data
   */
  async get(id: number): Promise<ApiResponse<ICompanyToDos>> {
    this.logger.info('Getting companytodos', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a companytodos
   * @param id - The companytodos ID
   * @param companyToDos - The updated companytodos data
   * @returns Promise with the updated companytodos
   */
  async update(
    id: number,
    companyToDos: Partial<ICompanyToDos>
  ): Promise<ApiResponse<ICompanyToDos>> {
    this.logger.info('Updating companytodos', { id, companyToDos });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, companyToDos),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a companytodos
   * @param id - The companytodos ID
   * @param companyToDos - The partial companytodos data to update
   * @returns Promise with the updated companytodos
   */
  async patch(
    id: number,
    companyToDos: Partial<ICompanyToDos>
  ): Promise<ApiResponse<ICompanyToDos>> {
    this.logger.info('Patching companytodos', { id, companyToDos });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, companyToDos),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a companytodos
   * @param id - The companytodos ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting companytodos', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List companytodos with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of companytodos
   */
  async list(query: ICompanyToDosQuery = {}): Promise<ApiResponse<ICompanyToDos[]>> {
    this.logger.info('Listing companytodos', { query });
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