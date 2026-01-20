import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IResourceServiceDeskRoles {
    id?: number;
    [key: string]: any;
}
export interface IResourceServiceDeskRolesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ResourceServiceDeskRoles entity class for Autotask API
 *
 * Service desk role assignments for resources
 * Supported Operations: GET, POST, DELETE
 * Category: lookup
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourceServiceDeskRolesEntity.htm}
 */
export declare class ResourceServiceDeskRoles extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new resourceservicedeskroles
     * @param resourceServiceDeskRoles - The resourceservicedeskroles data to create
     * @returns Promise with the created resourceservicedeskroles
     */
    create(resourceServiceDeskRoles: IResourceServiceDeskRoles): Promise<ApiResponse<IResourceServiceDeskRoles>>;
    /**
     * Get a resourceservicedeskroles by ID
     * @param id - The resourceservicedeskroles ID
     * @returns Promise with the resourceservicedeskroles data
     */
    get(id: number): Promise<ApiResponse<IResourceServiceDeskRoles>>;
    /**
     * Delete a resourceservicedeskroles
     * @param id - The resourceservicedeskroles ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List resourceservicedeskroles with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of resourceservicedeskroles
     */
    list(query?: IResourceServiceDeskRolesQuery): Promise<ApiResponse<IResourceServiceDeskRoles[]>>;
}
//# sourceMappingURL=resourceservicedeskroles.d.ts.map