import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IArticleTagAssociations {
    id?: number;
    [key: string]: any;
}
export interface IArticleTagAssociationsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ArticleTagAssociations entity class for Autotask API
 *
 * Tag associations for articles
 * Supported Operations: GET, POST, DELETE
 * Category: knowledge
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ArticleTagAssociationsEntity.htm}
 */
export declare class ArticleTagAssociations extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new articletagassociations
     * @param articleTagAssociations - The articletagassociations data to create
     * @returns Promise with the created articletagassociations
     */
    create(articleTagAssociations: IArticleTagAssociations): Promise<ApiResponse<IArticleTagAssociations>>;
    /**
     * Get a articletagassociations by ID
     * @param id - The articletagassociations ID
     * @returns Promise with the articletagassociations data
     */
    get(id: number): Promise<ApiResponse<IArticleTagAssociations>>;
    /**
     * Delete a articletagassociations
     * @param id - The articletagassociations ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List articletagassociations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of articletagassociations
     */
    list(query?: IArticleTagAssociationsQuery): Promise<ApiResponse<IArticleTagAssociations[]>>;
}
//# sourceMappingURL=articletagassociations.d.ts.map