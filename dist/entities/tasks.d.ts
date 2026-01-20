import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITasks {
    id?: number;
    [key: string]: any;
}
export interface ITasksQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Tasks entity class for Autotask API
 *
 * Project tasks and work items
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: core
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TasksEntity.htm}
 */
export declare class Tasks extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new tasks
     * @param tasks - The tasks data to create
     * @returns Promise with the created tasks
     */
    create(tasks: ITasks): Promise<ApiResponse<ITasks>>;
    /**
     * Get a tasks by ID
     * @param id - The tasks ID
     * @returns Promise with the tasks data
     */
    get(id: number): Promise<ApiResponse<ITasks>>;
    /**
     * Update a tasks
     * @param id - The tasks ID
     * @param tasks - The updated tasks data
     * @returns Promise with the updated tasks
     */
    update(id: number, tasks: Partial<ITasks>): Promise<ApiResponse<ITasks>>;
    /**
     * Partially update a tasks
     * @param id - The tasks ID
     * @param tasks - The partial tasks data to update
     * @returns Promise with the updated tasks
     */
    patch(id: number, tasks: Partial<ITasks>): Promise<ApiResponse<ITasks>>;
    /**
     * Delete a tasks
     * @param id - The tasks ID to delete
     * @returns Promise with void response
     */
    delete(id: number): Promise<void>;
    /**
     * List tasks with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of tasks
     */
    list(query?: ITasksQuery): Promise<ApiResponse<ITasks[]>>;
}
//# sourceMappingURL=tasks.d.ts.map