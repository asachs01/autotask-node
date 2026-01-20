import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IKnowledgeBaseCategories {
    id?: number;
    [key: string]: any;
}
export interface IKnowledgeBaseCategoriesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * KnowledgeBaseCategories entity class for Autotask API
 *
 * Categories for knowledge base articles
 * Supported Operations: GET
 * Category: knowledge
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/KnowledgeBaseCategoriesEntity.htm}
 */
export declare class KnowledgeBaseCategories extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a knowledgebasecategories by ID
     * @param id - The knowledgebasecategories ID
     * @returns Promise with the knowledgebasecategories data
     */
    get(id: number): Promise<ApiResponse<IKnowledgeBaseCategories>>;
    /**
     * List knowledgebasecategories with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of knowledgebasecategories
     */
    list(query?: IKnowledgeBaseCategoriesQuery): Promise<ApiResponse<IKnowledgeBaseCategories[]>>;
}
//# sourceMappingURL=knowledgebasecategories.d.ts.map