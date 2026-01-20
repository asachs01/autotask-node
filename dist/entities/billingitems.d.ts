import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IBillingItems {
    id?: number;
    [key: string]: any;
}
export interface IBillingItemsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * BillingItems entity class for Autotask API
 *
 * Billing items for invoicing
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: financial
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/BillingItemsEntity.htm}
 */
export declare class BillingItems extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new billingitems
     * @param billingItems - The billingitems data to create
     * @returns Promise with the created billingitems
     */
    create(billingItems: IBillingItems): Promise<ApiResponse<IBillingItems>>;
    /**
     * Get a billingitems by ID
     * @param id - The billingitems ID
     * @returns Promise with the billingitems data
     */
    get(id: number): Promise<ApiResponse<IBillingItems>>;
    /**
     * Update a billingitems
     * @param id - The billingitems ID
     * @param billingItems - The updated billingitems data
     * @returns Promise with the updated billingitems
     */
    update(id: number, billingItems: Partial<IBillingItems>): Promise<ApiResponse<IBillingItems>>;
    /**
     * Partially update a billingitems
     * @param id - The billingitems ID
     * @param billingItems - The partial billingitems data to update
     * @returns Promise with the updated billingitems
     */
    patch(id: number, billingItems: Partial<IBillingItems>): Promise<ApiResponse<IBillingItems>>;
    /**
     * Delete a billingitems
     * @param id - The billingitems ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List billingitems with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of billingitems
     */
    list(query?: IBillingItemsQuery): Promise<ApiResponse<IBillingItems[]>>;
}
//# sourceMappingURL=billingitems.d.ts.map