import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IExpenseReportAttachments {
    id?: number;
    [key: string]: any;
}
export interface IExpenseReportAttachmentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ExpenseReportAttachments entity class for Autotask API
 *
 * File attachments for expense reports
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ExpenseReportAttachmentsEntity.htm}
 */
export declare class ExpenseReportAttachments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new expensereportattachments
     * @param expenseReportAttachments - The expensereportattachments data to create
     * @returns Promise with the created expensereportattachments
     */
    create(expenseReportAttachments: IExpenseReportAttachments): Promise<ApiResponse<IExpenseReportAttachments>>;
    /**
     * Get a expensereportattachments by ID
     * @param id - The expensereportattachments ID
     * @returns Promise with the expensereportattachments data
     */
    get(id: number): Promise<ApiResponse<IExpenseReportAttachments>>;
    /**
     * Delete a expensereportattachments
     * @param id - The expensereportattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List expensereportattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of expensereportattachments
     */
    list(query?: IExpenseReportAttachmentsQuery): Promise<ApiResponse<IExpenseReportAttachments[]>>;
}
//# sourceMappingURL=expensereportattachments.d.ts.map