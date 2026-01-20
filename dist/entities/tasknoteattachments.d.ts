import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITaskNoteAttachments {
    id?: number;
    [key: string]: any;
}
export interface ITaskNoteAttachmentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TaskNoteAttachments entity class for Autotask API
 *
 * File attachments for task notes
 * Supported Operations: GET, POST, DELETE
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TaskNoteAttachmentsEntity.htm}
 */
export declare class TaskNoteAttachments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new tasknoteattachments
     * @param taskNoteAttachments - The tasknoteattachments data to create
     * @returns Promise with the created tasknoteattachments
     */
    create(taskNoteAttachments: ITaskNoteAttachments): Promise<ApiResponse<ITaskNoteAttachments>>;
    /**
     * Get a tasknoteattachments by ID
     * @param id - The tasknoteattachments ID
     * @returns Promise with the tasknoteattachments data
     */
    get(id: number): Promise<ApiResponse<ITaskNoteAttachments>>;
    /**
     * Delete a tasknoteattachments
     * @param id - The tasknoteattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List tasknoteattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of tasknoteattachments
     */
    list(query?: ITaskNoteAttachmentsQuery): Promise<ApiResponse<ITaskNoteAttachments[]>>;
}
//# sourceMappingURL=tasknoteattachments.d.ts.map