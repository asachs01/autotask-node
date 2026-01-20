import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IExpenseItems {
    id?: number;
    [key: string]: any;
}
export interface IExpenseItemsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ExpenseItems entity class for Autotask API
 *
 * Individual expense items
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: expense
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ExpenseItemsEntity.htm}
 */
export declare class ExpenseItems extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new expenseitems
     * @param expenseItems - The expenseitems data to create
     * @returns Promise with the created expenseitems
     */
    create(expenseItems: IExpenseItems): Promise<ApiResponse<IExpenseItems>>;
    /**
     * Get a expenseitems by ID
     * @param id - The expenseitems ID
     * @returns Promise with the expenseitems data
     */
    get(id: number): Promise<ApiResponse<IExpenseItems>>;
    /**
     * Update a expenseitems
     * @param id - The expenseitems ID
     * @param expenseItems - The updated expenseitems data
     * @returns Promise with the updated expenseitems
     */
    update(id: number, expenseItems: Partial<IExpenseItems>): Promise<ApiResponse<IExpenseItems>>;
    /**
     * Partially update a expenseitems
     * @param id - The expenseitems ID
     * @param expenseItems - The partial expenseitems data to update
     * @returns Promise with the updated expenseitems
     */
    patch(id: number, expenseItems: Partial<IExpenseItems>): Promise<ApiResponse<IExpenseItems>>;
    /**
     * Delete a expenseitems
     * @param id - The expenseitems ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List expenseitems with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of expenseitems
     */
    list(query?: IExpenseItemsQuery): Promise<ApiResponse<IExpenseItems[]>>;
}
//# sourceMappingURL=expenseitems.d.ts.map