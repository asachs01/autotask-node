import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IDocumentConfigurationItemCategoryAssociations {
    id?: number;
    [key: string]: any;
}
export interface IDocumentConfigurationItemCategoryAssociationsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * DocumentConfigurationItemCategoryAssociations entity class for Autotask API
 *
 * Associations between documents and configuration item categories
 * Supported Operations: GET, POST, DELETE
 * Category: knowledge
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DocumentConfigurationItemCategoryAssociationsEntity.htm}
 */
export declare class DocumentConfigurationItemCategoryAssociations extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new documentconfigurationitemcategoryassociations
     * @param documentConfigurationItemCategoryAssociations - The documentconfigurationitemcategoryassociations data to create
     * @returns Promise with the created documentconfigurationitemcategoryassociations
     */
    create(documentConfigurationItemCategoryAssociations: IDocumentConfigurationItemCategoryAssociations): Promise<ApiResponse<IDocumentConfigurationItemCategoryAssociations>>;
    /**
     * Get a documentconfigurationitemcategoryassociations by ID
     * @param id - The documentconfigurationitemcategoryassociations ID
     * @returns Promise with the documentconfigurationitemcategoryassociations data
     */
    get(id: number): Promise<ApiResponse<IDocumentConfigurationItemCategoryAssociations>>;
    /**
     * Delete a documentconfigurationitemcategoryassociations
     * @param id - The documentconfigurationitemcategoryassociations ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List documentconfigurationitemcategoryassociations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of documentconfigurationitemcategoryassociations
     */
    list(query?: IDocumentConfigurationItemCategoryAssociationsQuery): Promise<ApiResponse<IDocumentConfigurationItemCategoryAssociations[]>>;
}
//# sourceMappingURL=documentconfigurationitemcategoryassociations.d.ts.map