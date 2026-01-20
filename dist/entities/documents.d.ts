import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IDocuments {
    id?: number;
    [key: string]: any;
}
export interface IDocumentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Documents entity class for Autotask API
 *
 * Documents and files in the system
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: knowledge
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DocumentsEntity.htm}
 */
export declare class Documents extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new documents
     * @param documents - The documents data to create
     * @returns Promise with the created documents
     */
    create(documents: IDocuments): Promise<ApiResponse<IDocuments>>;
    /**
     * Get a documents by ID
     * @param id - The documents ID
     * @returns Promise with the documents data
     */
    get(id: number): Promise<ApiResponse<IDocuments>>;
    /**
     * Update a documents
     * @param id - The documents ID
     * @param documents - The updated documents data
     * @returns Promise with the updated documents
     */
    update(id: number, documents: Partial<IDocuments>): Promise<ApiResponse<IDocuments>>;
    /**
     * Partially update a documents
     * @param id - The documents ID
     * @param documents - The partial documents data to update
     * @returns Promise with the updated documents
     */
    patch(id: number, documents: Partial<IDocuments>): Promise<ApiResponse<IDocuments>>;
    /**
     * List documents with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of documents
     */
    list(query?: IDocumentsQuery): Promise<ApiResponse<IDocuments[]>>;
}
//# sourceMappingURL=documents.d.ts.map