import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IChecklistLibraries {
  id?: number;
  [key: string]: any;
}

export interface IChecklistLibrariesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ChecklistLibraries entity class for Autotask API
 * 
 * Libraries of reusable checklists
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: checklists
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ChecklistLibrariesEntity.htm}
 */
export class ChecklistLibraries extends BaseEntity {
  private readonly endpoint = '/ChecklistLibraries';

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
        operation: 'createChecklistLibraries',
        requiredParams: ['checklistLibraries'],
        optionalParams: [],
        returnType: 'IChecklistLibraries',
        endpoint: '/ChecklistLibraries',
      },
      {
        operation: 'getChecklistLibraries',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IChecklistLibraries',
        endpoint: '/ChecklistLibraries/{id}',
      },
      {
        operation: 'updateChecklistLibraries',
        requiredParams: ['id', 'checklistLibraries'],
        optionalParams: [],
        returnType: 'IChecklistLibraries',
        endpoint: '/ChecklistLibraries/{id}',
      },
      {
        operation: 'deleteChecklistLibraries',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ChecklistLibraries/{id}',
      },
      {
        operation: 'listChecklistLibraries',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IChecklistLibraries[]',
        endpoint: '/ChecklistLibraries',
      }
    ];
  }

  /**
   * Create a new checklistlibraries
   * @param checklistLibraries - The checklistlibraries data to create
   * @returns Promise with the created checklistlibraries
   */
  async create(checklistLibraries: IChecklistLibraries): Promise<ApiResponse<IChecklistLibraries>> {
    this.logger.info('Creating checklistlibraries', { checklistLibraries });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, checklistLibraries),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a checklistlibraries by ID
   * @param id - The checklistlibraries ID
   * @returns Promise with the checklistlibraries data
   */
  async get(id: number): Promise<ApiResponse<IChecklistLibraries>> {
    this.logger.info('Getting checklistlibraries', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a checklistlibraries
   * @param id - The checklistlibraries ID
   * @param checklistLibraries - The updated checklistlibraries data
   * @returns Promise with the updated checklistlibraries
   */
  async update(
    id: number,
    checklistLibraries: Partial<IChecklistLibraries>
  ): Promise<ApiResponse<IChecklistLibraries>> {
    this.logger.info('Updating checklistlibraries', { id, checklistLibraries });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, checklistLibraries),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a checklistlibraries
   * @param id - The checklistlibraries ID
   * @param checklistLibraries - The partial checklistlibraries data to update
   * @returns Promise with the updated checklistlibraries
   */
  async patch(
    id: number,
    checklistLibraries: Partial<IChecklistLibraries>
  ): Promise<ApiResponse<IChecklistLibraries>> {
    this.logger.info('Patching checklistlibraries', { id, checklistLibraries });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, checklistLibraries),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a checklistlibraries
   * @param id - The checklistlibraries ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting checklistlibraries', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List checklistlibraries with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of checklistlibraries
   */
  async list(query: IChecklistLibrariesQuery = {}): Promise<ApiResponse<IChecklistLibraries[]>> {
    this.logger.info('Listing checklistlibraries', { query });
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