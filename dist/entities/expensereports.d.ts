import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IExpenseReports {
    id?: number;
    [key: string]: any;
}
export interface IExpenseReportsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ExpenseReports entity class for Autotask API
 *
 * Expense reports for reimbursement
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: expense
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ExpenseReportsEntity.htm}
 */
export declare class ExpenseReports extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new expensereports
     * @param expenseReports - The expensereports data to create
     * @returns Promise with the created expensereports
     */
    create(expenseReports: IExpenseReports): Promise<ApiResponse<IExpenseReports>>;
    /**
     * Get a expensereports by ID
     * @param id - The expensereports ID
     * @returns Promise with the expensereports data
     */
    get(id: number): Promise<ApiResponse<IExpenseReports>>;
    /**
     * Update a expensereports
     * @param id - The expensereports ID
     * @param expenseReports - The updated expensereports data
     * @returns Promise with the updated expensereports
     */
    update(id: number, expenseReports: Partial<IExpenseReports>): Promise<ApiResponse<IExpenseReports>>;
    /**
     * Partially update a expensereports
     * @param id - The expensereports ID
     * @param expenseReports - The partial expensereports data to update
     * @returns Promise with the updated expensereports
     */
    patch(id: number, expenseReports: Partial<IExpenseReports>): Promise<ApiResponse<IExpenseReports>>;
    /**
     * Delete a expensereports
     * @param id - The expensereports ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List expensereports with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of expensereports
     */
    list(query?: IExpenseReportsQuery): Promise<ApiResponse<IExpenseReports[]>>;
}
//# sourceMappingURL=expensereports.d.ts.map