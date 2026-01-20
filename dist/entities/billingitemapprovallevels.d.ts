import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IBillingItemApprovalLevels {
    id?: number;
    [key: string]: any;
}
export interface IBillingItemApprovalLevelsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * BillingItemApprovalLevels entity class for Autotask API
 *
 * Approval levels for billing items
 * Supported Operations: GET
 * Category: financial
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/BillingItemApprovalLevelsEntity.htm}
 */
export declare class BillingItemApprovalLevels extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a billingitemapprovallevels by ID
     * @param id - The billingitemapprovallevels ID
     * @returns Promise with the billingitemapprovallevels data
     */
    get(id: number): Promise<ApiResponse<IBillingItemApprovalLevels>>;
    /**
     * List billingitemapprovallevels with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of billingitemapprovallevels
     */
    list(query?: IBillingItemApprovalLevelsQuery): Promise<ApiResponse<IBillingItemApprovalLevels[]>>;
}
//# sourceMappingURL=billingitemapprovallevels.d.ts.map