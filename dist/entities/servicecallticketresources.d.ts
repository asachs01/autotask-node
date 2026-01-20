import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IServiceCallTicketResources {
    id?: number;
    [key: string]: any;
}
export interface IServiceCallTicketResourcesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ServiceCallTicketResources entity class for Autotask API
 *
 * Resource assignments for service call tickets
 * Supported Operations: GET, POST, DELETE
 * Category: service_calls
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ServiceCallTicketResourceEntity.htm}
 */
export declare class ServiceCallTicketResources extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new servicecallticketresources
     * @param serviceCallTicketResources - The servicecallticketresources data to create
     * @returns Promise with the created servicecallticketresources
     */
    create(serviceCallTicketResources: IServiceCallTicketResources): Promise<ApiResponse<IServiceCallTicketResources>>;
    /**
     * Get a servicecallticketresources by ID
     * @param id - The servicecallticketresources ID
     * @returns Promise with the servicecallticketresources data
     */
    get(id: number): Promise<ApiResponse<IServiceCallTicketResources>>;
    /**
     * Delete a servicecallticketresources
     * @param id - The servicecallticketresources ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List servicecallticketresources with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of servicecallticketresources
     */
    list(query?: IServiceCallTicketResourcesQuery): Promise<ApiResponse<IServiceCallTicketResources[]>>;
}
//# sourceMappingURL=servicecallticketresources.d.ts.map