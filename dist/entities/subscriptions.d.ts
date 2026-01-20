import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ISubscriptions {
    id?: number;
    [key: string]: any;
}
export interface ISubscriptionsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Subscriptions entity class for Autotask API
 *
 * Recurring service subscriptions
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: lookup
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/SubscriptionsEntity.htm}
 */
export declare class Subscriptions extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new subscriptions
     * @param subscriptions - The subscriptions data to create
     * @returns Promise with the created subscriptions
     */
    create(subscriptions: ISubscriptions): Promise<ApiResponse<ISubscriptions>>;
    /**
     * Get a subscriptions by ID
     * @param id - The subscriptions ID
     * @returns Promise with the subscriptions data
     */
    get(id: number): Promise<ApiResponse<ISubscriptions>>;
    /**
     * Update a subscriptions
     * @param id - The subscriptions ID
     * @param subscriptions - The updated subscriptions data
     * @returns Promise with the updated subscriptions
     */
    update(id: number, subscriptions: Partial<ISubscriptions>): Promise<ApiResponse<ISubscriptions>>;
    /**
     * Partially update a subscriptions
     * @param id - The subscriptions ID
     * @param subscriptions - The partial subscriptions data to update
     * @returns Promise with the updated subscriptions
     */
    patch(id: number, subscriptions: Partial<ISubscriptions>): Promise<ApiResponse<ISubscriptions>>;
    /**
     * Delete a subscriptions
     * @param id - The subscriptions ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List subscriptions with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of subscriptions
     */
    list(query?: ISubscriptionsQuery): Promise<ApiResponse<ISubscriptions[]>>;
}
//# sourceMappingURL=subscriptions.d.ts.map