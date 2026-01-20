import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IArticleNotes {
    id?: number;
    [key: string]: any;
}
export interface IArticleNotesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ArticleNotes entity class for Autotask API
 *
 * Notes for knowledge base articles
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ArticleNotesEntity.htm}
 */
export declare class ArticleNotes extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new articlenotes
     * @param articleNotes - The articlenotes data to create
     * @returns Promise with the created articlenotes
     */
    create(articleNotes: IArticleNotes): Promise<ApiResponse<IArticleNotes>>;
    /**
     * Get a articlenotes by ID
     * @param id - The articlenotes ID
     * @returns Promise with the articlenotes data
     */
    get(id: number): Promise<ApiResponse<IArticleNotes>>;
    /**
     * Update a articlenotes
     * @param id - The articlenotes ID
     * @param articleNotes - The updated articlenotes data
     * @returns Promise with the updated articlenotes
     */
    update(id: number, articleNotes: Partial<IArticleNotes>): Promise<ApiResponse<IArticleNotes>>;
    /**
     * Partially update a articlenotes
     * @param id - The articlenotes ID
     * @param articleNotes - The partial articlenotes data to update
     * @returns Promise with the updated articlenotes
     */
    patch(id: number, articleNotes: Partial<IArticleNotes>): Promise<ApiResponse<IArticleNotes>>;
    /**
     * List articlenotes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of articlenotes
     */
    list(query?: IArticleNotesQuery): Promise<ApiResponse<IArticleNotes[]>>;
}
//# sourceMappingURL=articlenotes.d.ts.map