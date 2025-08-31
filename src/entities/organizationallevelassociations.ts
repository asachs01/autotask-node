import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IOrganizationalLevelAssociations {
  id?: number;
  [key: string]: any;
}

export interface IOrganizationalLevelAssociationsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * OrganizationalLevelAssociations entity class for Autotask API
 * 
 * Associations between organizational levels
 * Supported Operations: GET, POST, DELETE
 * Category: organizational
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/OrganizationalLevelAssociationsEntity.htm}
 */
export class OrganizationalLevelAssociations extends BaseEntity {
  private readonly endpoint = '/OrganizationalLevelAssociations';

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
        operation: 'createOrganizationalLevelAssociations',
        requiredParams: ['organizationalLevelAssociations'],
        optionalParams: [],
        returnType: 'IOrganizationalLevelAssociations',
        endpoint: '/OrganizationalLevelAssociations',
      },
      {
        operation: 'getOrganizationalLevelAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IOrganizationalLevelAssociations',
        endpoint: '/OrganizationalLevelAssociations/{id}',
      },
      {
        operation: 'deleteOrganizationalLevelAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/OrganizationalLevelAssociations/{id}',
      },
      {
        operation: 'listOrganizationalLevelAssociations',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IOrganizationalLevelAssociations[]',
        endpoint: '/OrganizationalLevelAssociations',
      }
    ];
  }

  /**
   * Create a new organizationallevelassociations
   * @param organizationalLevelAssociations - The organizationallevelassociations data to create
   * @returns Promise with the created organizationallevelassociations
   */
  async create(organizationalLevelAssociations: IOrganizationalLevelAssociations): Promise<ApiResponse<IOrganizationalLevelAssociations>> {
    this.logger.info('Creating organizationallevelassociations', { organizationalLevelAssociations });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, organizationalLevelAssociations),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a organizationallevelassociations by ID
   * @param id - The organizationallevelassociations ID
   * @returns Promise with the organizationallevelassociations data
   */
  async get(id: number): Promise<ApiResponse<IOrganizationalLevelAssociations>> {
    this.logger.info('Getting organizationallevelassociations', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a organizationallevelassociations
   * @param id - The organizationallevelassociations ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting organizationallevelassociations', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List organizationallevelassociations with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of organizationallevelassociations
   */
  async list(query: IOrganizationalLevelAssociationsQuery = {}): Promise<ApiResponse<IOrganizationalLevelAssociations[]>> {
    this.logger.info('Listing organizationallevelassociations', { query });
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