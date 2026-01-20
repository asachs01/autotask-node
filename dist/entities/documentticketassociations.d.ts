import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IDocumentTicketAssociations {
    id?: number;
    [key: string]: any;
}
export interface IDocumentTicketAssociationsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * DocumentTicketAssociations entity class for Autotask API
 *
 * Associations between documents and tickets
 * Supported Operations: GET, POST, DELETE
 * Category: knowledge
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DocumentTicketAssociationsEntity.htm}
 */
export declare class DocumentTicketAssociations extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new documentticketassociations
     * @param documentTicketAssociations - The documentticketassociations data to create
     * @returns Promise with the created documentticketassociations
     */
    create(documentTicketAssociations: IDocumentTicketAssociations): Promise<ApiResponse<IDocumentTicketAssociations>>;
    /**
     * Get a documentticketassociations by ID
     * @param id - The documentticketassociations ID
     * @returns Promise with the documentticketassociations data
     */
    get(id: number): Promise<ApiResponse<IDocumentTicketAssociations>>;
    /**
     * Delete a documentticketassociations
     * @param id - The documentticketassociations ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List documentticketassociations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of documentticketassociations
     */
    list(query?: IDocumentTicketAssociationsQuery): Promise<ApiResponse<IDocumentTicketAssociations[]>>;
}
//# sourceMappingURL=documentticketassociations.d.ts.map