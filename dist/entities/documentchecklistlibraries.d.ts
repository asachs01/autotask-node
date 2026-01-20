import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IDocumentChecklistLibraries {
    id?: number;
    [key: string]: any;
}
export interface IDocumentChecklistLibrariesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * DocumentChecklistLibraries entity class for Autotask API
 *
 * Checklist libraries for documents
 * Supported Operations: GET
 * Category: knowledge
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DocumentChecklistLibrariesEntity.htm}
 */
export declare class DocumentChecklistLibraries extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a documentchecklistlibraries by ID
     * @param id - The documentchecklistlibraries ID
     * @returns Promise with the documentchecklistlibraries data
     */
    get(id: number): Promise<ApiResponse<IDocumentChecklistLibraries>>;
    /**
     * List documentchecklistlibraries with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of documentchecklistlibraries
     */
    list(query?: IDocumentChecklistLibrariesQuery): Promise<ApiResponse<IDocumentChecklistLibraries[]>>;
}
//# sourceMappingURL=documentchecklistlibraries.d.ts.map