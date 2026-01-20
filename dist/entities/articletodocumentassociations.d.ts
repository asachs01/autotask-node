import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IArticleToDocumentAssociations {
    id?: number;
    [key: string]: any;
}
export interface IArticleToDocumentAssociationsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ArticleToDocumentAssociations entity class for Autotask API
 *
 * Associations between articles and documents
 * Supported Operations: GET, POST, DELETE
 * Category: knowledge
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ArticleToDocumentAssociationsEntity.htm}
 */
export declare class ArticleToDocumentAssociations extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new articletodocumentassociations
     * @param articleToDocumentAssociations - The articletodocumentassociations data to create
     * @returns Promise with the created articletodocumentassociations
     */
    create(articleToDocumentAssociations: IArticleToDocumentAssociations): Promise<ApiResponse<IArticleToDocumentAssociations>>;
    /**
     * Get a articletodocumentassociations by ID
     * @param id - The articletodocumentassociations ID
     * @returns Promise with the articletodocumentassociations data
     */
    get(id: number): Promise<ApiResponse<IArticleToDocumentAssociations>>;
    /**
     * Delete a articletodocumentassociations
     * @param id - The articletodocumentassociations ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List articletodocumentassociations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of articletodocumentassociations
     */
    list(query?: IArticleToDocumentAssociationsQuery): Promise<ApiResponse<IArticleToDocumentAssociations[]>>;
}
//# sourceMappingURL=articletodocumentassociations.d.ts.map