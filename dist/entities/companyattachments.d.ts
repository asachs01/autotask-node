import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ICompanyAttachments {
    id?: number;
    [key: string]: any;
}
export interface ICompanyAttachmentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * CompanyAttachments entity class for Autotask API
 *
 * File attachments for companies
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/CompanyAttachmentsEntity.htm}
 */
export declare class CompanyAttachments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new companyattachments
     * @param companyAttachments - The companyattachments data to create
     * @returns Promise with the created companyattachments
     */
    create(companyAttachments: ICompanyAttachments): Promise<ApiResponse<ICompanyAttachments>>;
    /**
     * Get a companyattachments by ID
     * @param id - The companyattachments ID
     * @returns Promise with the companyattachments data
     */
    get(id: number): Promise<ApiResponse<ICompanyAttachments>>;
    /**
     * Delete a companyattachments
     * @param id - The companyattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List companyattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of companyattachments
     */
    list(query?: ICompanyAttachmentsQuery): Promise<ApiResponse<ICompanyAttachments[]>>;
}
//# sourceMappingURL=companyattachments.d.ts.map