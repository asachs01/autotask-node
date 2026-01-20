import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITaskNotes {
    id?: number;
    [key: string]: any;
}
export interface ITaskNotesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TaskNotes entity class for Autotask API
 *
 * Notes for tasks
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TaskNotesEntity.htm}
 */
export declare class TaskNotes extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new tasknotes
     * @param taskNotes - The tasknotes data to create
     * @returns Promise with the created tasknotes
     */
    create(taskNotes: ITaskNotes): Promise<ApiResponse<ITaskNotes>>;
    /**
     * Get a tasknotes by ID
     * @param id - The tasknotes ID
     * @returns Promise with the tasknotes data
     */
    get(id: number): Promise<ApiResponse<ITaskNotes>>;
    /**
     * Update a tasknotes
     * @param id - The tasknotes ID
     * @param taskNotes - The updated tasknotes data
     * @returns Promise with the updated tasknotes
     */
    update(id: number, taskNotes: Partial<ITaskNotes>): Promise<ApiResponse<ITaskNotes>>;
    /**
     * Partially update a tasknotes
     * @param id - The tasknotes ID
     * @param taskNotes - The partial tasknotes data to update
     * @returns Promise with the updated tasknotes
     */
    patch(id: number, taskNotes: Partial<ITaskNotes>): Promise<ApiResponse<ITaskNotes>>;
    /**
     * List tasknotes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of tasknotes
     */
    list(query?: ITaskNotesQuery): Promise<ApiResponse<ITaskNotes[]>>;
}
//# sourceMappingURL=tasknotes.d.ts.map