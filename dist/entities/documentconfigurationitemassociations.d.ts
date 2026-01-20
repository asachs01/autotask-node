import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IDocumentConfigurationItemAssociations {
    id?: number;
    [key: string]: any;
}
export interface IDocumentConfigurationItemAssociationsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * DocumentConfigurationItemAssociations entity class for Autotask API
 *
 * Associations between documents and configuration items
 * Supported Operations: GET, POST, DELETE
 * Category: knowledge
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DocumentConfigurationItemAssociationsEntity.htm}
 */
export declare class DocumentConfigurationItemAssociations extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new documentconfigurationitemassociations
     * @param documentConfigurationItemAssociations - The documentconfigurationitemassociations data to create
     * @returns Promise with the created documentconfigurationitemassociations
     */
    create(documentConfigurationItemAssociations: IDocumentConfigurationItemAssociations): Promise<ApiResponse<IDocumentConfigurationItemAssociations>>;
    /**
     * Get a documentconfigurationitemassociations by ID
     * @param id - The documentconfigurationitemassociations ID
     * @returns Promise with the documentconfigurationitemassociations data
     */
    get(id: number): Promise<ApiResponse<IDocumentConfigurationItemAssociations>>;
    /**
     * Delete a documentconfigurationitemassociations
     * @param id - The documentconfigurationitemassociations ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List documentconfigurationitemassociations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of documentconfigurationitemassociations
     */
    list(query?: IDocumentConfigurationItemAssociationsQuery): Promise<ApiResponse<IDocumentConfigurationItemAssociations[]>>;
}
//# sourceMappingURL=documentconfigurationitemassociations.d.ts.map