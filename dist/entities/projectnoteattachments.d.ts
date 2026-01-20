import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IProjectNoteAttachments {
    id?: number;
    [key: string]: any;
}
export interface IProjectNoteAttachmentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ProjectNoteAttachments entity class for Autotask API
 *
 * File attachments for project notes
 * Supported Operations: GET, POST, DELETE
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ProjectNoteAttachmentsEntity.htm}
 */
export declare class ProjectNoteAttachments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new projectnoteattachments
     * @param projectNoteAttachments - The projectnoteattachments data to create
     * @returns Promise with the created projectnoteattachments
     */
    create(projectNoteAttachments: IProjectNoteAttachments): Promise<ApiResponse<IProjectNoteAttachments>>;
    /**
     * Get a projectnoteattachments by ID
     * @param id - The projectnoteattachments ID
     * @returns Promise with the projectnoteattachments data
     */
    get(id: number): Promise<ApiResponse<IProjectNoteAttachments>>;
    /**
     * Delete a projectnoteattachments
     * @param id - The projectnoteattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List projectnoteattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of projectnoteattachments
     */
    list(query?: IProjectNoteAttachmentsQuery): Promise<ApiResponse<IProjectNoteAttachments[]>>;
}
//# sourceMappingURL=projectnoteattachments.d.ts.map