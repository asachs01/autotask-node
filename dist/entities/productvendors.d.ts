import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IProductVendors {
    id?: number;
    [key: string]: any;
}
export interface IProductVendorsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ProductVendors entity class for Autotask API
 *
 * Vendor information for products
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: inventory
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ProductVendorsEntity.htm}
 */
export declare class ProductVendors extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new productvendors
     * @param productVendors - The productvendors data to create
     * @returns Promise with the created productvendors
     */
    create(productVendors: IProductVendors): Promise<ApiResponse<IProductVendors>>;
    /**
     * Get a productvendors by ID
     * @param id - The productvendors ID
     * @returns Promise with the productvendors data
     */
    get(id: number): Promise<ApiResponse<IProductVendors>>;
    /**
     * Update a productvendors
     * @param id - The productvendors ID
     * @param productVendors - The updated productvendors data
     * @returns Promise with the updated productvendors
     */
    update(id: number, productVendors: Partial<IProductVendors>): Promise<ApiResponse<IProductVendors>>;
    /**
     * Partially update a productvendors
     * @param id - The productvendors ID
     * @param productVendors - The partial productvendors data to update
     * @returns Promise with the updated productvendors
     */
    patch(id: number, productVendors: Partial<IProductVendors>): Promise<ApiResponse<IProductVendors>>;
    /**
     * Delete a productvendors
     * @param id - The productvendors ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List productvendors with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of productvendors
     */
    list(query?: IProductVendorsQuery): Promise<ApiResponse<IProductVendors[]>>;
}
//# sourceMappingURL=productvendors.d.ts.map