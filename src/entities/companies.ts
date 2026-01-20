import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ICompanies {
  id?: number;
  [key: string]: any;
}

export interface ICompaniesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Companies entity class for Autotask API
 * 
 * Organizations and companies in Autotask
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: core
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CompaniesEntity.htm}
 */
export class Companies extends BaseEntity {
  private readonly endpoint = '/Companies';

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
        operation: 'createCompanies',
        requiredParams: ['companies'],
        optionalParams: [],
        returnType: 'ICompanies',
        endpoint: '/Companies',
      },
      {
        operation: 'getCompanies',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ICompanies',
        endpoint: '/Companies/{id}',
      },
      {
        operation: 'updateCompanies',
        requiredParams: ['id', 'companies'],
        optionalParams: [],
        returnType: 'ICompanies',
        endpoint: '/Companies/{id}',
      },
      {
        operation: 'listCompanies',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ICompanies[]',
        endpoint: '/Companies',
      }
    ];
  }

  /**
   * Create a new companies
   * @param companies - The companies data to create
   * @returns Promise with the created companies
   */
  async create(companies: ICompanies): Promise<ApiResponse<ICompanies>> {
    this.logger.info('Creating companies', { companies });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, companies),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a companies by ID
   * @param id - The companies ID
   * @returns Promise with the companies data
   */
  async get(id: number): Promise<ApiResponse<ICompanies>> {
    this.logger.info('Getting companies', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a companies
   * @param id - The companies ID
   * @param companies - The updated companies data
   * @returns Promise with the updated companies
   */
  async update(
    id: number,
    companies: Partial<ICompanies>
  ): Promise<ApiResponse<ICompanies>> {
    this.logger.info('Updating companies', { id, companies });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, companies),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a companies
   * @param id - The companies ID
   * @param companies - The partial companies data to update
   * @returns Promise with the updated companies
   */
  async patch(
    id: number,
    companies: Partial<ICompanies>
  ): Promise<ApiResponse<ICompanies>> {
    this.logger.info('Patching companies', { id, companies });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, companies),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * List companies with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of companies
   */
  async list(query: ICompaniesQuery = {}): Promise<ApiResponse<ICompanies[]>> {
    this.logger.info('Listing companies', { query });
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