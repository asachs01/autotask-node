import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IInventoryProducts {
    id?: number;
    [key: string]: any;
}
export interface IInventoryProductsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * InventoryProducts entity class for Autotask API
 *
 * Products available in inventory
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: inventory
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InventoryProductsEntity.htm}
 */
export declare class InventoryProducts extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new inventoryproducts
     * @param inventoryProducts - The inventoryproducts data to create
     * @returns Promise with the created inventoryproducts
     */
    create(inventoryProducts: IInventoryProducts): Promise<ApiResponse<IInventoryProducts>>;
    /**
     * Get a inventoryproducts by ID
     * @param id - The inventoryproducts ID
     * @returns Promise with the inventoryproducts data
     */
    get(id: number): Promise<ApiResponse<IInventoryProducts>>;
    /**
     * Update a inventoryproducts
     * @param id - The inventoryproducts ID
     * @param inventoryProducts - The updated inventoryproducts data
     * @returns Promise with the updated inventoryproducts
     */
    update(id: number, inventoryProducts: Partial<IInventoryProducts>): Promise<ApiResponse<IInventoryProducts>>;
    /**
     * Partially update a inventoryproducts
     * @param id - The inventoryproducts ID
     * @param inventoryProducts - The partial inventoryproducts data to update
     * @returns Promise with the updated inventoryproducts
     */
    patch(id: number, inventoryProducts: Partial<IInventoryProducts>): Promise<ApiResponse<IInventoryProducts>>;
    /**
     * Delete a inventoryproducts
     * @param id - The inventoryproducts ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List inventoryproducts with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of inventoryproducts
     */
    list(query?: IInventoryProductsQuery): Promise<ApiResponse<IInventoryProducts[]>>;
}
//# sourceMappingURL=inventoryproducts.d.ts.map