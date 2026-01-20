import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IArticleConfigurationItemCategoryAssociations {
    id?: number;
    [key: string]: any;
}
export interface IArticleConfigurationItemCategoryAssociationsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ArticleConfigurationItemCategoryAssociations entity class for Autotask API
 *
 * Associations between articles and configuration item categories
 * Supported Operations: GET, POST, DELETE
 * Category: knowledge
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ArticleConfigurationItemCategoryAssociationsEntity.htm}
 */
export declare class ArticleConfigurationItemCategoryAssociations extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new articleconfigurationitemcategoryassociations
     * @param articleConfigurationItemCategoryAssociations - The articleconfigurationitemcategoryassociations data to create
     * @returns Promise with the created articleconfigurationitemcategoryassociations
     */
    create(articleConfigurationItemCategoryAssociations: IArticleConfigurationItemCategoryAssociations): Promise<ApiResponse<IArticleConfigurationItemCategoryAssociations>>;
    /**
     * Get a articleconfigurationitemcategoryassociations by ID
     * @param id - The articleconfigurationitemcategoryassociations ID
     * @returns Promise with the articleconfigurationitemcategoryassociations data
     */
    get(id: number): Promise<ApiResponse<IArticleConfigurationItemCategoryAssociations>>;
    /**
     * Delete a articleconfigurationitemcategoryassociations
     * @param id - The articleconfigurationitemcategoryassociations ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List articleconfigurationitemcategoryassociations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of articleconfigurationitemcategoryassociations
     */
    list(query?: IArticleConfigurationItemCategoryAssociationsQuery): Promise<ApiResponse<IArticleConfigurationItemCategoryAssociations[]>>;
}
//# sourceMappingURL=articleconfigurationitemcategoryassociations.d.ts.map