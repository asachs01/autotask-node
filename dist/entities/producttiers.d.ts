import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IProductTiers {
    id?: number;
    [key: string]: any;
}
export interface IProductTiersQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ProductTiers entity class for Autotask API
 *
 * Pricing tiers for products
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: inventory
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ProductTiersEntity.htm}
 */
export declare class ProductTiers extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new producttiers
     * @param productTiers - The producttiers data to create
     * @returns Promise with the created producttiers
     */
    create(productTiers: IProductTiers): Promise<ApiResponse<IProductTiers>>;
    /**
     * Get a producttiers by ID
     * @param id - The producttiers ID
     * @returns Promise with the producttiers data
     */
    get(id: number): Promise<ApiResponse<IProductTiers>>;
    /**
     * Update a producttiers
     * @param id - The producttiers ID
     * @param productTiers - The updated producttiers data
     * @returns Promise with the updated producttiers
     */
    update(id: number, productTiers: Partial<IProductTiers>): Promise<ApiResponse<IProductTiers>>;
    /**
     * Partially update a producttiers
     * @param id - The producttiers ID
     * @param productTiers - The partial producttiers data to update
     * @returns Promise with the updated producttiers
     */
    patch(id: number, productTiers: Partial<IProductTiers>): Promise<ApiResponse<IProductTiers>>;
    /**
     * Delete a producttiers
     * @param id - The producttiers ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List producttiers with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of producttiers
     */
    list(query?: IProductTiersQuery): Promise<ApiResponse<IProductTiers[]>>;
}
//# sourceMappingURL=producttiers.d.ts.map