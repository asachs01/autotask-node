import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse } from '../types';

export interface PurchaseOrder {
  id?: number;
  vendorAccountId?: number;
  purchaseOrderNumber?: string;
  orderDate?: string;
  expectedDeliveryDate?: string;
  totalAmount?: number;
  status?: string;
  description?: string;
  shippingType?: string;
  shippingAmount?: number;
  taxAmount?: number;
  receivedDate?: string;
  [key: string]: any;
}

export interface PurchaseOrderQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export class PurchaseOrders {
  private readonly endpoint = '/PurchaseOrders';

  constructor(private axios: AxiosInstance, private logger: winston.Logger) {}

  static getMetadata(): MethodMetadata[] {
    return [
      {
        operation: 'createPurchaseOrder',
        requiredParams: ['purchaseOrder'],
        optionalParams: [],
        returnType: 'PurchaseOrder',
        endpoint: '/PurchaseOrders',
      },
      {
        operation: 'getPurchaseOrder',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'PurchaseOrder',
        endpoint: '/PurchaseOrders/{id}',
      },
      {
        operation: 'updatePurchaseOrder',
        requiredParams: ['id', 'purchaseOrder'],
        optionalParams: [],
        returnType: 'PurchaseOrder',
        endpoint: '/PurchaseOrders/{id}',
      },
      {
        operation: 'deletePurchaseOrder',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/PurchaseOrders/{id}',
      },
      {
        operation: 'listPurchaseOrders',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'PurchaseOrder[]',
        endpoint: '/PurchaseOrders',
      },
    ];
  }

  private async requestWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
    let attempt = 0;
    while (true) {
      try {
        return await fn();
      } catch (err) {
        attempt++;
        this.logger.warn(`Request failed (attempt ${attempt}): ${err}`);
        if (attempt > retries) throw err;
        await new Promise(res => setTimeout(res, delay * Math.pow(2, attempt - 1)));
      }
    }
  }

  async create(purchaseOrder: PurchaseOrder): Promise<ApiResponse<PurchaseOrder>> {
    this.logger.info('Creating purchase order', { purchaseOrder });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.post(this.endpoint, purchaseOrder);
      return { data };
    });
  }

  async get(id: number): Promise<ApiResponse<PurchaseOrder>> {
    this.logger.info('Getting purchase order', { id });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.get(`${this.endpoint}/${id}`);
      return { data };
    });
  }

  async update(id: number, purchaseOrder: Partial<PurchaseOrder>): Promise<ApiResponse<PurchaseOrder>> {
    this.logger.info('Updating purchase order', { id, purchaseOrder });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.put(`${this.endpoint}/${id}`, purchaseOrder);
      return { data };
    });
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting purchase order', { id });
    return this.requestWithRetry(async () => {
      await this.axios.delete(`${this.endpoint}/${id}`);
    });
  }

  async list(query: PurchaseOrderQuery = {}): Promise<ApiResponse<PurchaseOrder[]>> {
    this.logger.info('Listing purchase orders', { query });
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