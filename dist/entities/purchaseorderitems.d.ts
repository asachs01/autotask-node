import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IPurchaseOrderItems {
    id?: number;
    [key: string]: any;
}
export interface IPurchaseOrderItemsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * PurchaseOrderItems entity class for Autotask API
 *
 * Items within purchase orders
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: financial
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PurchaseOrderItemsEntity.htm}
 */
export declare class PurchaseOrderItems extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new purchaseorderitems
     * @param purchaseOrderItems - The purchaseorderitems data to create
     * @returns Promise with the created purchaseorderitems
     */
    create(purchaseOrderItems: IPurchaseOrderItems): Promise<ApiResponse<IPurchaseOrderItems>>;
    /**
     * Get a purchaseorderitems by ID
     * @param id - The purchaseorderitems ID
     * @returns Promise with the purchaseorderitems data
     */
    get(id: number): Promise<ApiResponse<IPurchaseOrderItems>>;
    /**
     * Update a purchaseorderitems
     * @param id - The purchaseorderitems ID
     * @param purchaseOrderItems - The updated purchaseorderitems data
     * @returns Promise with the updated purchaseorderitems
     */
    update(id: number, purchaseOrderItems: Partial<IPurchaseOrderItems>): Promise<ApiResponse<IPurchaseOrderItems>>;
    /**
     * Partially update a purchaseorderitems
     * @param id - The purchaseorderitems ID
     * @param purchaseOrderItems - The partial purchaseorderitems data to update
     * @returns Promise with the updated purchaseorderitems
     */
    patch(id: number, purchaseOrderItems: Partial<IPurchaseOrderItems>): Promise<ApiResponse<IPurchaseOrderItems>>;
    /**
     * Delete a purchaseorderitems
     * @param id - The purchaseorderitems ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List purchaseorderitems with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of purchaseorderitems
     */
    list(query?: IPurchaseOrderItemsQuery): Promise<ApiResponse<IPurchaseOrderItems[]>>;
}
//# sourceMappingURL=purchaseorderitems.d.ts.map