import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IServiceCallTasks {
    id?: number;
    [key: string]: any;
}
export interface IServiceCallTasksQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ServiceCallTasks entity class for Autotask API
 *
 * Tasks within service calls
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: service_calls
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ServiceCallTasksEntity.htm}
 */
export declare class ServiceCallTasks extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new servicecalltasks
     * @param serviceCallTasks - The servicecalltasks data to create
     * @returns Promise with the created servicecalltasks
     */
    create(serviceCallTasks: IServiceCallTasks): Promise<ApiResponse<IServiceCallTasks>>;
    /**
     * Get a servicecalltasks by ID
     * @param id - The servicecalltasks ID
     * @returns Promise with the servicecalltasks data
     */
    get(id: number): Promise<ApiResponse<IServiceCallTasks>>;
    /**
     * Update a servicecalltasks
     * @param id - The servicecalltasks ID
     * @param serviceCallTasks - The updated servicecalltasks data
     * @returns Promise with the updated servicecalltasks
     */
    update(id: number, serviceCallTasks: Partial<IServiceCallTasks>): Promise<ApiResponse<IServiceCallTasks>>;
    /**
     * Partially update a servicecalltasks
     * @param id - The servicecalltasks ID
     * @param serviceCallTasks - The partial servicecalltasks data to update
     * @returns Promise with the updated servicecalltasks
     */
    patch(id: number, serviceCallTasks: Partial<IServiceCallTasks>): Promise<ApiResponse<IServiceCallTasks>>;
    /**
     * Delete a servicecalltasks
     * @param id - The servicecalltasks ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List servicecalltasks with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of servicecalltasks
     */
    list(query?: IServiceCallTasksQuery): Promise<ApiResponse<IServiceCallTasks[]>>;
}
//# sourceMappingURL=servicecalltasks.d.ts.map