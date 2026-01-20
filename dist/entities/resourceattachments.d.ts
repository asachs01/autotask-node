import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IResourceAttachments {
    id?: number;
    [key: string]: any;
}
export interface IResourceAttachmentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ResourceAttachments entity class for Autotask API
 *
 * File attachments for resources
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ResourceAttachmentsEntity.htm}
 */
export declare class ResourceAttachments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new resourceattachments
     * @param resourceAttachments - The resourceattachments data to create
     * @returns Promise with the created resourceattachments
     */
    create(resourceAttachments: IResourceAttachments): Promise<ApiResponse<IResourceAttachments>>;
    /**
     * Get a resourceattachments by ID
     * @param id - The resourceattachments ID
     * @returns Promise with the resourceattachments data
     */
    get(id: number): Promise<ApiResponse<IResourceAttachments>>;
    /**
     * Delete a resourceattachments
     * @param id - The resourceattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List resourceattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of resourceattachments
     */
    list(query?: IResourceAttachmentsQuery): Promise<ApiResponse<IResourceAttachments[]>>;
}
//# sourceMappingURL=resourceattachments.d.ts.map