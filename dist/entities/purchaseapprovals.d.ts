import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IPurchaseApprovals {
    id?: number;
    [key: string]: any;
}
export interface IPurchaseApprovalsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * PurchaseApprovals entity class for Autotask API
 *
 * Approvals for purchase orders
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: financial
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PurchaseApprovalsEntity.htm}
 */
export declare class PurchaseApprovals extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new purchaseapprovals
     * @param purchaseApprovals - The purchaseapprovals data to create
     * @returns Promise with the created purchaseapprovals
     */
    create(purchaseApprovals: IPurchaseApprovals): Promise<ApiResponse<IPurchaseApprovals>>;
    /**
     * Get a purchaseapprovals by ID
     * @param id - The purchaseapprovals ID
     * @returns Promise with the purchaseapprovals data
     */
    get(id: number): Promise<ApiResponse<IPurchaseApprovals>>;
    /**
     * Update a purchaseapprovals
     * @param id - The purchaseapprovals ID
     * @param purchaseApprovals - The updated purchaseapprovals data
     * @returns Promise with the updated purchaseapprovals
     */
    update(id: number, purchaseApprovals: Partial<IPurchaseApprovals>): Promise<ApiResponse<IPurchaseApprovals>>;
    /**
     * Partially update a purchaseapprovals
     * @param id - The purchaseapprovals ID
     * @param purchaseApprovals - The partial purchaseapprovals data to update
     * @returns Promise with the updated purchaseapprovals
     */
    patch(id: number, purchaseApprovals: Partial<IPurchaseApprovals>): Promise<ApiResponse<IPurchaseApprovals>>;
    /**
     * List purchaseapprovals with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of purchaseapprovals
     */
    list(query?: IPurchaseApprovalsQuery): Promise<ApiResponse<IPurchaseApprovals[]>>;
}
//# sourceMappingURL=purchaseapprovals.d.ts.map