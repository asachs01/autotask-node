import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IInventoryStockedItemsAdd {
    id?: number;
    [key: string]: any;
}
export interface IInventoryStockedItemsAddQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * InventoryStockedItemsAdd entity class for Autotask API
 *
 * Add items to inventory stock
 * Supported Operations: POST
 * Category: inventory
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InventoryStockedItemsAdd.htm}
 */
export declare class InventoryStockedItemsAdd extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new inventorystockeditemsadd
     * @param inventoryStockedItemsAdd - The inventorystockeditemsadd data to create
     * @returns Promise with the created inventorystockeditemsadd
     */
    create(inventoryStockedItemsAdd: IInventoryStockedItemsAdd): Promise<ApiResponse<IInventoryStockedItemsAdd>>;
    /**
     * List inventorystockeditemsadd with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of inventorystockeditemsadd
     */
    list(query?: IInventoryStockedItemsAddQuery): Promise<ApiResponse<IInventoryStockedItemsAdd[]>>;
}
//# sourceMappingURL=inventorystockeditemsadd.d.ts.map