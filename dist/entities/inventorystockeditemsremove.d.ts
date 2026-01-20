import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IInventoryStockedItemsRemove {
    id?: number;
    [key: string]: any;
}
export interface IInventoryStockedItemsRemoveQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * InventoryStockedItemsRemove entity class for Autotask API
 *
 * Remove items from inventory stock
 * Supported Operations: POST
 * Category: inventory
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InventoryStockedItemsRemove.htm}
 */
export declare class InventoryStockedItemsRemove extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new inventorystockeditemsremove
     * @param inventoryStockedItemsRemove - The inventorystockeditemsremove data to create
     * @returns Promise with the created inventorystockeditemsremove
     */
    create(inventoryStockedItemsRemove: IInventoryStockedItemsRemove): Promise<ApiResponse<IInventoryStockedItemsRemove>>;
    /**
     * List inventorystockeditemsremove with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of inventorystockeditemsremove
     */
    list(query?: IInventoryStockedItemsRemoveQuery): Promise<ApiResponse<IInventoryStockedItemsRemove[]>>;
}
//# sourceMappingURL=inventorystockeditemsremove.d.ts.map