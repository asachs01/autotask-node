import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IResources {
    id?: number;
    [key: string]: any;
}
export interface IResourcesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Resources entity class for Autotask API
 *
 * Human resources and staff members
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: core
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourcesEntity.htm}
 */
export declare class Resources extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new resources
     * @param resources - The resources data to create
     * @returns Promise with the created resources
     */
    create(resources: IResources): Promise<ApiResponse<IResources>>;
    /**
     * Get a resources by ID
     * @param id - The resources ID
     * @returns Promise with the resources data
     */
    get(id: number): Promise<ApiResponse<IResources>>;
    /**
     * Update a resources
     * @param id - The resources ID
     * @param resources - The updated resources data
     * @returns Promise with the updated resources
     */
    update(id: number, resources: Partial<IResources>): Promise<ApiResponse<IResources>>;
    /**
     * Partially update a resources
     * @param id - The resources ID
     * @param resources - The partial resources data to update
     * @returns Promise with the updated resources
     */
    patch(id: number, resources: Partial<IResources>): Promise<ApiResponse<IResources>>;
    /**
     * List resources with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of resources
     */
    list(query?: IResourcesQuery): Promise<ApiResponse<IResources[]>>;
}
//# sourceMappingURL=resources.d.ts.map