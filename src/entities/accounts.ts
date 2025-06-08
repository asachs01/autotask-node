import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface Account {
  id?: number;
  companyName?: string;
  companyType?: number;
  companyNumber?: string;
  phone?: string;
  fax?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  countryID?: number;
  webAddress?: string;
  isActive?: boolean;
  ownerResourceID?: number;
  parentCompanyID?: number;
  companyCategoryID?: number;
  territoryID?: number;
  marketSegmentID?: number;
  competitorID?: number;
  currencyID?: number;
  taxID?: string;
  taxRegionID?: number;
  isTaxExempt?: boolean;
  isClientPortalActive?: boolean;
  isTaskFireActive?: boolean;
  alternatePhone1?: string;
  alternatePhone2?: string;
  additionalAddressInformation?: string;
  sicCode?: string;
  stockSymbol?: string;
  stockMarket?: string;
  assetValue?: number;
  classification?: number;
  createDate?: string;
  lastActivityDate?: string;
  lastTrackedModifiedDateTime?: string;
  [key: string]: any;
}

export interface AccountQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export class Accounts extends BaseEntity {
  private readonly endpoint = '/Companies';

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
        operation: 'createAccount',
        requiredParams: ['account'],
        optionalParams: [],
        returnType: 'Account',
        endpoint: '/Companies',
      },
      {
        operation: 'getAccount',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'Account',
        endpoint: '/Companies/{id}',
      },
      {
        operation: 'updateAccount',
        requiredParams: ['id', 'account'],
        optionalParams: [],
        returnType: 'Account',
        endpoint: '/Companies/{id}',
      },
      {
        operation: 'deleteAccount',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/Companies/{id}',
      },
      {
        operation: 'listAccounts',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'Account[]',
        endpoint: '/Companies',
      },
    ];
  }

  async create(account: Account): Promise<ApiResponse<Account>> {
    this.logger.info('Creating account', { account });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, account),
      this.endpoint,
      'POST'
    );
  }

  async get(id: number): Promise<ApiResponse<Account>> {
    this.logger.info('Getting account', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  async update(
    id: number,
    account: Partial<Account>
  ): Promise<ApiResponse<Account>> {
    this.logger.info('Updating account', { id, account });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, account),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting account', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  async list(query: AccountQuery = {}): Promise<ApiResponse<Account[]>> {
    this.logger.info('Listing accounts', { query });
    const searchBody: Record<string, any> = {};
    
    // Ensure there's a filter - Autotask API requires a filter
    if (!query.filter || Object.keys(query.filter).length === 0) {
      searchBody.filter = [
        {
          "op": "gte",
          "field": "id",
          "value": 0
        }
      ];
    } else {
      // If filter is provided as an object, convert to array format expected by API
      if (!Array.isArray(query.filter)) {
        const filterArray = [];
        for (const [field, value] of Object.entries(query.filter)) {
          filterArray.push({
            "op": "eq",
            "field": field,
            "value": value
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
    
    this.logger.info('Listing accounts with search body', { searchBody });
    
    return this.executeQueryRequest(
      async () => this.axios.post(`${this.endpoint}/query`, searchBody),
      `${this.endpoint}/query`,
      'POST'
    );
  }
}
