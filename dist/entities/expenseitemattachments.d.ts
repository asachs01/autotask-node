import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IExpenseItemAttachments {
    id?: number;
    [key: string]: any;
}
export interface IExpenseItemAttachmentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ExpenseItemAttachments entity class for Autotask API
 *
 * File attachments for expense items
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ExpenseItemAttachmentsEntity.htm}
 */
export declare class ExpenseItemAttachments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new expenseitemattachments
     * @param expenseItemAttachments - The expenseitemattachments data to create
     * @returns Promise with the created expenseitemattachments
     */
    create(expenseItemAttachments: IExpenseItemAttachments): Promise<ApiResponse<IExpenseItemAttachments>>;
    /**
     * Get a expenseitemattachments by ID
     * @param id - The expenseitemattachments ID
     * @returns Promise with the expenseitemattachments data
     */
    get(id: number): Promise<ApiResponse<IExpenseItemAttachments>>;
    /**
     * Delete a expenseitemattachments
     * @param id - The expenseitemattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List expenseitemattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of expenseitemattachments
     */
    list(query?: IExpenseItemAttachmentsQuery): Promise<ApiResponse<IExpenseItemAttachments[]>>;
}
//# sourceMappingURL=expenseitemattachments.d.ts.map