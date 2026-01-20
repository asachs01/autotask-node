import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IArticleAttachments {
    id?: number;
    [key: string]: any;
}
export interface IArticleAttachmentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ArticleAttachments entity class for Autotask API
 *
 * File attachments for knowledge base articles
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ArticleAttachmentsEntity.htm}
 */
export declare class ArticleAttachments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new articleattachments
     * @param articleAttachments - The articleattachments data to create
     * @returns Promise with the created articleattachments
     */
    create(articleAttachments: IArticleAttachments): Promise<ApiResponse<IArticleAttachments>>;
    /**
     * Get a articleattachments by ID
     * @param id - The articleattachments ID
     * @returns Promise with the articleattachments data
     */
    get(id: number): Promise<ApiResponse<IArticleAttachments>>;
    /**
     * Delete a articleattachments
     * @param id - The articleattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List articleattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of articleattachments
     */
    list(query?: IArticleAttachmentsQuery): Promise<ApiResponse<IArticleAttachments[]>>;
}
//# sourceMappingURL=articleattachments.d.ts.map