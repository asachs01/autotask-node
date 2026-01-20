import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IUserDefinedFieldDefinitions {
  id?: number;
  [key: string]: any;
}

export interface IUserDefinedFieldDefinitionsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * UserDefinedFieldDefinitions entity class for Autotask API
 * 
 * Definitions for user-defined fields
 * Supported Operations: GET
 * Category: user_defined
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/UserDefinedFieldDefinitionsEntity.htm}
 */
export class UserDefinedFieldDefinitions extends BaseEntity {
  private readonly endpoint = '/UserDefinedFieldDefinitions';

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
        operation: 'getUserDefinedFieldDefinitions',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IUserDefinedFieldDefinitions',
        endpoint: '/UserDefinedFieldDefinitions/{id}',
      },
      {
        operation: 'listUserDefinedFieldDefinitions',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IUserDefinedFieldDefinitions[]',
        endpoint: '/UserDefinedFieldDefinitions',
      }
    ];
  }

  /**
   * Get a userdefinedfielddefinitions by ID
   * @param id - The userdefinedfielddefinitions ID
   * @returns Promise with the userdefinedfielddefinitions data
   */
  async get(id: number): Promise<ApiResponse<IUserDefinedFieldDefinitions>> {
    this.logger.info('Getting userdefinedfielddefinitions', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * List userdefinedfielddefinitions with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of userdefinedfielddefinitions
   */
  async list(query: IUserDefinedFieldDefinitionsQuery = {}): Promise<ApiResponse<IUserDefinedFieldDefinitions[]>> {
    this.logger.info('Listing userdefinedfielddefinitions', { query });
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