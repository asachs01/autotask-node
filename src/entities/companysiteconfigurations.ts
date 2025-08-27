import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface ICompanySiteConfigurations {
  id?: number;
  [key: string]: any;
}

export interface ICompanySiteConfigurationsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * CompanySiteConfigurations entity class for Autotask API
 * 
 * Site configurations for companies
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: organizational
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CompanySiteConfigurationsEntity.htm}
 */
export class CompanySiteConfigurations extends BaseEntity {
  private readonly endpoint = '/CompanySiteConfigurations';

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
        operation: 'createCompanySiteConfigurations',
        requiredParams: ['companySiteConfigurations'],
        optionalParams: [],
        returnType: 'ICompanySiteConfigurations',
        endpoint: '/CompanySiteConfigurations',
      },
      {
        operation: 'getCompanySiteConfigurations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'ICompanySiteConfigurations',
        endpoint: '/CompanySiteConfigurations/{id}',
      },
      {
        operation: 'updateCompanySiteConfigurations',
        requiredParams: ['id', 'companySiteConfigurations'],
        optionalParams: [],
        returnType: 'ICompanySiteConfigurations',
        endpoint: '/CompanySiteConfigurations/{id}',
      },
      {
        operation: 'deleteCompanySiteConfigurations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/CompanySiteConfigurations/{id}',
      },
      {
        operation: 'listCompanySiteConfigurations',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'ICompanySiteConfigurations[]',
        endpoint: '/CompanySiteConfigurations',
      }
    ];
  }

  /**
   * Create a new companysiteconfigurations
   * @param companySiteConfigurations - The companysiteconfigurations data to create
   * @returns Promise with the created companysiteconfigurations
   */
  async create(companySiteConfigurations: ICompanySiteConfigurations): Promise<ApiResponse<ICompanySiteConfigurations>> {
    this.logger.info('Creating companysiteconfigurations', { companySiteConfigurations });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, companySiteConfigurations),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a companysiteconfigurations by ID
   * @param id - The companysiteconfigurations ID
   * @returns Promise with the companysiteconfigurations data
   */
  async get(id: number): Promise<ApiResponse<ICompanySiteConfigurations>> {
    this.logger.info('Getting companysiteconfigurations', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a companysiteconfigurations
   * @param id - The companysiteconfigurations ID
   * @param companySiteConfigurations - The updated companysiteconfigurations data
   * @returns Promise with the updated companysiteconfigurations
   */
  async update(
    id: number,
    companySiteConfigurations: Partial<ICompanySiteConfigurations>
  ): Promise<ApiResponse<ICompanySiteConfigurations>> {
    this.logger.info('Updating companysiteconfigurations', { id, companySiteConfigurations });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, companySiteConfigurations),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a companysiteconfigurations
   * @param id - The companysiteconfigurations ID
   * @param companySiteConfigurations - The partial companysiteconfigurations data to update
   * @returns Promise with the updated companysiteconfigurations
   */
  async patch(
    id: number,
    companySiteConfigurations: Partial<ICompanySiteConfigurations>
  ): Promise<ApiResponse<ICompanySiteConfigurations>> {
    this.logger.info('Patching companysiteconfigurations', { id, companySiteConfigurations });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, companySiteConfigurations),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a companysiteconfigurations
   * @param id - The companysiteconfigurations ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting companysiteconfigurations', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List companysiteconfigurations with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of companysiteconfigurations
   */
  async list(query: ICompanySiteConfigurationsQuery = {}): Promise<ApiResponse<ICompanySiteConfigurations[]>> {
    this.logger.info('Listing companysiteconfigurations', { query });
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