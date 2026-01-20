import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IPurchaseOrders {
    id?: number;
    [key: string]: any;
}
export interface IPurchaseOrdersQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * PurchaseOrders entity class for Autotask API
 *
 * Purchase orders for procurement
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: financial
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PurchaseOrdersEntity.htm}
 */
export declare class PurchaseOrders extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new purchaseorders
     * @param purchaseOrders - The purchaseorders data to create
     * @returns Promise with the created purchaseorders
     */
    create(purchaseOrders: IPurchaseOrders): Promise<ApiResponse<IPurchaseOrders>>;
    /**
     * Get a purchaseorders by ID
     * @param id - The purchaseorders ID
     * @returns Promise with the purchaseorders data
     */
    get(id: number): Promise<ApiResponse<IPurchaseOrders>>;
    /**
     * Update a purchaseorders
     * @param id - The purchaseorders ID
     * @param purchaseOrders - The updated purchaseorders data
     * @returns Promise with the updated purchaseorders
     */
    update(id: number, purchaseOrders: Partial<IPurchaseOrders>): Promise<ApiResponse<IPurchaseOrders>>;
    /**
     * Partially update a purchaseorders
     * @param id - The purchaseorders ID
     * @param purchaseOrders - The partial purchaseorders data to update
     * @returns Promise with the updated purchaseorders
     */
    patch(id: number, purchaseOrders: Partial<IPurchaseOrders>): Promise<ApiResponse<IPurchaseOrders>>;
    /**
     * List purchaseorders with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of purchaseorders
     */
    list(query?: IPurchaseOrdersQuery): Promise<ApiResponse<IPurchaseOrders[]>>;
}
//# sourceMappingURL=purchaseorders.d.ts.map