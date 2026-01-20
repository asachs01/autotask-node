import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IContacts {
  id?: number;
  [key: string]: any;
}

export interface IContactsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Contacts entity class for Autotask API
 *
 * Individual contacts within companies
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: core
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContactsEntity.htm}
 */
export class Contacts extends BaseEntity {
  private readonly endpoint = '/Contacts';

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
        operation: 'createContacts',
        requiredParams: ['contacts'],
        optionalParams: [],
        returnType: 'IContacts',
        endpoint: '/Contacts',
      },
      {
        operation: 'getContacts',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IContacts',
        endpoint: '/Contacts/{id}',
      },
      {
        operation: 'updateContacts',
        requiredParams: ['id', 'contacts'],
        optionalParams: [],
        returnType: 'IContacts',
        endpoint: '/Contacts/{id}',
      },
      {
        operation: 'listContacts',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IContacts[]',
        endpoint: '/Contacts',
      },
    ];
  }

  /**
   * Create a new contacts
   * @param contacts - The contacts data to create
   * @returns Promise with the created contacts
   */
  async create(contacts: IContacts): Promise<ApiResponse<IContacts>> {
    this.logger.info('Creating contacts', { contacts });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contacts),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a contacts by ID
   * @param id - The contacts ID
   * @returns Promise with the contacts data
   */
  async get(id: number): Promise<ApiResponse<IContacts>> {
    this.logger.info('Getting contacts', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a contacts
   * @param id - The contacts ID
   * @param contacts - The updated contacts data
   * @returns Promise with the updated contacts
   */
  async update(
    id: number,
    contacts: Partial<IContacts>
  ): Promise<ApiResponse<IContacts>> {
    this.logger.info('Updating contacts', { id, contacts });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, contacts),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a contacts
   * @param id - The contacts ID
   * @param contacts - The partial contacts data to update
   * @returns Promise with the updated contacts
   */
  async patch(
    id: number,
    contacts: Partial<IContacts>
  ): Promise<ApiResponse<IContacts>> {
    this.logger.info('Patching contacts', { id, contacts });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, contacts),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a contacts
   * @param id - The contacts ID to delete
   * @returns Promise with void response
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contacts', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List contacts with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of contacts
   */
  async list(query: IContactsQuery = {}): Promise<ApiResponse<IContacts[]>> {
    this.logger.info('Listing contacts', { query });
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
      async () =>
        this.axios.post(`${this.endpoint}/query`, searchBody),
      `${this.endpoint}/query`,
      'POST'
    );
  }
}
