import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IServiceBundleServices {
    id?: number;
    [key: string]: any;
}
export interface IServiceBundleServicesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ServiceBundleServices entity class for Autotask API
 *
 * Services within service bundles
 * Supported Operations: GET, POST, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ServiceBundleServicesEntity.htm}
 */
export declare class ServiceBundleServices extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new servicebundleservices
     * @param serviceBundleServices - The servicebundleservices data to create
     * @returns Promise with the created servicebundleservices
     */
    create(serviceBundleServices: IServiceBundleServices): Promise<ApiResponse<IServiceBundleServices>>;
    /**
     * Get a servicebundleservices by ID
     * @param id - The servicebundleservices ID
     * @returns Promise with the servicebundleservices data
     */
    get(id: number): Promise<ApiResponse<IServiceBundleServices>>;
    /**
     * Delete a servicebundleservices
     * @param id - The servicebundleservices ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List servicebundleservices with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of servicebundleservices
     */
    list(query?: IServiceBundleServicesQuery): Promise<ApiResponse<IServiceBundleServices[]>>;
}
//# sourceMappingURL=servicebundleservices.d.ts.map