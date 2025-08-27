import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IContractNotes {
  id?: number;
  [key: string]: any;
}

export interface IContractNotesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ContractNotes entity class for Autotask API
 * 
 * Notes for contracts
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: notes
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractNotesEntity.htm}
 */
export class ContractNotes extends BaseEntity {
  private readonly endpoint = '/ContractNotes';

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
        operation: 'createContractNotes',
        requiredParams: ['contractNotes'],
        optionalParams: [],
        returnType: 'IContractNotes',
        endpoint: '/ContractNotes',
      },
      {
        operation: 'getContractNotes',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IContractNotes',
        endpoint: '/ContractNotes/{id}',
      },
      {
        operation: 'updateContractNotes',
        requiredParams: ['id', 'contractNotes'],
        optionalParams: [],
        returnType: 'IContractNotes',
        endpoint: '/ContractNotes/{id}',
      },
      {
        operation: 'listContractNotes',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IContractNotes[]',
        endpoint: '/ContractNotes',
      }
    ];
  }

  /**
   * Create a new contractnotes
   * @param contractNotes - The contractnotes data to create
   * @returns Promise with the created contractnotes
   */
  async create(contractNotes: IContractNotes): Promise<ApiResponse<IContractNotes>> {
    this.logger.info('Creating contractnotes', { contractNotes });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contractNotes),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a contractnotes by ID
   * @param id - The contractnotes ID
   * @returns Promise with the contractnotes data
   */
  async get(id: number): Promise<ApiResponse<IContractNotes>> {
    this.logger.info('Getting contractnotes', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a contractnotes
   * @param id - The contractnotes ID
   * @param contractNotes - The updated contractnotes data
   * @returns Promise with the updated contractnotes
   */
  async update(
    id: number,
    contractNotes: Partial<IContractNotes>
  ): Promise<ApiResponse<IContractNotes>> {
    this.logger.info('Updating contractnotes', { id, contractNotes });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, contractNotes),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a contractnotes
   * @param id - The contractnotes ID
   * @param contractNotes - The partial contractnotes data to update
   * @returns Promise with the updated contractnotes
   */
  async patch(
    id: number,
    contractNotes: Partial<IContractNotes>
  ): Promise<ApiResponse<IContractNotes>> {
    this.logger.info('Patching contractnotes', { id, contractNotes });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, contractNotes),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * List contractnotes with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of contractnotes
   */
  async list(query: IContractNotesQuery = {}): Promise<ApiResponse<IContractNotes[]>> {
    this.logger.info('Listing contractnotes', { query });
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