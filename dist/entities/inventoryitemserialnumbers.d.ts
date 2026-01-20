import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IInventoryItemSerialNumbers {
    id?: number;
    [key: string]: any;
}
export interface IInventoryItemSerialNumbersQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * InventoryItemSerialNumbers entity class for Autotask API
 *
 * Serial numbers for inventory items
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: inventory
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InventoryItemSerialNumbersEntity.htm}
 */
export declare class InventoryItemSerialNumbers extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new inventoryitemserialnumbers
     * @param inventoryItemSerialNumbers - The inventoryitemserialnumbers data to create
     * @returns Promise with the created inventoryitemserialnumbers
     */
    create(inventoryItemSerialNumbers: IInventoryItemSerialNumbers): Promise<ApiResponse<IInventoryItemSerialNumbers>>;
    /**
     * Get a inventoryitemserialnumbers by ID
     * @param id - The inventoryitemserialnumbers ID
     * @returns Promise with the inventoryitemserialnumbers data
     */
    get(id: number): Promise<ApiResponse<IInventoryItemSerialNumbers>>;
    /**
     * Update a inventoryitemserialnumbers
     * @param id - The inventoryitemserialnumbers ID
     * @param inventoryItemSerialNumbers - The updated inventoryitemserialnumbers data
     * @returns Promise with the updated inventoryitemserialnumbers
     */
    update(id: number, inventoryItemSerialNumbers: Partial<IInventoryItemSerialNumbers>): Promise<ApiResponse<IInventoryItemSerialNumbers>>;
    /**
     * Partially update a inventoryitemserialnumbers
     * @param id - The inventoryitemserialnumbers ID
     * @param inventoryItemSerialNumbers - The partial inventoryitemserialnumbers data to update
     * @returns Promise with the updated inventoryitemserialnumbers
     */
    patch(id: number, inventoryItemSerialNumbers: Partial<IInventoryItemSerialNumbers>): Promise<ApiResponse<IInventoryItemSerialNumbers>>;
    /**
     * Delete a inventoryitemserialnumbers
     * @param id - The inventoryitemserialnumbers ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List inventoryitemserialnumbers with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of inventoryitemserialnumbers
     */
    list(query?: IInventoryItemSerialNumbersQuery): Promise<ApiResponse<IInventoryItemSerialNumbers[]>>;
}
//# sourceMappingURL=inventoryitemserialnumbers.d.ts.map