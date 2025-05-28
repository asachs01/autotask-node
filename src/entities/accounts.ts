import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse } from '../types';

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

export class Accounts {
  private readonly endpoint = '/Companies';

  constructor(
    private axios: AxiosInstance,
    private logger: winston.Logger
  ) {}

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

  private async requestWithRetry<T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 500
  ): Promise<T> {
    let attempt = 0;
    while (true) {
      try {
        return await fn();
      } catch (err) {
        attempt++;
        this.logger.warn(`Request failed (attempt ${attempt}): ${err}`);
        if (attempt > retries) throw err;
        await new Promise(res =>
          setTimeout(res, delay * Math.pow(2, attempt - 1))
        );
      }
    }
  }

  async create(account: Account): Promise<ApiResponse<Account>> {
    this.logger.info('Creating account', { account });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.post(this.endpoint, account);
      return { data };
    });
  }

  async get(id: number): Promise<ApiResponse<Account>> {
    this.logger.info('Getting account', { id });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.get(`${this.endpoint}/${id}`);
      return { data };
    });
  }

  async update(
    id: number,
    account: Partial<Account>
  ): Promise<ApiResponse<Account>> {
    this.logger.info('Updating account', { id, account });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.put(`${this.endpoint}/${id}`, account);
      return { data };
    });
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting account', { id });
    return this.requestWithRetry(async () => {
      await this.axios.delete(`${this.endpoint}/${id}`);
    });
  }

  async list(query: AccountQuery = {}): Promise<ApiResponse<Account[]>> {
    this.logger.info('Listing accounts', { query });
    const params: Record<string, any> = {};
    if (query.filter) params['search'] = JSON.stringify(query.filter);
    if (query.sort) params['sort'] = query.sort;
    if (query.page) params['page'] = query.page;
    if (query.pageSize) params['pageSize'] = query.pageSize;
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.get(this.endpoint, { params });
      return { data };
    });
  }
}
