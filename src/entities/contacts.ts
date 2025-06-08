import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';

export interface Contact {
  id?: number;
  companyID?: number;
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  emailAddress2?: string;
  emailAddress3?: string;
  phone?: string;
  alternatePhone?: string;
  mobilePhone?: string;
  faxNumber?: string;
  extension?: string;
  title?: string;
  addressLine?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  countryID?: number;
  isActive?: number;
  primaryContact?: boolean;
  note?: string;
  externalID?: string;
  namePrefix?: number;
  nameSuffix?: number;
  middleInitial?: string;
  roomNumber?: string;
  createDate?: string;
  lastActivityDate?: string;
  lastModifiedDate?: string;
  companylocationID?: number;
  additionalAddressInformation?: string;
  bulkEmailOptOutTime?: string;
  facebookUrl?: string;
  linkedInUrl?: string;
  twitterUrl?: string;
  isOptedOutFromBulkEmail?: boolean;
  receivesEmailNotifications?: boolean;
  solicitationOptOut?: boolean;
  solicitationOptOutTime?: string;
  surveyOptOut?: boolean;
  startDate?: string;
  impersonatorCreatorResourceID?: number;
  apiVendorID?: number;
  [key: string]: any;
}

export interface ContactQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export class Contacts extends BaseEntity {
  private readonly endpoint = '/Contacts';

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
        operation: 'createContact',
        requiredParams: ['contact'],
        optionalParams: [],
        returnType: 'Contact',
        endpoint: '/Contacts',
      },
      {
        operation: 'getContact',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'Contact',
        endpoint: '/Contacts/{id}',
      },
      {
        operation: 'updateContact',
        requiredParams: ['id', 'contact'],
        optionalParams: [],
        returnType: 'Contact',
        endpoint: '/Contacts/{id}',
      },
      {
        operation: 'deleteContact',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/Contacts/{id}',
      },
      {
        operation: 'listContacts',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'Contact[]',
        endpoint: '/Contacts',
      },
    ];
  }

  async create(contact: Contact): Promise<ApiResponse<Contact>> {
    this.logger.info('Creating contact', { contact });
    return this.executeRequest(
      async () => this.axios.post(this.endpoint, contact),
      this.endpoint,
      'POST'
    );
  }

  async get(id: number): Promise<ApiResponse<Contact>> {
    this.logger.info('Getting contact', { id });
    return this.executeRequest(
      async () => this.axios.get(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'GET'
    );
  }

  async update(
    id: number,
    contact: Partial<Contact>
  ): Promise<ApiResponse<Contact>> {
    this.logger.info('Updating contact', { id, contact });
    return this.executeRequest(
      async () => this.axios.put(`${this.endpoint}/${id}`, contact),
      `${this.endpoint}/${id}`,
      'PUT'
    );
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting contact', { id });
    await this.executeRequest(
      async () => this.axios.delete(`${this.endpoint}/${id}`),
      `${this.endpoint}/${id}`,
      'DELETE'
    );
  }

  async list(query: ContactQuery = {}): Promise<ApiResponse<Contact[]>> {
    this.logger.info('Listing contacts', { query });
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
    
    this.logger.info('Listing contacts with search body', { searchBody });
    
    return this.executeQueryRequest(
      async () => this.axios.post(`${this.endpoint}/query`, searchBody),
      `${this.endpoint}/query`,
      'POST'
    );
  }
}
