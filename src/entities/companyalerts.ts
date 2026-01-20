import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ICompanyAlerts {
  id?: number;
  [key: string]: any;
}

export interface ICompanyAlertsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * CompanyAlerts entity class for Autotask API
 * 
 * Alerts associated with companies
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: notifications
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CompanyAlertsEntity.htm}
 */
export class CompanyAlerts extends BaseEntity {
  private readonly endpoint = '/CompanyAlerts';

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
        operation: 'createCompanyAlerts',
        requiredParams: ['companyAlerts'],
        optionalParams: [],
        returnType: 'ICompanyAlerts',
        endpoint: '/CompanyAlerts',
      },
      {
        operation: 'getCompanyAlerts',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ICompanyAlerts',
        endpoint: '/CompanyAlerts/{id}',
      },
      {
        operation: 'updateCompanyAlerts',
        requiredParams: ['id', 'companyAlerts'],
        optionalParams: [],
        returnType: 'ICompanyAlerts',
        endpoint: '/CompanyAlerts/{id}',
      },
      {
        operation: 'deleteCompanyAlerts',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/CompanyAlerts/{id}',
      },
      {
        operation: 'listCompanyAlerts',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ICompanyAlerts[]',
        endpoint: '/CompanyAlerts',
      }
    ];
  }

  /**
   * Create a new companyalerts
   * @param companyAlerts - The companyalerts data to create
   * @returns Promise with the created companyalerts
   */
  async create(companyAlerts: ICompanyAlerts): Promise<ApiResponse<ICompanyAlerts>> {
    this.logger.info('Creating companyalerts', { companyAlerts });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, companyAlerts),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a companyalerts by ID
   * @param id - The companyalerts ID
   * @returns Promise with the companyalerts data
   */
  async get(id: number): Promise<ApiResponse<ICompanyAlerts>> {
    this.logger.info('Getting companyalerts', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a companyalerts
   * @param id - The companyalerts ID
   * @param companyAlerts - The updated companyalerts data
   * @returns Promise with the updated companyalerts
   */
  async update(
    id: number,
    companyAlerts: Partial<ICompanyAlerts>
  ): Promise<ApiResponse<ICompanyAlerts>> {
    this.logger.info('Updating companyalerts', { id, companyAlerts });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, companyAlerts),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a companyalerts
   * @param id - The companyalerts ID
   * @param companyAlerts - The partial companyalerts data to update
   * @returns Promise with the updated companyalerts
   */
  async patch(
    id: number,
    companyAlerts: Partial<ICompanyAlerts>
  ): Promise<ApiResponse<ICompanyAlerts>> {
    this.logger.info('Patching companyalerts', { id, companyAlerts });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, companyAlerts),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a companyalerts
   * @param id - The companyalerts ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting companyalerts', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List companyalerts with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of companyalerts
   */
  async list(query: ICompanyAlertsQuery = {}): Promise<ApiResponse<ICompanyAlerts[]>> {
    this.logger.info('Listing companyalerts', { query });
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