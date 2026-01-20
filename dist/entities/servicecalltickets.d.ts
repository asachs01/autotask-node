import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IServiceCallTickets {
    id?: number;
    [key: string]: any;
}
export interface IServiceCallTicketsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ServiceCallTickets entity class for Autotask API
 *
 * Tickets associated with service calls
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: service_calls
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ServiceCallTicketsEntity.htm}
 */
export declare class ServiceCallTickets extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new servicecalltickets
     * @param serviceCallTickets - The servicecalltickets data to create
     * @returns Promise with the created servicecalltickets
     */
    create(serviceCallTickets: IServiceCallTickets): Promise<ApiResponse<IServiceCallTickets>>;
    /**
     * Get a servicecalltickets by ID
     * @param id - The servicecalltickets ID
     * @returns Promise with the servicecalltickets data
     */
    get(id: number): Promise<ApiResponse<IServiceCallTickets>>;
    /**
     * Update a servicecalltickets
     * @param id - The servicecalltickets ID
     * @param serviceCallTickets - The updated servicecalltickets data
     * @returns Promise with the updated servicecalltickets
     */
    update(id: number, serviceCallTickets: Partial<IServiceCallTickets>): Promise<ApiResponse<IServiceCallTickets>>;
    /**
     * Partially update a servicecalltickets
     * @param id - The servicecalltickets ID
     * @param serviceCallTickets - The partial servicecalltickets data to update
     * @returns Promise with the updated servicecalltickets
     */
    patch(id: number, serviceCallTickets: Partial<IServiceCallTickets>): Promise<ApiResponse<IServiceCallTickets>>;
    /**
     * Delete a servicecalltickets
     * @param id - The servicecalltickets ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List servicecalltickets with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of servicecalltickets
     */
    list(query?: IServiceCallTicketsQuery): Promise<ApiResponse<IServiceCallTickets[]>>;
}
//# sourceMappingURL=servicecalltickets.d.ts.map