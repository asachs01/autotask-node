import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IPriceListServices {
    id?: number;
    [key: string]: any;
}
export interface IPriceListServicesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * PriceListServices entity class for Autotask API
 *
 * Services in price lists
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: pricing
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PriceListServicesEntity.htm}
 */
export declare class PriceListServices extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new pricelistservices
     * @param priceListServices - The pricelistservices data to create
     * @returns Promise with the created pricelistservices
     */
    create(priceListServices: IPriceListServices): Promise<ApiResponse<IPriceListServices>>;
    /**
     * Get a pricelistservices by ID
     * @param id - The pricelistservices ID
     * @returns Promise with the pricelistservices data
     */
    get(id: number): Promise<ApiResponse<IPriceListServices>>;
    /**
     * Update a pricelistservices
     * @param id - The pricelistservices ID
     * @param priceListServices - The updated pricelistservices data
     * @returns Promise with the updated pricelistservices
     */
    update(id: number, priceListServices: Partial<IPriceListServices>): Promise<ApiResponse<IPriceListServices>>;
    /**
     * Partially update a pricelistservices
     * @param id - The pricelistservices ID
     * @param priceListServices - The partial pricelistservices data to update
     * @returns Promise with the updated pricelistservices
     */
    patch(id: number, priceListServices: Partial<IPriceListServices>): Promise<ApiResponse<IPriceListServices>>;
    /**
     * Delete a pricelistservices
     * @param id - The pricelistservices ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List pricelistservices with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of pricelistservices
     */
    list(query?: IPriceListServicesQuery): Promise<ApiResponse<IPriceListServices[]>>;
}
//# sourceMappingURL=pricelistservices.d.ts.map