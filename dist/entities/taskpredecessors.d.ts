import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITaskPredecessors {
    id?: number;
    [key: string]: any;
}
export interface ITaskPredecessorsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TaskPredecessors entity class for Autotask API
 *
 * Predecessor relationships between tasks
 * Supported Operations: GET, POST, DELETE
 * Category: tasks
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TaskPredecessorsEntity.htm}
 */
export declare class TaskPredecessors extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new taskpredecessors
     * @param taskPredecessors - The taskpredecessors data to create
     * @returns Promise with the created taskpredecessors
     */
    create(taskPredecessors: ITaskPredecessors): Promise<ApiResponse<ITaskPredecessors>>;
    /**
     * Get a taskpredecessors by ID
     * @param id - The taskpredecessors ID
     * @returns Promise with the taskpredecessors data
     */
    get(id: number): Promise<ApiResponse<ITaskPredecessors>>;
    /**
     * Delete a taskpredecessors
     * @param id - The taskpredecessors ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List taskpredecessors with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of taskpredecessors
     */
    list(query?: ITaskPredecessorsQuery): Promise<ApiResponse<ITaskPredecessors[]>>;
}
//# sourceMappingURL=taskpredecessors.d.ts.map