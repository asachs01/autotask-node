import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ISalesOrders {
    id?: number;
    [key: string]: any;
}
export interface ISalesOrdersQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * SalesOrders entity class for Autotask API
 *
 * Customer sales orders
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: sales
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/SalesOrdersEntity.htm}
 */
export declare class SalesOrders extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new salesorders
     * @param salesOrders - The salesorders data to create
     * @returns Promise with the created salesorders
     */
    create(salesOrders: ISalesOrders): Promise<ApiResponse<ISalesOrders>>;
    /**
     * Get a salesorders by ID
     * @param id - The salesorders ID
     * @returns Promise with the salesorders data
     */
    get(id: number): Promise<ApiResponse<ISalesOrders>>;
    /**
     * Update a salesorders
     * @param id - The salesorders ID
     * @param salesOrders - The updated salesorders data
     * @returns Promise with the updated salesorders
     */
    update(id: number, salesOrders: Partial<ISalesOrders>): Promise<ApiResponse<ISalesOrders>>;
    /**
     * Partially update a salesorders
     * @param id - The salesorders ID
     * @param salesOrders - The partial salesorders data to update
     * @returns Promise with the updated salesorders
     */
    patch(id: number, salesOrders: Partial<ISalesOrders>): Promise<ApiResponse<ISalesOrders>>;
    /**
     * List salesorders with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of salesorders
     */
    list(query?: ISalesOrdersQuery): Promise<ApiResponse<ISalesOrders[]>>;
}
//# sourceMappingURL=salesorders.d.ts.map