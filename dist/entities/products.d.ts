import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IProducts {
    id?: number;
    [key: string]: any;
}
export interface IProductsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Products entity class for Autotask API
 *
 * Products and services offered
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: inventory
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ProductsEntity.htm}
 */
export declare class Products extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new products
     * @param products - The products data to create
     * @returns Promise with the created products
     */
    create(products: IProducts): Promise<ApiResponse<IProducts>>;
    /**
     * Get a products by ID
     * @param id - The products ID
     * @returns Promise with the products data
     */
    get(id: number): Promise<ApiResponse<IProducts>>;
    /**
     * Update a products
     * @param id - The products ID
     * @param products - The updated products data
     * @returns Promise with the updated products
     */
    update(id: number, products: Partial<IProducts>): Promise<ApiResponse<IProducts>>;
    /**
     * Partially update a products
     * @param id - The products ID
     * @param products - The partial products data to update
     * @returns Promise with the updated products
     */
    patch(id: number, products: Partial<IProducts>): Promise<ApiResponse<IProducts>>;
    /**
     * List products with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of products
     */
    list(query?: IProductsQuery): Promise<ApiResponse<IProducts[]>>;
}
//# sourceMappingURL=products.d.ts.map