import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IServiceCallTaskResources {
    id?: number;
    [key: string]: any;
}
export interface IServiceCallTaskResourcesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ServiceCallTaskResources entity class for Autotask API
 *
 * Resource assignments for service call tasks
 * Supported Operations: GET, POST, DELETE
 * Category: service_calls
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ServiceCallTaskResourceEntity.htm}
 */
export declare class ServiceCallTaskResources extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new servicecalltaskresources
     * @param serviceCallTaskResources - The servicecalltaskresources data to create
     * @returns Promise with the created servicecalltaskresources
     */
    create(serviceCallTaskResources: IServiceCallTaskResources): Promise<ApiResponse<IServiceCallTaskResources>>;
    /**
     * Get a servicecalltaskresources by ID
     * @param id - The servicecalltaskresources ID
     * @returns Promise with the servicecalltaskresources data
     */
    get(id: number): Promise<ApiResponse<IServiceCallTaskResources>>;
    /**
     * Delete a servicecalltaskresources
     * @param id - The servicecalltaskresources ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List servicecalltaskresources with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of servicecalltaskresources
     */
    list(query?: IServiceCallTaskResourcesQuery): Promise<ApiResponse<IServiceCallTaskResources[]>>;
}
//# sourceMappingURL=servicecalltaskresources.d.ts.map