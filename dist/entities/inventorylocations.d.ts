import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IInventoryLocations {
    id?: number;
    [key: string]: any;
}
export interface IInventoryLocationsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * InventoryLocations entity class for Autotask API
 *
 * Physical locations for inventory storage
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: inventory
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InventoryLocationsEntity.htm}
 */
export declare class InventoryLocations extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new inventorylocations
     * @param inventoryLocations - The inventorylocations data to create
     * @returns Promise with the created inventorylocations
     */
    create(inventoryLocations: IInventoryLocations): Promise<ApiResponse<IInventoryLocations>>;
    /**
     * Get a inventorylocations by ID
     * @param id - The inventorylocations ID
     * @returns Promise with the inventorylocations data
     */
    get(id: number): Promise<ApiResponse<IInventoryLocations>>;
    /**
     * Update a inventorylocations
     * @param id - The inventorylocations ID
     * @param inventoryLocations - The updated inventorylocations data
     * @returns Promise with the updated inventorylocations
     */
    update(id: number, inventoryLocations: Partial<IInventoryLocations>): Promise<ApiResponse<IInventoryLocations>>;
    /**
     * Partially update a inventorylocations
     * @param id - The inventorylocations ID
     * @param inventoryLocations - The partial inventorylocations data to update
     * @returns Promise with the updated inventorylocations
     */
    patch(id: number, inventoryLocations: Partial<IInventoryLocations>): Promise<ApiResponse<IInventoryLocations>>;
    /**
     * Delete a inventorylocations
     * @param id - The inventorylocations ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List inventorylocations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of inventorylocations
     */
    list(query?: IInventoryLocationsQuery): Promise<ApiResponse<IInventoryLocations[]>>;
}
//# sourceMappingURL=inventorylocations.d.ts.map