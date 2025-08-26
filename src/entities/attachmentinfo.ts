import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IAttachmentInfo {
  id?: number;
  [key: string]: any;
}

export interface IAttachmentInfoQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * AttachmentInfo entity class for Autotask API
 * 
 * Attachment information and metadata
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/AttachmentInfoEntity.htm}
 */
export class AttachmentInfo extends BaseEntity {
  private readonly endpoint = '/AttachmentInfo';

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
        operation: 'createAttachmentInfo',
        requiredParams: ['attachmentInfo'],
        optionalParams: [],
        returnType: 'IAttachmentInfo',
        endpoint: '/AttachmentInfo',
      },
      {
        operation: 'getAttachmentInfo',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IAttachmentInfo',
        endpoint: '/AttachmentInfo/{id}',
      },
      {
        operation: 'deleteAttachmentInfo',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/AttachmentInfo/{id}',
      },
      {
        operation: 'listAttachmentInfo',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IAttachmentInfo[]',
        endpoint: '/AttachmentInfo',
      }
    ];
  }

  /**
   * Create a new attachmentinfo
   * @param attachmentInfo - The attachmentinfo data to create
   * @returns Promise with the created attachmentinfo
   */
  async create(attachmentInfo: IAttachmentInfo): Promise<ApiResponse<IAttachmentInfo>> {
    this.logger.info('Creating attachmentinfo', { attachmentInfo });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, attachmentInfo),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a attachmentinfo by ID
   * @param id - The attachmentinfo ID
   * @returns Promise with the attachmentinfo data
   */
  async get(id: number): Promise<ApiResponse<IAttachmentInfo>> {
    this.logger.info('Getting attachmentinfo', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Delete a attachmentinfo
   * @param id - The attachmentinfo ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting attachmentinfo', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List attachmentinfo with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of attachmentinfo
   */
  async list(query: IAttachmentInfoQuery = {}): Promise<ApiResponse<IAttachmentInfo[]>> {
    this.logger.info('Listing attachmentinfo', { query });
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