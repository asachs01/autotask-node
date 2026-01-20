import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IAdditionalInvoiceFieldValues {
    id?: number;
    [key: string]: any;
}
export interface IAdditionalInvoiceFieldValuesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * AdditionalInvoiceFieldValues entity class for Autotask API
 *
 * Additional invoice field values
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: associations
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/AdditionalInvoiceFieldValuesEntity.htm}
 */
export declare class AdditionalInvoiceFieldValues extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new additionalinvoicefieldvalues
     * @param additionalInvoiceFieldValues - The additionalinvoicefieldvalues data to create
     * @returns Promise with the created additionalinvoicefieldvalues
     */
    create(additionalInvoiceFieldValues: IAdditionalInvoiceFieldValues): Promise<ApiResponse<IAdditionalInvoiceFieldValues>>;
    /**
     * Get a additionalinvoicefieldvalues by ID
     * @param id - The additionalinvoicefieldvalues ID
     * @returns Promise with the additionalinvoicefieldvalues data
     */
    get(id: number): Promise<ApiResponse<IAdditionalInvoiceFieldValues>>;
    /**
     * Update a additionalinvoicefieldvalues
     * @param id - The additionalinvoicefieldvalues ID
     * @param additionalInvoiceFieldValues - The updated additionalinvoicefieldvalues data
     * @returns Promise with the updated additionalinvoicefieldvalues
     */
    update(id: number, additionalInvoiceFieldValues: Partial<IAdditionalInvoiceFieldValues>): Promise<ApiResponse<IAdditionalInvoiceFieldValues>>;
    /**
     * Partially update a additionalinvoicefieldvalues
     * @param id - The additionalinvoicefieldvalues ID
     * @param additionalInvoiceFieldValues - The partial additionalinvoicefieldvalues data to update
     * @returns Promise with the updated additionalinvoicefieldvalues
     */
    patch(id: number, additionalInvoiceFieldValues: Partial<IAdditionalInvoiceFieldValues>): Promise<ApiResponse<IAdditionalInvoiceFieldValues>>;
    /**
     * List additionalinvoicefieldvalues with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of additionalinvoicefieldvalues
     */
    list(query?: IAdditionalInvoiceFieldValuesQuery): Promise<ApiResponse<IAdditionalInvoiceFieldValues[]>>;
}
//# sourceMappingURL=additionalinvoicefieldvalues.d.ts.map