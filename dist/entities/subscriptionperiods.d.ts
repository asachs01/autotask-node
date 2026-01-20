import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ISubscriptionPeriods {
    id?: number;
    [key: string]: any;
}
export interface ISubscriptionPeriodsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * SubscriptionPeriods entity class for Autotask API
 *
 * Billing periods for subscriptions
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: lookup
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/SubscriptionPeriodsEntity.htm}
 */
export declare class SubscriptionPeriods extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new subscriptionperiods
     * @param subscriptionPeriods - The subscriptionperiods data to create
     * @returns Promise with the created subscriptionperiods
     */
    create(subscriptionPeriods: ISubscriptionPeriods): Promise<ApiResponse<ISubscriptionPeriods>>;
    /**
     * Get a subscriptionperiods by ID
     * @param id - The subscriptionperiods ID
     * @returns Promise with the subscriptionperiods data
     */
    get(id: number): Promise<ApiResponse<ISubscriptionPeriods>>;
    /**
     * Update a subscriptionperiods
     * @param id - The subscriptionperiods ID
     * @param subscriptionPeriods - The updated subscriptionperiods data
     * @returns Promise with the updated subscriptionperiods
     */
    update(id: number, subscriptionPeriods: Partial<ISubscriptionPeriods>): Promise<ApiResponse<ISubscriptionPeriods>>;
    /**
     * Partially update a subscriptionperiods
     * @param id - The subscriptionperiods ID
     * @param subscriptionPeriods - The partial subscriptionperiods data to update
     * @returns Promise with the updated subscriptionperiods
     */
    patch(id: number, subscriptionPeriods: Partial<ISubscriptionPeriods>): Promise<ApiResponse<ISubscriptionPeriods>>;
    /**
     * Delete a subscriptionperiods
     * @param id - The subscriptionperiods ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List subscriptionperiods with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of subscriptionperiods
     */
    list(query?: ISubscriptionPeriodsQuery): Promise<ApiResponse<ISubscriptionPeriods[]>>;
}
//# sourceMappingURL=subscriptionperiods.d.ts.map