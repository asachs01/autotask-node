import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IArticleToArticleAssociations {
    id?: number;
    [key: string]: any;
}
export interface IArticleToArticleAssociationsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ArticleToArticleAssociations entity class for Autotask API
 *
 * Associations between articles
 * Supported Operations: GET, POST, DELETE
 * Category: knowledge
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ArticleToArticleAssociationsEntity.htm}
 */
export declare class ArticleToArticleAssociations extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new articletoarticleassociations
     * @param articleToArticleAssociations - The articletoarticleassociations data to create
     * @returns Promise with the created articletoarticleassociations
     */
    create(articleToArticleAssociations: IArticleToArticleAssociations): Promise<ApiResponse<IArticleToArticleAssociations>>;
    /**
     * Get a articletoarticleassociations by ID
     * @param id - The articletoarticleassociations ID
     * @returns Promise with the articletoarticleassociations data
     */
    get(id: number): Promise<ApiResponse<IArticleToArticleAssociations>>;
    /**
     * Delete a articletoarticleassociations
     * @param id - The articletoarticleassociations ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List articletoarticleassociations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of articletoarticleassociations
     */
    list(query?: IArticleToArticleAssociationsQuery): Promise<ApiResponse<IArticleToArticleAssociations[]>>;
}
//# sourceMappingURL=articletoarticleassociations.d.ts.map