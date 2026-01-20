import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IPurchaseOrderItemReceiving {
    id?: number;
    [key: string]: any;
}
export interface IPurchaseOrderItemReceivingQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * PurchaseOrderItemReceiving entity class for Autotask API
 *
 * Receiving records for purchase order items
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: financial
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PurchaseOrderItemReceivingEntity.htm}
 */
export declare class PurchaseOrderItemReceiving extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new purchaseorderitemreceiving
     * @param purchaseOrderItemReceiving - The purchaseorderitemreceiving data to create
     * @returns Promise with the created purchaseorderitemreceiving
     */
    create(purchaseOrderItemReceiving: IPurchaseOrderItemReceiving): Promise<ApiResponse<IPurchaseOrderItemReceiving>>;
    /**
     * Get a purchaseorderitemreceiving by ID
     * @param id - The purchaseorderitemreceiving ID
     * @returns Promise with the purchaseorderitemreceiving data
     */
    get(id: number): Promise<ApiResponse<IPurchaseOrderItemReceiving>>;
    /**
     * Update a purchaseorderitemreceiving
     * @param id - The purchaseorderitemreceiving ID
     * @param purchaseOrderItemReceiving - The updated purchaseorderitemreceiving data
     * @returns Promise with the updated purchaseorderitemreceiving
     */
    update(id: number, purchaseOrderItemReceiving: Partial<IPurchaseOrderItemReceiving>): Promise<ApiResponse<IPurchaseOrderItemReceiving>>;
    /**
     * Partially update a purchaseorderitemreceiving
     * @param id - The purchaseorderitemreceiving ID
     * @param purchaseOrderItemReceiving - The partial purchaseorderitemreceiving data to update
     * @returns Promise with the updated purchaseorderitemreceiving
     */
    patch(id: number, purchaseOrderItemReceiving: Partial<IPurchaseOrderItemReceiving>): Promise<ApiResponse<IPurchaseOrderItemReceiving>>;
    /**
     * List purchaseorderitemreceiving with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of purchaseorderitemreceiving
     */
    list(query?: IPurchaseOrderItemReceivingQuery): Promise<ApiResponse<IPurchaseOrderItemReceiving[]>>;
}
//# sourceMappingURL=purchaseorderitemreceiving.d.ts.map