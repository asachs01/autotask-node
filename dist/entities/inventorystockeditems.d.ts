import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IInventoryStockedItems {
    id?: number;
    [key: string]: any;
}
export interface IInventoryStockedItemsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * InventoryStockedItems entity class for Autotask API
 *
 * Items currently stocked in inventory
 * Supported Operations: GET
 * Category: inventory
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InventoryStockedItems.htm}
 */
export declare class InventoryStockedItems extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a inventorystockeditems by ID
     * @param id - The inventorystockeditems ID
     * @returns Promise with the inventorystockeditems data
     */
    get(id: number): Promise<ApiResponse<IInventoryStockedItems>>;
    /**
     * List inventorystockeditems with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of inventorystockeditems
     */
    list(query?: IInventoryStockedItemsQuery): Promise<ApiResponse<IInventoryStockedItems[]>>;
}
//# sourceMappingURL=inventorystockeditems.d.ts.map