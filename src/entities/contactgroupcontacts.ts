import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IContactGroupContacts {
  id?: number;
  [key: string]: any;
}

export interface IContactGroupContactsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ContactGroupContacts entity class for Autotask API
 * 
 * Contacts within contact groups
 * Supported Operations: GET, POST, DELETE
 * Category: associations
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContactGroupContactsEntity.htm}
 */
export class ContactGroupContacts extends BaseEntity {
  private readonly endpoint = '/ContactGroupContacts';

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
        operation: 'createContactGroupContacts',
        requiredParams: ['contactGroupContacts'],
        optionalParams: [],
        returnType: 'IContactGroupContacts',
        endpoint: '/ContactGroupContacts',
      },
      {
        operation: 'getContactGroupContacts',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IContactGroupContacts',
        endpoint: '/ContactGroupContacts/{id}',
      },
      {
        operation: 'deleteContactGroupContacts',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ContactGroupContacts/{id}',
      },
      {
        operation: 'listContactGroupContacts',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IContactGroupContacts[]',
        endpoint: '/ContactGroupContacts',
      }
    ];
  }

  /**
   * Create a new contactgroupcontacts
   * @param contactGroupContacts - The contactgroupcontacts data to create
   * @returns Promise with the created contactgroupcontacts
   */
  async create(contactGroupContacts: IContactGroupContacts): Promise<ApiResponse<IContactGroupContacts>> {
    this.logger.info('Creating contactgroupcontacts', { contactGroupContacts });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contactGroupContacts),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a contactgroupcontacts by ID
   * @param id - The contactgroupcontacts ID
   * @returns Promise with the contactgroupcontacts data
   */
  async get(id: number): Promise<ApiResponse<IContactGroupContacts>> {
    this.logger.info('Getting contactgroupcontacts', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a contactgroupcontacts
   * @param id - The contactgroupcontacts ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contactgroupcontacts', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List contactgroupcontacts with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of contactgroupcontacts
   */
  async list(query: IContactGroupContactsQuery = {}): Promise<ApiResponse<IContactGroupContacts[]>> {
    this.logger.info('Listing contactgroupcontacts', { query });
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