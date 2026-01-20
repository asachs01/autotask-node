import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IServiceCalls {
    id?: number;
    [key: string]: any;
}
export interface IServiceCallsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ServiceCalls entity class for Autotask API
 *
 * Service call dispatching and management
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: service_calls
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ServiceCallsEntity.htm}
 */
export declare class ServiceCalls extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new servicecalls
     * @param serviceCalls - The servicecalls data to create
     * @returns Promise with the created servicecalls
     */
    create(serviceCalls: IServiceCalls): Promise<ApiResponse<IServiceCalls>>;
    /**
     * Get a servicecalls by ID
     * @param id - The servicecalls ID
     * @returns Promise with the servicecalls data
     */
    get(id: number): Promise<ApiResponse<IServiceCalls>>;
    /**
     * Update a servicecalls
     * @param id - The servicecalls ID
     * @param serviceCalls - The updated servicecalls data
     * @returns Promise with the updated servicecalls
     */
    update(id: number, serviceCalls: Partial<IServiceCalls>): Promise<ApiResponse<IServiceCalls>>;
    /**
     * Partially update a servicecalls
     * @param id - The servicecalls ID
     * @param serviceCalls - The partial servicecalls data to update
     * @returns Promise with the updated servicecalls
     */
    patch(id: number, serviceCalls: Partial<IServiceCalls>): Promise<ApiResponse<IServiceCalls>>;
    /**
     * Delete a servicecalls
     * @param id - The servicecalls ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List servicecalls with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of servicecalls
     */
    list(query?: IServiceCallsQuery): Promise<ApiResponse<IServiceCalls[]>>;
}
//# sourceMappingURL=servicecalls.d.ts.map