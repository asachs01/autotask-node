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
export declare class Expenses {
    private axios;
    private logger;
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger);
    static getMetadata(): MethodMetadata[];
    private requestWithRetry;
    create(expense: Expense): Promise<ApiResponse<Expense>>;
    get(id: number): Promise<ApiResponse<Expense>>;
    update(id: number, expense: Partial<Expense>): Promise<ApiResponse<Expense>>;
    delete(id: number): Promise<void>;
    list(query?: ExpenseQuery): Promise<ApiResponse<Expense[]>>;
}
//# sourceMappingURL=expenses.d.ts.map