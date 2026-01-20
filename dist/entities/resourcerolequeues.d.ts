import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IResourceRoleQueues {
    id?: number;
    [key: string]: any;
}
export interface IResourceRoleQueuesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ResourceRoleQueues entity class for Autotask API
 *
 * Queue assignments for resource roles
 * Supported Operations: GET, POST, DELETE
 * Category: lookup
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourceRoleQueuesEntity.htm}
 */
export declare class ResourceRoleQueues extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new resourcerolequeues
     * @param resourceRoleQueues - The resourcerolequeues data to create
     * @returns Promise with the created resourcerolequeues
     */
    create(resourceRoleQueues: IResourceRoleQueues): Promise<ApiResponse<IResourceRoleQueues>>;
    /**
     * Get a resourcerolequeues by ID
     * @param id - The resourcerolequeues ID
     * @returns Promise with the resourcerolequeues data
     */
    get(id: number): Promise<ApiResponse<IResourceRoleQueues>>;
    /**
     * Delete a resourcerolequeues
     * @param id - The resourcerolequeues ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List resourcerolequeues with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of resourcerolequeues
     */
    list(query?: IResourceRoleQueuesQuery): Promise<ApiResponse<IResourceRoleQueues[]>>;
}
//# sourceMappingURL=resourcerolequeues.d.ts.map