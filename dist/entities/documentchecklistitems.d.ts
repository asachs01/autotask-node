import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IDocumentChecklistItems {
    id?: number;
    [key: string]: any;
}
export interface IDocumentChecklistItemsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * DocumentChecklistItems entity class for Autotask API
 *
 * Checklist items for documents
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: knowledge
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DocumentChecklistItemsEntity.htm}
 */
export declare class DocumentChecklistItems extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new documentchecklistitems
     * @param documentChecklistItems - The documentchecklistitems data to create
     * @returns Promise with the created documentchecklistitems
     */
    create(documentChecklistItems: IDocumentChecklistItems): Promise<ApiResponse<IDocumentChecklistItems>>;
    /**
     * Get a documentchecklistitems by ID
     * @param id - The documentchecklistitems ID
     * @returns Promise with the documentchecklistitems data
     */
    get(id: number): Promise<ApiResponse<IDocumentChecklistItems>>;
    /**
     * Update a documentchecklistitems
     * @param id - The documentchecklistitems ID
     * @param documentChecklistItems - The updated documentchecklistitems data
     * @returns Promise with the updated documentchecklistitems
     */
    update(id: number, documentChecklistItems: Partial<IDocumentChecklistItems>): Promise<ApiResponse<IDocumentChecklistItems>>;
    /**
     * Partially update a documentchecklistitems
     * @param id - The documentchecklistitems ID
     * @param documentChecklistItems - The partial documentchecklistitems data to update
     * @returns Promise with the updated documentchecklistitems
     */
    patch(id: number, documentChecklistItems: Partial<IDocumentChecklistItems>): Promise<ApiResponse<IDocumentChecklistItems>>;
    /**
     * Delete a documentchecklistitems
     * @param id - The documentchecklistitems ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List documentchecklistitems with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of documentchecklistitems
     */
    list(query?: IDocumentChecklistItemsQuery): Promise<ApiResponse<IDocumentChecklistItems[]>>;
}
//# sourceMappingURL=documentchecklistitems.d.ts.map