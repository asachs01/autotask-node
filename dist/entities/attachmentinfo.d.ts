import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IAttachmentInfo {
    id?: number;
    [key: string]: any;
}
export interface IAttachmentInfoQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * AttachmentInfo entity class for Autotask API
 *
 * Attachment information and metadata
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/AttachmentInfoEntity.htm}
 */
export declare class AttachmentInfo extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new attachmentinfo
     * @param attachmentInfo - The attachmentinfo data to create
     * @returns Promise with the created attachmentinfo
     */
    create(attachmentInfo: IAttachmentInfo): Promise<ApiResponse<IAttachmentInfo>>;
    /**
     * Get a attachmentinfo by ID
     * @param id - The attachmentinfo ID
     * @returns Promise with the attachmentinfo data
     */
    get(id: number): Promise<ApiResponse<IAttachmentInfo>>;
    /**
     * Delete a attachmentinfo
     * @param id - The attachmentinfo ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List attachmentinfo with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of attachmentinfo
     */
    list(query?: IAttachmentInfoQuery): Promise<ApiResponse<IAttachmentInfo[]>>;
}
//# sourceMappingURL=attachmentinfo.d.ts.map