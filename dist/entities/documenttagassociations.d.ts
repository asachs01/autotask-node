import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IDocumentTagAssociations {
    id?: number;
    [key: string]: any;
}
export interface IDocumentTagAssociationsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * DocumentTagAssociations entity class for Autotask API
 *
 * Tag associations for documents
 * Supported Operations: GET, POST, DELETE
 * Category: knowledge
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DocumentTagAssociationsEntity.htm}
 */
export declare class DocumentTagAssociations extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new documenttagassociations
     * @param documentTagAssociations - The documenttagassociations data to create
     * @returns Promise with the created documenttagassociations
     */
    create(documentTagAssociations: IDocumentTagAssociations): Promise<ApiResponse<IDocumentTagAssociations>>;
    /**
     * Get a documenttagassociations by ID
     * @param id - The documenttagassociations ID
     * @returns Promise with the documenttagassociations data
     */
    get(id: number): Promise<ApiResponse<IDocumentTagAssociations>>;
    /**
     * Delete a documenttagassociations
     * @param id - The documenttagassociations ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List documenttagassociations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of documenttagassociations
     */
    list(query?: IDocumentTagAssociationsQuery): Promise<ApiResponse<IDocumentTagAssociations[]>>;
}
//# sourceMappingURL=documenttagassociations.d.ts.map