import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IArticlePlainTextContent {
    id?: number;
    [key: string]: any;
}
export interface IArticlePlainTextContentQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ArticlePlainTextContent entity class for Autotask API
 *
 * Plain text content of knowledge base articles
 * Supported Operations: GET
 * Category: knowledge
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ArticlePlainTextContentEntity.htm}
 */
export declare class ArticlePlainTextContent extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a articleplaintextcontent by ID
     * @param id - The articleplaintextcontent ID
     * @returns Promise with the articleplaintextcontent data
     */
    get(id: number): Promise<ApiResponse<IArticlePlainTextContent>>;
    /**
     * List articleplaintextcontent with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of articleplaintextcontent
     */
    list(query?: IArticlePlainTextContentQuery): Promise<ApiResponse<IArticlePlainTextContent[]>>;
}
//# sourceMappingURL=articleplaintextcontent.d.ts.map