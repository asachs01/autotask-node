import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface IContractTicketPurchases {
  id?: number;
  [key: string]: any;
}

export interface IContractTicketPurchasesQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

/**
 * ContractTicketPurchases entity class for Autotask API
 * 
 * Ticket purchases for contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 * 
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractTicketPurchasesEntity.htm}
 */
export class ContractTicketPurchases extends BaseEntity {
  private readonly endpoint = '/ContractTicketPurchases';

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
        operation: 'createContractTicketPurchases',
        requiredParams: ['contractTicketPurchases'],
        optionalParams: [],
        returnType: 'IContractTicketPurchases',
        endpoint: '/ContractTicketPurchases',
      },
      {
        operation: 'getContractTicketPurchases',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'IContractTicketPurchases',
        endpoint: '/ContractTicketPurchases/{id}',
      },
      {
        operation: 'updateContractTicketPurchases',
        requiredParams: ['id', 'contractTicketPurchases'],
        optionalParams: [],
        returnType: 'IContractTicketPurchases',
        endpoint: '/ContractTicketPurchases/{id}',
      },
      {
        operation: 'deleteContractTicketPurchases',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/ContractTicketPurchases/{id}',
      },
      {
        operation: 'listContractTicketPurchases',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'IContractTicketPurchases[]',
        endpoint: '/ContractTicketPurchases',
      }
    ];
  }

  /**
   * Create a new contractticketpurchases
   * @param contractTicketPurchases - The contractticketpurchases data to create
   * @returns Promise with the created contractticketpurchases
   */
  async create(contractTicketPurchases: IContractTicketPurchases): Promise<ApiResponse<IContractTicketPurchases>> {
    this.logger.info('Creating contractticketpurchases', { contractTicketPurchases });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contractTicketPurchases),
      this.endpoint,
      'POST'
    );
  }

  /**
   * Get a contractticketpurchases by ID
   * @param id - The contractticketpurchases ID
   * @returns Promise with the contractticketpurchases data
   */
  async get(id: number): Promise<ApiResponse<IContractTicketPurchases>> {
    this.logger.info('Getting contractticketpurchases', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  /**
   * Update a contractticketpurchases
   * @param id - The contractticketpurchases ID
   * @param contractTicketPurchases - The updated contractticketpurchases data
   * @returns Promise with the updated contractticketpurchases
   */
  async update(
    id: number,
    contractTicketPurchases: Partial<IContractTicketPurchases>
  ): Promise<ApiResponse<IContractTicketPurchases>> {
    this.logger.info('Updating contractticketpurchases', { id, contractTicketPurchases });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, contractTicketPurchases),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  /**
   * Partially update a contractticketpurchases
   * @param id - The contractticketpurchases ID
   * @param contractTicketPurchases - The partial contractticketpurchases data to update
   * @returns Promise with the updated contractticketpurchases
   */
  async patch(
    id: number,
    contractTicketPurchases: Partial<IContractTicketPurchases>
  ): Promise<ApiResponse<IContractTicketPurchases>> {
    this.logger.info('Patching contractticketpurchases', { id, contractTicketPurchases });
    return this.executeRequest(
      async () => this.axios.patch(`${this.endpoint}/${id}`, contractTicketPurchases),
      `${this.endpoint}/${id}`,
      'PATCH'
    );
  }

  /**
   * Delete a contractticketpurchases
   * @param id - The contractticketpurchases ID
   * @returns Promise that resolves when deletion is complete
   */
  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contractticketpurchases', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  /**
   * List contractticketpurchases with optional filtering
   * @param query - Query parameters for filtering, sorting, and pagination
   * @returns Promise with array of contractticketpurchases
   */
  async list(query: IContractTicketPurchasesQuery = {}): Promise<ApiResponse<IContractTicketPurchases[]>> {
    this.logger.info('Listing contractticketpurchases', { query });
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