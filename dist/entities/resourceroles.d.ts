import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IResourceRoles {
    id?: number;
    [key: string]: any;
}
export interface IResourceRolesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ResourceRoles entity class for Autotask API
 *
 * Role assignments for resources
 * Supported Operations: GET, POST, DELETE
 * Category: lookup
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourceRolesEntity.htm}
 */
export declare class ResourceRoles extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new resourceroles
     * @param resourceRoles - The resourceroles data to create
     * @returns Promise with the created resourceroles
     */
    create(resourceRoles: IResourceRoles): Promise<ApiResponse<IResourceRoles>>;
    /**
     * Get a resourceroles by ID
     * @param id - The resourceroles ID
     * @returns Promise with the resourceroles data
     */
    get(id: number): Promise<ApiResponse<IResourceRoles>>;
    /**
     * Delete a resourceroles
     * @param id - The resourceroles ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List resourceroles with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of resourceroles
     */
    list(query?: IResourceRolesQuery): Promise<ApiResponse<IResourceRoles[]>>;
}
//# sourceMappingURL=resourceroles.d.ts.map