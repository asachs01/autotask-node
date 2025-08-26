import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IChecklistLibraryChecklistItems {
  id?: number;
  [key: string]: any;
}

export interface IChecklistLibraryChecklistItemsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ChecklistLibraryChecklistItems entity class for Autotask API
 * 
 * Items within checklist libraries
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: checklists
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ChecklistLibraryChecklistItemsEntity.htm}
 */
export class ChecklistLibraryChecklistItems extends BaseEntity {
  private readonly endpoint = '/ChecklistLibraryChecklistItems';

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
        operation: 'createChecklistLibraryChecklistItems',
        requiredParams: ['checklistLibraryChecklistItems'],
        optionalParams: [],
        returnType: 'IChecklistLibraryChecklistItems',
        endpoint: '/ChecklistLibraryChecklistItems',
      },
      {
        operation: 'getChecklistLibraryChecklistItems',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IChecklistLibraryChecklistItems',
        endpoint: '/ChecklistLibraryChecklistItems/{id}',
      },
      {
        operation: 'updateChecklistLibraryChecklistItems',
        requiredParams: ['id', 'checklistLibraryChecklistItems'],
        optionalParams: [],
        returnType: 'IChecklistLibraryChecklistItems',
        endpoint: '/ChecklistLibraryChecklistItems/{id}',
      },
      {
        operation: 'deleteChecklistLibraryChecklistItems',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ChecklistLibraryChecklistItems/{id}',
      },
      {
        operation: 'listChecklistLibraryChecklistItems',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IChecklistLibraryChecklistItems[]',
        endpoint: '/ChecklistLibraryChecklistItems',
      }
    ];
  }

  /**
   * Create a new checklistlibrarychecklistitems
   * @param checklistLibraryChecklistItems - The checklistlibrarychecklistitems data to create
   * @returns Promise with the created checklistlibrarychecklistitems
   */
  async create(checklistLibraryChecklistItems: IChecklistLibraryChecklistItems): Promise<ApiResponse<IChecklistLibraryChecklistItems>> {
    this.logger.info('Creating checklistlibrarychecklistitems', { checklistLibraryChecklistItems });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, checklistLibraryChecklistItems),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a checklistlibrarychecklistitems by ID
   * @param id - The checklistlibrarychecklistitems ID
   * @returns Promise with the checklistlibrarychecklistitems data
   */
  async get(id: number): Promise<ApiResponse<IChecklistLibraryChecklistItems>> {
    this.logger.info('Getting checklistlibrarychecklistitems', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a checklistlibrarychecklistitems
   * @param id - The checklistlibrarychecklistitems ID
   * @param checklistLibraryChecklistItems - The updated checklistlibrarychecklistitems data
   * @returns Promise with the updated checklistlibrarychecklistitems
   */
  async update(
    id: number,
    checklistLibraryChecklistItems: Partial<IChecklistLibraryChecklistItems>
  ): Promise<ApiResponse<IChecklistLibraryChecklistItems>> {
    this.logger.info('Updating checklistlibrarychecklistitems', { id, checklistLibraryChecklistItems });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, checklistLibraryChecklistItems),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a checklistlibrarychecklistitems
   * @param id - The checklistlibrarychecklistitems ID
   * @param checklistLibraryChecklistItems - The partial checklistlibrarychecklistitems data to update
   * @returns Promise with the updated checklistlibrarychecklistitems
   */
  async patch(
    id: number,
    checklistLibraryChecklistItems: Partial<IChecklistLibraryChecklistItems>
  ): Promise<ApiResponse<IChecklistLibraryChecklistItems>> {
    this.logger.info('Patching checklistlibrarychecklistitems', { id, checklistLibraryChecklistItems });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, checklistLibraryChecklistItems),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a checklistlibrarychecklistitems
   * @param id - The checklistlibrarychecklistitems ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting checklistlibrarychecklistitems', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List checklistlibrarychecklistitems with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of checklistlibrarychecklistitems
   */
  async list(query: IChecklistLibraryChecklistItemsQuery = {}): Promise<ApiResponse<IChecklistLibraryChecklistItems[]>> {
    this.logger.info('Listing checklistlibrarychecklistitems', { query });
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