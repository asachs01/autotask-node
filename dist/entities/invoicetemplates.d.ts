import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IInvoiceTemplates {
    id?: number;
    [key: string]: any;
}
export interface IInvoiceTemplatesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * InvoiceTemplates entity class for Autotask API
 *
 * Templates for generating invoices
 * Supported Operations: GET
 * Category: financial
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InvoiceTemplatesEntity.htm}
 */
export declare class InvoiceTemplates extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a invoicetemplates by ID
     * @param id - The invoicetemplates ID
     * @returns Promise with the invoicetemplates data
     */
    get(id: number): Promise<ApiResponse<IInvoiceTemplates>>;
    /**
     * List invoicetemplates with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of invoicetemplates
     */
    list(query?: IInvoiceTemplatesQuery): Promise<ApiResponse<IInvoiceTemplates[]>>;
}
//# sourceMappingURL=invoicetemplates.d.ts.map