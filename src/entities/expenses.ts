import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse } from '../types';

export interface Expense {
  id?: number;
  accountId?: number;
  projectId?: number;
  ticketId?: number;
  resourceId?: number;
  expenseDate?: string;
  amount?: number;
  description?: string;
  expenseCategory?: string;
  billableToAccount?: boolean;
  reimbursable?: boolean;
  status?: string;
  receiptAmount?: number;
  [key: string]: any;
}

export interface ExpenseQuery {
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export class Expenses {
  private readonly endpoint = '/Expenses';

  constructor(private axios: AxiosInstance, private logger: winston.Logger) {}

  static getMetadata(): MethodMetadata[] {
    return [
      {
        operation: 'createExpense',
        requiredParams: ['expense'],
        optionalParams: [],
        returnType: 'Expense',
        endpoint: '/Expenses',
      },
      {
        operation: 'getExpense',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'Expense',
        endpoint: '/Expenses/{id}',
      },
      {
        operation: 'updateExpense',
        requiredParams: ['id', 'expense'],
        optionalParams: [],
        returnType: 'Expense',
        endpoint: '/Expenses/{id}',
      },
      {
        operation: 'deleteExpense',
        requiredParams: ['id'],
        optionalParams: [],
        returnType: 'void',
        endpoint: '/Expenses/{id}',
      },
      {
        operation: 'listExpenses',
        requiredParams: [],
        optionalParams: ['filter', 'sort', 'page', 'pageSize'],
        returnType: 'Expense[]',
        endpoint: '/Expenses',
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

  async create(expense: Expense): Promise<ApiResponse<Expense>> {
    this.logger.info('Creating expense', { expense });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.post(this.endpoint, expense);
      return { data };
    });
  }

  async get(id: number): Promise<ApiResponse<Expense>> {
    this.logger.info('Getting expense', { id });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.get(`${this.endpoint}/${id}`);
      return { data };
    });
  }

  async update(id: number, expense: Partial<Expense>): Promise<ApiResponse<Expense>> {
    this.logger.info('Updating expense', { id, expense });
    return this.requestWithRetry(async () => {
      const { data } = await this.axios.put(`${this.endpoint}/${id}`, expense);
      return { data };
    });
  }

  async delete(id: number): Promise<void> {
    this.logger.info('Deleting expense', { id });
    return this.requestWithRetry(async () => {
      await this.axios.delete(`${this.endpoint}/${id}`);
    });
  }

  async list(query: ExpenseQuery = {}): Promise<ApiResponse<Expense[]>> {
    this.logger.info('Listing expenses', { query });
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