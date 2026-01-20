import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IInventoryTransfers {
    id?: number;
    [key: string]: any;
}
export interface IInventoryTransfersQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * InventoryTransfers entity class for Autotask API
 *
 * Transfer records for inventory items
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: inventory
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InventoryTransfersEntity.htm}
 */
export declare class InventoryTransfers extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new inventorytransfers
     * @param inventoryTransfers - The inventorytransfers data to create
     * @returns Promise with the created inventorytransfers
     */
    create(inventoryTransfers: IInventoryTransfers): Promise<ApiResponse<IInventoryTransfers>>;
    /**
     * Get a inventorytransfers by ID
     * @param id - The inventorytransfers ID
     * @returns Promise with the inventorytransfers data
     */
    get(id: number): Promise<ApiResponse<IInventoryTransfers>>;
    /**
     * Update a inventorytransfers
     * @param id - The inventorytransfers ID
     * @param inventoryTransfers - The updated inventorytransfers data
     * @returns Promise with the updated inventorytransfers
     */
    update(id: number, inventoryTransfers: Partial<IInventoryTransfers>): Promise<ApiResponse<IInventoryTransfers>>;
    /**
     * Partially update a inventorytransfers
     * @param id - The inventorytransfers ID
     * @param inventoryTransfers - The partial inventorytransfers data to update
     * @returns Promise with the updated inventorytransfers
     */
    patch(id: number, inventoryTransfers: Partial<IInventoryTransfers>): Promise<ApiResponse<IInventoryTransfers>>;
    /**
     * Delete a inventorytransfers
     * @param id - The inventorytransfers ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List inventorytransfers with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of inventorytransfers
     */
    list(query?: IInventoryTransfersQuery): Promise<ApiResponse<IInventoryTransfers[]>>;
}
//# sourceMappingURL=inventorytransfers.d.ts.map