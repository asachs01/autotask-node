import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ICompanyNoteAttachments {
    id?: number;
    [key: string]: any;
}
export interface ICompanyNoteAttachmentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * CompanyNoteAttachments entity class for Autotask API
 *
 * File attachments for company notes
 * Supported Operations: GET, POST, DELETE
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CompanyNoteAttachmentsEntity.htm}
 */
export declare class CompanyNoteAttachments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new companynoteattachments
     * @param companyNoteAttachments - The companynoteattachments data to create
     * @returns Promise with the created companynoteattachments
     */
    create(companyNoteAttachments: ICompanyNoteAttachments): Promise<ApiResponse<ICompanyNoteAttachments>>;
    /**
     * Get a companynoteattachments by ID
     * @param id - The companynoteattachments ID
     * @returns Promise with the companynoteattachments data
     */
    get(id: number): Promise<ApiResponse<ICompanyNoteAttachments>>;
    /**
     * Delete a companynoteattachments
     * @param id - The companynoteattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List companynoteattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of companynoteattachments
     */
    list(query?: ICompanyNoteAttachmentsQuery): Promise<ApiResponse<ICompanyNoteAttachments[]>>;
}
//# sourceMappingURL=companynoteattachments.d.ts.map