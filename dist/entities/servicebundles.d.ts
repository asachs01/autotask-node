import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IServiceBundles {
    id?: number;
    [key: string]: any;
}
export interface IServiceBundlesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ServiceBundles entity class for Autotask API
 *
 * Bundled service offerings
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ServiceBundlesEntity.htm}
 */
export declare class ServiceBundles extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new servicebundles
     * @param serviceBundles - The servicebundles data to create
     * @returns Promise with the created servicebundles
     */
    create(serviceBundles: IServiceBundles): Promise<ApiResponse<IServiceBundles>>;
    /**
     * Get a servicebundles by ID
     * @param id - The servicebundles ID
     * @returns Promise with the servicebundles data
     */
    get(id: number): Promise<ApiResponse<IServiceBundles>>;
    /**
     * Update a servicebundles
     * @param id - The servicebundles ID
     * @param serviceBundles - The updated servicebundles data
     * @returns Promise with the updated servicebundles
     */
    update(id: number, serviceBundles: Partial<IServiceBundles>): Promise<ApiResponse<IServiceBundles>>;
    /**
     * Partially update a servicebundles
     * @param id - The servicebundles ID
     * @param serviceBundles - The partial servicebundles data to update
     * @returns Promise with the updated servicebundles
     */
    patch(id: number, serviceBundles: Partial<IServiceBundles>): Promise<ApiResponse<IServiceBundles>>;
    /**
     * List servicebundles with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of servicebundles
     */
    list(query?: IServiceBundlesQuery): Promise<ApiResponse<IServiceBundles[]>>;
}
//# sourceMappingURL=servicebundles.d.ts.map