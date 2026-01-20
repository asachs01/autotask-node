import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IDocumentCategories {
    id?: number;
    [key: string]: any;
}
export interface IDocumentCategoriesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * DocumentCategories entity class for Autotask API
 *
 * Categories for organizing documents
 * Supported Operations: GET
 * Category: knowledge
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DocumentCategoriesEntity.htm}
 */
export declare class DocumentCategories extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a documentcategories by ID
     * @param id - The documentcategories ID
     * @returns Promise with the documentcategories data
     */
    get(id: number): Promise<ApiResponse<IDocumentCategories>>;
    /**
     * List documentcategories with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of documentcategories
     */
    list(query?: IDocumentCategoriesQuery): Promise<ApiResponse<IDocumentCategories[]>>;
}
//# sourceMappingURL=documentcategories.d.ts.map