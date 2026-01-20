import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IInventoryItems {
    id?: number;
    [key: string]: any;
}
export interface IInventoryItemsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * InventoryItems entity class for Autotask API
 *
 * Items in inventory
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: inventory
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InventoryItemsEntity.htm}
 */
export declare class InventoryItems extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new inventoryitems
     * @param inventoryItems - The inventoryitems data to create
     * @returns Promise with the created inventoryitems
     */
    create(inventoryItems: IInventoryItems): Promise<ApiResponse<IInventoryItems>>;
    /**
     * Get a inventoryitems by ID
     * @param id - The inventoryitems ID
     * @returns Promise with the inventoryitems data
     */
    get(id: number): Promise<ApiResponse<IInventoryItems>>;
    /**
     * Update a inventoryitems
     * @param id - The inventoryitems ID
     * @param inventoryItems - The updated inventoryitems data
     * @returns Promise with the updated inventoryitems
     */
    update(id: number, inventoryItems: Partial<IInventoryItems>): Promise<ApiResponse<IInventoryItems>>;
    /**
     * Partially update a inventoryitems
     * @param id - The inventoryitems ID
     * @param inventoryItems - The partial inventoryitems data to update
     * @returns Promise with the updated inventoryitems
     */
    patch(id: number, inventoryItems: Partial<IInventoryItems>): Promise<ApiResponse<IInventoryItems>>;
    /**
     * Delete a inventoryitems
     * @param id - The inventoryitems ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List inventoryitems with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of inventoryitems
     */
    list(query?: IInventoryItemsQuery): Promise<ApiResponse<IInventoryItems[]>>;
}
//# sourceMappingURL=inventoryitems.d.ts.map