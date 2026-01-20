import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITaxRegions {
    id?: number;
    [key: string]: any;
}
export interface ITaxRegionsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TaxRegions entity class for Autotask API
 *
 * Geographic regions for tax purposes
 * Supported Operations: GET
 * Category: financial
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TaxRegionsEntity.htm}
 */
export declare class TaxRegions extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a taxregions by ID
     * @param id - The taxregions ID
     * @returns Promise with the taxregions data
     */
    get(id: number): Promise<ApiResponse<ITaxRegions>>;
    /**
     * List taxregions with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of taxregions
     */
    list(query?: ITaxRegionsQuery): Promise<ApiResponse<ITaxRegions[]>>;
}
//# sourceMappingURL=taxregions.d.ts.map