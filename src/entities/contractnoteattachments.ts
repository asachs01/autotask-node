import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IContractNoteAttachments {
  id?: number;
  [key: string]: any;
}

export interface IContractNoteAttachmentsQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ContractNoteAttachments entity class for Autotask API
 * 
 * File attachments for contract notes
 * Supported Operations: GET, POST, DELETE
 * Category: notes
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractNoteAttachmentsEntity.htm}
 */
export class ContractNoteAttachments extends BaseEntity {
  private readonly endpoint = '/ContractNoteAttachments';

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
        operation: 'createContractNoteAttachments',
        requiredParams: ['contractNoteAttachments'],
        optionalParams: [],
        returnType: 'IContractNoteAttachments',
        endpoint: '/ContractNoteAttachments',
      },
      {
        operation: 'getContractNoteAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IContractNoteAttachments',
        endpoint: '/ContractNoteAttachments/{id}',
      },
      {
        operation: 'deleteContractNoteAttachments',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ContractNoteAttachments/{id}',
      },
      {
        operation: 'listContractNoteAttachments',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IContractNoteAttachments[]',
        endpoint: '/ContractNoteAttachments',
      }
    ];
  }

  /**
   * Create a new contractnoteattachments
   * @param contractNoteAttachments - The contractnoteattachments data to create
   * @returns Promise with the created contractnoteattachments
   */
  async create(contractNoteAttachments: IContractNoteAttachments): Promise<ApiResponse<IContractNoteAttachments>> {
    this.logger.info('Creating contractnoteattachments', { contractNoteAttachments });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contractNoteAttachments),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a contractnoteattachments by ID
   * @param id - The contractnoteattachments ID
   * @returns Promise with the contractnoteattachments data
   */
  async get(id: number): Promise<ApiResponse<IContractNoteAttachments>> {
    this.logger.info('Getting contractnoteattachments', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a contractnoteattachments
   * @param id - The contractnoteattachments ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contractnoteattachments', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List contractnoteattachments with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of contractnoteattachments
   */
  async list(query: IContractNoteAttachmentsQuery = {}): Promise<ApiResponse<IContractNoteAttachments[]>> {
    this.logger.info('Listing contractnoteattachments', { query });
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