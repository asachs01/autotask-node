import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IPriceListMaterialCodes {
    id?: number;
    [key: string]: any;
}
export interface IPriceListMaterialCodesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * PriceListMaterialCodes entity class for Autotask API
 *
 * Material codes in price lists
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: pricing
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PriceListMaterialCodesEntity.htm}
 */
export declare class PriceListMaterialCodes extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new pricelistmaterialcodes
     * @param priceListMaterialCodes - The pricelistmaterialcodes data to create
     * @returns Promise with the created pricelistmaterialcodes
     */
    create(priceListMaterialCodes: IPriceListMaterialCodes): Promise<ApiResponse<IPriceListMaterialCodes>>;
    /**
     * Get a pricelistmaterialcodes by ID
     * @param id - The pricelistmaterialcodes ID
     * @returns Promise with the pricelistmaterialcodes data
     */
    get(id: number): Promise<ApiResponse<IPriceListMaterialCodes>>;
    /**
     * Update a pricelistmaterialcodes
     * @param id - The pricelistmaterialcodes ID
     * @param priceListMaterialCodes - The updated pricelistmaterialcodes data
     * @returns Promise with the updated pricelistmaterialcodes
     */
    update(id: number, priceListMaterialCodes: Partial<IPriceListMaterialCodes>): Promise<ApiResponse<IPriceListMaterialCodes>>;
    /**
     * Partially update a pricelistmaterialcodes
     * @param id - The pricelistmaterialcodes ID
     * @param priceListMaterialCodes - The partial pricelistmaterialcodes data to update
     * @returns Promise with the updated pricelistmaterialcodes
     */
    patch(id: number, priceListMaterialCodes: Partial<IPriceListMaterialCodes>): Promise<ApiResponse<IPriceListMaterialCodes>>;
    /**
     * Delete a pricelistmaterialcodes
     * @param id - The pricelistmaterialcodes ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List pricelistmaterialcodes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of pricelistmaterialcodes
     */
    list(query?: IPriceListMaterialCodesQuery): Promise<ApiResponse<IPriceListMaterialCodes[]>>;
}
//# sourceMappingURL=pricelistmaterialcodes.d.ts.map