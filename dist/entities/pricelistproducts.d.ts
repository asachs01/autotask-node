import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IPriceListProducts {
    id?: number;
    [key: string]: any;
}
export interface IPriceListProductsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * PriceListProducts entity class for Autotask API
 *
 * Products in price lists
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: pricing
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PriceListProductsEntity.htm}
 */
export declare class PriceListProducts extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new pricelistproducts
     * @param priceListProducts - The pricelistproducts data to create
     * @returns Promise with the created pricelistproducts
     */
    create(priceListProducts: IPriceListProducts): Promise<ApiResponse<IPriceListProducts>>;
    /**
     * Get a pricelistproducts by ID
     * @param id - The pricelistproducts ID
     * @returns Promise with the pricelistproducts data
     */
    get(id: number): Promise<ApiResponse<IPriceListProducts>>;
    /**
     * Update a pricelistproducts
     * @param id - The pricelistproducts ID
     * @param priceListProducts - The updated pricelistproducts data
     * @returns Promise with the updated pricelistproducts
     */
    update(id: number, priceListProducts: Partial<IPriceListProducts>): Promise<ApiResponse<IPriceListProducts>>;
    /**
     * Partially update a pricelistproducts
     * @param id - The pricelistproducts ID
     * @param priceListProducts - The partial pricelistproducts data to update
     * @returns Promise with the updated pricelistproducts
     */
    patch(id: number, priceListProducts: Partial<IPriceListProducts>): Promise<ApiResponse<IPriceListProducts>>;
    /**
     * Delete a pricelistproducts
     * @param id - The pricelistproducts ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List pricelistproducts with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of pricelistproducts
     */
    list(query?: IPriceListProductsQuery): Promise<ApiResponse<IPriceListProducts[]>>;
}
//# sourceMappingURL=pricelistproducts.d.ts.map