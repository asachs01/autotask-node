import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IInvoices {
    id?: number;
    [key: string]: any;
}
export interface IInvoicesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Invoices entity class for Autotask API
 *
 * Customer invoices and billing
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: financial
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InvoicesEntity.htm}
 */
export declare class Invoices extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new invoices
     * @param invoices - The invoices data to create
     * @returns Promise with the created invoices
     */
    create(invoices: IInvoices): Promise<ApiResponse<IInvoices>>;
    /**
     * Get a invoices by ID
     * @param id - The invoices ID
     * @returns Promise with the invoices data
     */
    get(id: number): Promise<ApiResponse<IInvoices>>;
    /**
     * Update a invoices
     * @param id - The invoices ID
     * @param invoices - The updated invoices data
     * @returns Promise with the updated invoices
     */
    update(id: number, invoices: Partial<IInvoices>): Promise<ApiResponse<IInvoices>>;
    /**
     * Partially update a invoices
     * @param id - The invoices ID
     * @param invoices - The partial invoices data to update
     * @returns Promise with the updated invoices
     */
    patch(id: number, invoices: Partial<IInvoices>): Promise<ApiResponse<IInvoices>>;
    /**
     * List invoices with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of invoices
     */
    list(query?: IInvoicesQuery): Promise<ApiResponse<IInvoices[]>>;
}
//# sourceMappingURL=invoices.d.ts.map