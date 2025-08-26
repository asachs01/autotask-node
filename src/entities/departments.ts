import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IDepartments {
  id?: number;
  [key: string]: any;
}

export interface IDepartmentsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Departments entity class for Autotask API
 * 
 * Organizational departments
 * Supported Operations: GET
 * Category: organizational
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DepartmentsEntity.htm}
 */
export class Departments extends BaseEntity {
  private readonly endpoint = '/Departments';

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
        operation: 'getDepartments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IDepartments',
        endpoint: '/Departments/{id}',
      },
      {
        operation: 'listDepartments',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IDepartments[]',
        endpoint: '/Departments',
      }
    ];
  }

  /**
   * Get a departments by ID
   * @param id - The departments ID
   * @returns Promise with the departments data
   */
  async get(id: number): Promise<ApiResponse<IDepartments>> {
    this.logger.info('Getting departments', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List departments with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of departments
   */
  async list(query: IDepartmentsQuery = {}): Promise<ApiResponse<IDepartments[]>> {
    this.logger.info('Listing departments', { query });
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