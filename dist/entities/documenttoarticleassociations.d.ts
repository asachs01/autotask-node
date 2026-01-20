import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IDocumentToArticleAssociations {
    id?: number;
    [key: string]: any;
}
export interface IDocumentToArticleAssociationsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * DocumentToArticleAssociations entity class for Autotask API
 *
 * Associations between documents and articles
 * Supported Operations: GET, POST, DELETE
 * Category: knowledge
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DocumentToArticleAssociationsEntity.htm}
 */
export declare class DocumentToArticleAssociations extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new documenttoarticleassociations
     * @param documentToArticleAssociations - The documenttoarticleassociations data to create
     * @returns Promise with the created documenttoarticleassociations
     */
    create(documentToArticleAssociations: IDocumentToArticleAssociations): Promise<ApiResponse<IDocumentToArticleAssociations>>;
    /**
     * Get a documenttoarticleassociations by ID
     * @param id - The documenttoarticleassociations ID
     * @returns Promise with the documenttoarticleassociations data
     */
    get(id: number): Promise<ApiResponse<IDocumentToArticleAssociations>>;
    /**
     * Delete a documenttoarticleassociations
     * @param id - The documenttoarticleassociations ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List documenttoarticleassociations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of documenttoarticleassociations
     */
    list(query?: IDocumentToArticleAssociationsQuery): Promise<ApiResponse<IDocumentToArticleAssociations[]>>;
}
//# sourceMappingURL=documenttoarticleassociations.d.ts.map