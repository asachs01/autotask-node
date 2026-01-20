import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IBillingCodes {
    id?: number;
    [key: string]: any;
}
export interface IBillingCodesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * BillingCodes entity class for Autotask API
 *
 * Billing codes for time and expense tracking
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: financial
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/BillingCodesEntity.htm}
 */
export declare class BillingCodes extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new billingcodes
     * @param billingCodes - The billingcodes data to create
     * @returns Promise with the created billingcodes
     */
    create(billingCodes: IBillingCodes): Promise<ApiResponse<IBillingCodes>>;
    /**
     * Get a billingcodes by ID
     * @param id - The billingcodes ID
     * @returns Promise with the billingcodes data
     */
    get(id: number): Promise<ApiResponse<IBillingCodes>>;
    /**
     * Update a billingcodes
     * @param id - The billingcodes ID
     * @param billingCodes - The updated billingcodes data
     * @returns Promise with the updated billingcodes
     */
    update(id: number, billingCodes: Partial<IBillingCodes>): Promise<ApiResponse<IBillingCodes>>;
    /**
     * Partially update a billingcodes
     * @param id - The billingcodes ID
     * @param billingCodes - The partial billingcodes data to update
     * @returns Promise with the updated billingcodes
     */
    patch(id: number, billingCodes: Partial<IBillingCodes>): Promise<ApiResponse<IBillingCodes>>;
    /**
     * List billingcodes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of billingcodes
     */
    list(query?: IBillingCodesQuery): Promise<ApiResponse<IBillingCodes[]>>;
}
//# sourceMappingURL=billingcodes.d.ts.map