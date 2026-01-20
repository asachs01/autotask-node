import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IOpportunityAttachments {
    id?: number;
    [key: string]: any;
}
export interface IOpportunityAttachmentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * OpportunityAttachments entity class for Autotask API
 *
 * File attachments for opportunities
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/OpportunityAttachmentsEntity.htm}
 */
export declare class OpportunityAttachments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new opportunityattachments
     * @param opportunityAttachments - The opportunityattachments data to create
     * @returns Promise with the created opportunityattachments
     */
    create(opportunityAttachments: IOpportunityAttachments): Promise<ApiResponse<IOpportunityAttachments>>;
    /**
     * Get a opportunityattachments by ID
     * @param id - The opportunityattachments ID
     * @returns Promise with the opportunityattachments data
     */
    get(id: number): Promise<ApiResponse<IOpportunityAttachments>>;
    /**
     * Delete a opportunityattachments
     * @param id - The opportunityattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List opportunityattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of opportunityattachments
     */
    list(query?: IOpportunityAttachmentsQuery): Promise<ApiResponse<IOpportunityAttachments[]>>;
}
//# sourceMappingURL=opportunityattachments.d.ts.map