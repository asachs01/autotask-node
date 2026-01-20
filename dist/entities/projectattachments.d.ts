import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IProjectAttachments {
    id?: number;
    [key: string]: any;
}
export interface IProjectAttachmentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ProjectAttachments entity class for Autotask API
 *
 * File attachments for projects
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ProjectAttachmentsEntity.htm}
 */
export declare class ProjectAttachments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new projectattachments
     * @param projectAttachments - The projectattachments data to create
     * @returns Promise with the created projectattachments
     */
    create(projectAttachments: IProjectAttachments): Promise<ApiResponse<IProjectAttachments>>;
    /**
     * Get a projectattachments by ID
     * @param id - The projectattachments ID
     * @returns Promise with the projectattachments data
     */
    get(id: number): Promise<ApiResponse<IProjectAttachments>>;
    /**
     * Delete a projectattachments
     * @param id - The projectattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List projectattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of projectattachments
     */
    list(query?: IProjectAttachmentsQuery): Promise<ApiResponse<IProjectAttachments[]>>;
}
//# sourceMappingURL=projectattachments.d.ts.map