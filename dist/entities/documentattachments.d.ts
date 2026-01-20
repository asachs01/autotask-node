import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IDocumentAttachments {
    id?: number;
    [key: string]: any;
}
export interface IDocumentAttachmentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * DocumentAttachments entity class for Autotask API
 *
 * File attachments for documents
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DocumentAttachmentsEntity.htm}
 */
export declare class DocumentAttachments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new documentattachments
     * @param documentAttachments - The documentattachments data to create
     * @returns Promise with the created documentattachments
     */
    create(documentAttachments: IDocumentAttachments): Promise<ApiResponse<IDocumentAttachments>>;
    /**
     * Get a documentattachments by ID
     * @param id - The documentattachments ID
     * @returns Promise with the documentattachments data
     */
    get(id: number): Promise<ApiResponse<IDocumentAttachments>>;
    /**
     * Delete a documentattachments
     * @param id - The documentattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List documentattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of documentattachments
     */
    list(query?: IDocumentAttachmentsQuery): Promise<ApiResponse<IDocumentAttachments[]>>;
}
//# sourceMappingURL=documentattachments.d.ts.map