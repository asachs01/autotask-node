import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITaskAttachments {
    id?: number;
    [key: string]: any;
}
export interface ITaskAttachmentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TaskAttachments entity class for Autotask API
 *
 * File attachments for tasks
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TaskAttachmentsEntity.htm}
 */
export declare class TaskAttachments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new taskattachments
     * @param taskAttachments - The taskattachments data to create
     * @returns Promise with the created taskattachments
     */
    create(taskAttachments: ITaskAttachments): Promise<ApiResponse<ITaskAttachments>>;
    /**
     * Get a taskattachments by ID
     * @param id - The taskattachments ID
     * @returns Promise with the taskattachments data
     */
    get(id: number): Promise<ApiResponse<ITaskAttachments>>;
    /**
     * Delete a taskattachments
     * @param id - The taskattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List taskattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of taskattachments
     */
    list(query?: ITaskAttachmentsQuery): Promise<ApiResponse<ITaskAttachments[]>>;
}
//# sourceMappingURL=taskattachments.d.ts.map