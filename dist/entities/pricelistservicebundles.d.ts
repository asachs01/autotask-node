import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IPriceListServiceBundles {
    id?: number;
    [key: string]: any;
}
export interface IPriceListServiceBundlesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * PriceListServiceBundles entity class for Autotask API
 *
 * Service bundles in price lists
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: pricing
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PriceListServiceBundlesEntity.htm}
 */
export declare class PriceListServiceBundles extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new pricelistservicebundles
     * @param priceListServiceBundles - The pricelistservicebundles data to create
     * @returns Promise with the created pricelistservicebundles
     */
    create(priceListServiceBundles: IPriceListServiceBundles): Promise<ApiResponse<IPriceListServiceBundles>>;
    /**
     * Get a pricelistservicebundles by ID
     * @param id - The pricelistservicebundles ID
     * @returns Promise with the pricelistservicebundles data
     */
    get(id: number): Promise<ApiResponse<IPriceListServiceBundles>>;
    /**
     * Update a pricelistservicebundles
     * @param id - The pricelistservicebundles ID
     * @param priceListServiceBundles - The updated pricelistservicebundles data
     * @returns Promise with the updated pricelistservicebundles
     */
    update(id: number, priceListServiceBundles: Partial<IPriceListServiceBundles>): Promise<ApiResponse<IPriceListServiceBundles>>;
    /**
     * Partially update a pricelistservicebundles
     * @param id - The pricelistservicebundles ID
     * @param priceListServiceBundles - The partial pricelistservicebundles data to update
     * @returns Promise with the updated pricelistservicebundles
     */
    patch(id: number, priceListServiceBundles: Partial<IPriceListServiceBundles>): Promise<ApiResponse<IPriceListServiceBundles>>;
    /**
     * Delete a pricelistservicebundles
     * @param id - The pricelistservicebundles ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List pricelistservicebundles with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of pricelistservicebundles
     */
    list(query?: IPriceListServiceBundlesQuery): Promise<ApiResponse<IPriceListServiceBundles[]>>;
}
//# sourceMappingURL=pricelistservicebundles.d.ts.map