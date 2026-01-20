import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IResourceTimeOffBalances {
    id?: number;
    [key: string]: any;
}
export interface IResourceTimeOffBalancesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ResourceTimeOffBalances entity class for Autotask API
 *
 * Time off balances for resources
 * Supported Operations: GET
 * Category: time
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourceTimeOffBalanceEntity.htm}
 */
export declare class ResourceTimeOffBalances extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a resourcetimeoffbalances by ID
     * @param id - The resourcetimeoffbalances ID
     * @returns Promise with the resourcetimeoffbalances data
     */
    get(id: number): Promise<ApiResponse<IResourceTimeOffBalances>>;
    /**
     * List resourcetimeoffbalances with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of resourcetimeoffbalances
     */
    list(query?: IResourceTimeOffBalancesQuery): Promise<ApiResponse<IResourceTimeOffBalances[]>>;
}
//# sourceMappingURL=resourcetimeoffbalances.d.ts.map