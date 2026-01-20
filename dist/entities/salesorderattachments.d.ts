import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ISalesOrderAttachments {
    id?: number;
    [key: string]: any;
}
export interface ISalesOrderAttachmentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * SalesOrderAttachments entity class for Autotask API
 *
 * File attachments for sales orders
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/SalesOrderAttachmentsEntity.htm}
 */
export declare class SalesOrderAttachments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new salesorderattachments
     * @param salesOrderAttachments - The salesorderattachments data to create
     * @returns Promise with the created salesorderattachments
     */
    create(salesOrderAttachments: ISalesOrderAttachments): Promise<ApiResponse<ISalesOrderAttachments>>;
    /**
     * Get a salesorderattachments by ID
     * @param id - The salesorderattachments ID
     * @returns Promise with the salesorderattachments data
     */
    get(id: number): Promise<ApiResponse<ISalesOrderAttachments>>;
    /**
     * Delete a salesorderattachments
     * @param id - The salesorderattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List salesorderattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of salesorderattachments
     */
    list(query?: ISalesOrderAttachmentsQuery): Promise<ApiResponse<ISalesOrderAttachments[]>>;
}
//# sourceMappingURL=salesorderattachments.d.ts.map