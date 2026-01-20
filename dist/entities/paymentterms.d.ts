import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IPaymentTerms {
    id?: number;
    [key: string]: any;
}
export interface IPaymentTermsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * PaymentTerms entity class for Autotask API
 *
 * Available payment terms for invoicing
 * Supported Operations: GET
 * Category: financial
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PaymentTermsEntity.htm}
 */
export declare class PaymentTerms extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a paymentterms by ID
     * @param id - The paymentterms ID
     * @returns Promise with the paymentterms data
     */
    get(id: number): Promise<ApiResponse<IPaymentTerms>>;
    /**
     * List paymentterms with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of paymentterms
     */
    list(query?: IPaymentTermsQuery): Promise<ApiResponse<IPaymentTerms[]>>;
}
//# sourceMappingURL=paymentterms.d.ts.map