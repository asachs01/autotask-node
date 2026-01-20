import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITaxes {
    id?: number;
    [key: string]: any;
}
export interface ITaxesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Taxes entity class for Autotask API
 *
 * Tax rates and calculations
 * Supported Operations: GET
 * Category: financial
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TaxesEntity.htm}
 */
export declare class Taxes extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a taxes by ID
     * @param id - The taxes ID
     * @returns Promise with the taxes data
     */
    get(id: number): Promise<ApiResponse<ITaxes>>;
    /**
     * List taxes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of taxes
     */
    list(query?: ITaxesQuery): Promise<ApiResponse<ITaxes[]>>;
}
//# sourceMappingURL=taxes.d.ts.map