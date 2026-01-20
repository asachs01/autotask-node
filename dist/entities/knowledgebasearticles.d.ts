import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IKnowledgeBaseArticles {
    id?: number;
    [key: string]: any;
}
export interface IKnowledgeBaseArticlesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * KnowledgeBaseArticles entity class for Autotask API
 *
 * Knowledge base articles and documentation
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: knowledge
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/KnowledgeBaseArticlesEntity.htm}
 */
export declare class KnowledgeBaseArticles extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new knowledgebasearticles
     * @param knowledgeBaseArticles - The knowledgebasearticles data to create
     * @returns Promise with the created knowledgebasearticles
     */
    create(knowledgeBaseArticles: IKnowledgeBaseArticles): Promise<ApiResponse<IKnowledgeBaseArticles>>;
    /**
     * Get a knowledgebasearticles by ID
     * @param id - The knowledgebasearticles ID
     * @returns Promise with the knowledgebasearticles data
     */
    get(id: number): Promise<ApiResponse<IKnowledgeBaseArticles>>;
    /**
     * Update a knowledgebasearticles
     * @param id - The knowledgebasearticles ID
     * @param knowledgeBaseArticles - The updated knowledgebasearticles data
     * @returns Promise with the updated knowledgebasearticles
     */
    update(id: number, knowledgeBaseArticles: Partial<IKnowledgeBaseArticles>): Promise<ApiResponse<IKnowledgeBaseArticles>>;
    /**
     * Partially update a knowledgebasearticles
     * @param id - The knowledgebasearticles ID
     * @param knowledgeBaseArticles - The partial knowledgebasearticles data to update
     * @returns Promise with the updated knowledgebasearticles
     */
    patch(id: number, knowledgeBaseArticles: Partial<IKnowledgeBaseArticles>): Promise<ApiResponse<IKnowledgeBaseArticles>>;
    /**
     * Delete a knowledgebasearticles
     * @param id - The knowledgebasearticles ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List knowledgebasearticles with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of knowledgebasearticles
     */
    list(query?: IKnowledgeBaseArticlesQuery): Promise<ApiResponse<IKnowledgeBaseArticles[]>>;
}
//# sourceMappingURL=knowledgebasearticles.d.ts.map