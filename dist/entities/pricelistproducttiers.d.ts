import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IPriceListProductTiers {
    id?: number;
    [key: string]: any;
}
export interface IPriceListProductTiersQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * PriceListProductTiers entity class for Autotask API
 *
 * Product tiers in price lists
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: pricing
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PriceListProductTiersEntity.htm}
 */
export declare class PriceListProductTiers extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new pricelistproducttiers
     * @param priceListProductTiers - The pricelistproducttiers data to create
     * @returns Promise with the created pricelistproducttiers
     */
    create(priceListProductTiers: IPriceListProductTiers): Promise<ApiResponse<IPriceListProductTiers>>;
    /**
     * Get a pricelistproducttiers by ID
     * @param id - The pricelistproducttiers ID
     * @returns Promise with the pricelistproducttiers data
     */
    get(id: number): Promise<ApiResponse<IPriceListProductTiers>>;
    /**
     * Update a pricelistproducttiers
     * @param id - The pricelistproducttiers ID
     * @param priceListProductTiers - The updated pricelistproducttiers data
     * @returns Promise with the updated pricelistproducttiers
     */
    update(id: number, priceListProductTiers: Partial<IPriceListProductTiers>): Promise<ApiResponse<IPriceListProductTiers>>;
    /**
     * Partially update a pricelistproducttiers
     * @param id - The pricelistproducttiers ID
     * @param priceListProductTiers - The partial pricelistproducttiers data to update
     * @returns Promise with the updated pricelistproducttiers
     */
    patch(id: number, priceListProductTiers: Partial<IPriceListProductTiers>): Promise<ApiResponse<IPriceListProductTiers>>;
    /**
     * Delete a pricelistproducttiers
     * @param id - The pricelistproducttiers ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List pricelistproducttiers with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of pricelistproducttiers
     */
    list(query?: IPriceListProductTiersQuery): Promise<ApiResponse<IPriceListProductTiers[]>>;
}
//# sourceMappingURL=pricelistproducttiers.d.ts.map