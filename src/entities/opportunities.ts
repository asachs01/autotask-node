import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IOpportunities {
  id?: number;
  [key: string]: any;
}

export interface IOpportunitiesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Opportunities entity class for Autotask API
 * 
 * Sales opportunities and pipeline
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: core
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/OpportunitiesEntity.htm}
 */
export class Opportunities extends BaseEntity {
  private readonly endpoint = '/Opportunities';

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
        operation: 'createOpportunities',
        requiredParams: ['opportunities'],
        optionalParams: [],
        returnType: 'IOpportunities',
        endpoint: '/Opportunities',
      },
      {
        operation: 'getOpportunities',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IOpportunities',
        endpoint: '/Opportunities/{id}',
      },
      {
        operation: 'updateOpportunities',
        requiredParams: ['id', 'opportunities'],
        optionalParams: [],
        returnType: 'IOpportunities',
        endpoint: '/Opportunities/{id}',
      },
      {
        operation: 'listOpportunities',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IOpportunities[]',
        endpoint: '/Opportunities',
      }
    ];
  }

  /**
   * Create a new opportunities
   * @param opportunities - The opportunities data to create
   * @returns Promise with the created opportunities
   */
  async create(opportunities: IOpportunities): Promise<ApiResponse<IOpportunities>> {
    this.logger.info('Creating opportunities', { opportunities });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, opportunities),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a opportunities by ID
   * @param id - The opportunities ID
   * @returns Promise with the opportunities data
   */
  async get(id: number): Promise<ApiResponse<IOpportunities>> {
    this.logger.info('Getting opportunities', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a opportunities
   * @param id - The opportunities ID
   * @param opportunities - The updated opportunities data
   * @returns Promise with the updated opportunities
   */
  async update(
    id: number,
    opportunities: Partial<IOpportunities>
  ): Promise<ApiResponse<IOpportunities>> {
    this.logger.info('Updating opportunities', { id, opportunities });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, opportunities),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a opportunities
   * @param id - The opportunities ID
   * @param opportunities - The partial opportunities data to update
   * @returns Promise with the updated opportunities
   */
  async patch(
    id: number,
    opportunities: Partial<IOpportunities>
  ): Promise<ApiResponse<IOpportunities>> {
    this.logger.info('Patching opportunities', { id, opportunities });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, opportunities),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * List opportunities with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of opportunities
   */
  async list(query: IOpportunitiesQuery = {}): Promise<ApiResponse<IOpportunities[]>> {
    this.logger.info('Listing opportunities', { query });
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