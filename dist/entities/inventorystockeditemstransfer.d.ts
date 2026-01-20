import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IInventoryStockedItemsTransfer {
    id?: number;
    [key: string]: any;
}
export interface IInventoryStockedItemsTransferQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * InventoryStockedItemsTransfer entity class for Autotask API
 *
 * Transfer items between inventory locations
 * Supported Operations: POST
 * Category: inventory
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InventoryStockedItemsTransfer.htm}
 */
export declare class InventoryStockedItemsTransfer extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new inventorystockeditemstransfer
     * @param inventoryStockedItemsTransfer - The inventorystockeditemstransfer data to create
     * @returns Promise with the created inventorystockeditemstransfer
     */
    create(inventoryStockedItemsTransfer: IInventoryStockedItemsTransfer): Promise<ApiResponse<IInventoryStockedItemsTransfer>>;
    /**
     * List inventorystockeditemstransfer with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of inventorystockeditemstransfer
     */
    list(query?: IInventoryStockedItemsTransferQuery): Promise<ApiResponse<IInventoryStockedItemsTransfer[]>>;
}
//# sourceMappingURL=inventorystockeditemstransfer.d.ts.map