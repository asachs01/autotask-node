import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IArticleTicketAssociations {
    id?: number;
    [key: string]: any;
}
export interface IArticleTicketAssociationsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ArticleTicketAssociations entity class for Autotask API
 *
 * Associations between articles and tickets
 * Supported Operations: GET, POST, DELETE
 * Category: knowledge
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ArticleTicketAssociationsEntity.htm}
 */
export declare class ArticleTicketAssociations extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new articleticketassociations
     * @param articleTicketAssociations - The articleticketassociations data to create
     * @returns Promise with the created articleticketassociations
     */
    create(articleTicketAssociations: IArticleTicketAssociations): Promise<ApiResponse<IArticleTicketAssociations>>;
    /**
     * Get a articleticketassociations by ID
     * @param id - The articleticketassociations ID
     * @returns Promise with the articleticketassociations data
     */
    get(id: number): Promise<ApiResponse<IArticleTicketAssociations>>;
    /**
     * Delete a articleticketassociations
     * @param id - The articleticketassociations ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List articleticketassociations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of articleticketassociations
     */
    list(query?: IArticleTicketAssociationsQuery): Promise<ApiResponse<IArticleTicketAssociations[]>>;
}
//# sourceMappingURL=articleticketassociations.d.ts.map