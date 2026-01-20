import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IDocumentNotes {
    id?: number;
    [key: string]: any;
}
export interface IDocumentNotesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * DocumentNotes entity class for Autotask API
 *
 * Notes for documents
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DocumentNotesEntity.htm}
 */
export declare class DocumentNotes extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new documentnotes
     * @param documentNotes - The documentnotes data to create
     * @returns Promise with the created documentnotes
     */
    create(documentNotes: IDocumentNotes): Promise<ApiResponse<IDocumentNotes>>;
    /**
     * Get a documentnotes by ID
     * @param id - The documentnotes ID
     * @returns Promise with the documentnotes data
     */
    get(id: number): Promise<ApiResponse<IDocumentNotes>>;
    /**
     * Update a documentnotes
     * @param id - The documentnotes ID
     * @param documentNotes - The updated documentnotes data
     * @returns Promise with the updated documentnotes
     */
    update(id: number, documentNotes: Partial<IDocumentNotes>): Promise<ApiResponse<IDocumentNotes>>;
    /**
     * Partially update a documentnotes
     * @param id - The documentnotes ID
     * @param documentNotes - The partial documentnotes data to update
     * @returns Promise with the updated documentnotes
     */
    patch(id: number, documentNotes: Partial<IDocumentNotes>): Promise<ApiResponse<IDocumentNotes>>;
    /**
     * List documentnotes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of documentnotes
     */
    list(query?: IDocumentNotesQuery): Promise<ApiResponse<IDocumentNotes[]>>;
}
//# sourceMappingURL=documentnotes.d.ts.map