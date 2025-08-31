import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IDocumentTicketAssociations {
  id?: number;
  [key: string]: any;
}

export interface IDocumentTicketAssociationsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * DocumentTicketAssociations entity class for Autotask API
 * 
 * Associations between documents and tickets
 * Supported Operations: GET, POST, DELETE
 * Category: knowledge
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DocumentTicketAssociationsEntity.htm}
 */
export class DocumentTicketAssociations extends BaseEntity {
  private readonly endpoint = '/DocumentTicketAssociations';

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
        operation: 'createDocumentTicketAssociations',
        requiredParams: ['documentTicketAssociations'],
        optionalParams: [],
        returnType: 'IDocumentTicketAssociations',
        endpoint: '/DocumentTicketAssociations',
      },
      {
        operation: 'getDocumentTicketAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IDocumentTicketAssociations',
        endpoint: '/DocumentTicketAssociations/{id}',
      },
      {
        operation: 'deleteDocumentTicketAssociations',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/DocumentTicketAssociations/{id}',
      },
      {
        operation: 'listDocumentTicketAssociations',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IDocumentTicketAssociations[]',
        endpoint: '/DocumentTicketAssociations',
      }
    ];
  }

  /**
   * Create a new documentticketassociations
   * @param documentTicketAssociations - The documentticketassociations data to create
   * @returns Promise with the created documentticketassociations
   */
  async create(documentTicketAssociations: IDocumentTicketAssociations): Promise<ApiResponse<IDocumentTicketAssociations>> {
    this.logger.info('Creating documentticketassociations', { documentTicketAssociations });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, documentTicketAssociations),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a documentticketassociations by ID
   * @param id - The documentticketassociations ID
   * @returns Promise with the documentticketassociations data
   */
  async get(id: number): Promise<ApiResponse<IDocumentTicketAssociations>> {
    this.logger.info('Getting documentticketassociations', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a documentticketassociations
   * @param id - The documentticketassociations ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting documentticketassociations', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List documentticketassociations with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of documentticketassociations
   */
  async list(query: IDocumentTicketAssociationsQuery = {}): Promise<ApiResponse<IDocumentTicketAssociations[]>> {
    this.logger.info('Listing documentticketassociations', { query });
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