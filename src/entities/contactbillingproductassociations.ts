import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IContactBillingProductAssociations {
  id?: number;
  [key: string]: any;
}

export interface IContactBillingProductAssociationsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ContactBillingProductAssociations entity class for Autotask API
 * 
 * Associations between contacts and billing products
 * Supported Operations: GET, POST, DELETE
 * Category: associations
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContactBillingProductAssociationsEntity.htm}
 */
export class ContactBillingProductAssociations extends BaseEntity {
  private readonly endpoint = '/ContactBillingProductAssociations';

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
        operation: 'createContactBillingProductAssociations',
        requiredParams: ['contactBillingProductAssociations'],
        optionalParams: [],
        returnType: 'IContactBillingProductAssociations',
        endpoint: '/ContactBillingProductAssociations',
      },
      {
        operation: 'getContactBillingProductAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IContactBillingProductAssociations',
        endpoint: '/ContactBillingProductAssociations/{id}',
      },
      {
        operation: 'deleteContactBillingProductAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ContactBillingProductAssociations/{id}',
      },
      {
        operation: 'listContactBillingProductAssociations',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IContactBillingProductAssociations[]',
        endpoint: '/ContactBillingProductAssociations',
      }
    ];
  }

  /**
   * Create a new contactbillingproductassociations
   * @param contactBillingProductAssociations - The contactbillingproductassociations data to create
   * @returns Promise with the created contactbillingproductassociations
   */
  async create(contactBillingProductAssociations: IContactBillingProductAssociations): Promise<ApiResponse<IContactBillingProductAssociations>> {
    this.logger.info('Creating contactbillingproductassociations', { contactBillingProductAssociations });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contactBillingProductAssociations),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a contactbillingproductassociations by ID
   * @param id - The contactbillingproductassociations ID
   * @returns Promise with the contactbillingproductassociations data
   */
  async get(id: number): Promise<ApiResponse<IContactBillingProductAssociations>> {
    this.logger.info('Getting contactbillingproductassociations', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a contactbillingproductassociations
   * @param id - The contactbillingproductassociations ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contactbillingproductassociations', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List contactbillingproductassociations with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of contactbillingproductassociations
   */
  async list(query: IContactBillingProductAssociationsQuery = {}): Promise<ApiResponse<IContactBillingProductAssociations[]>> {
    this.logger.info('Listing contactbillingproductassociations', { query });
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