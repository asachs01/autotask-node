import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITaskSecondaryResources {
    id?: number;
    [key: string]: any;
}
export interface ITaskSecondaryResourcesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TaskSecondaryResources entity class for Autotask API
 *
 * Secondary resource assignments for tasks
 * Supported Operations: GET, POST, DELETE
 * Category: tasks
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TaskSecondaryResourcesEntity.htm}
 */
export declare class TaskSecondaryResources extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new tasksecondaryresources
     * @param taskSecondaryResources - The tasksecondaryresources data to create
     * @returns Promise with the created tasksecondaryresources
     */
    create(taskSecondaryResources: ITaskSecondaryResources): Promise<ApiResponse<ITaskSecondaryResources>>;
    /**
     * Get a tasksecondaryresources by ID
     * @param id - The tasksecondaryresources ID
     * @returns Promise with the tasksecondaryresources data
     */
    get(id: number): Promise<ApiResponse<ITaskSecondaryResources>>;
    /**
     * Delete a tasksecondaryresources
     * @param id - The tasksecondaryresources ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List tasksecondaryresources with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of tasksecondaryresources
     */
    list(query?: ITaskSecondaryResourcesQuery): Promise<ApiResponse<ITaskSecondaryResources[]>>;
}
//# sourceMappingURL=tasksecondaryresources.d.ts.map