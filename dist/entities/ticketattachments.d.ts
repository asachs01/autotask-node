import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITicketAttachments {
    id?: number;
    [key: string]: any;
}
export interface ITicketAttachmentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TicketAttachments entity class for Autotask API
 *
 * File attachments for tickets
 * Supported Operations: GET, POST, DELETE
 * Category: attachments
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketAttachmentsEntity.htm}
 */
export declare class TicketAttachments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new ticketattachments
     * @param ticketAttachments - The ticketattachments data to create
     * @returns Promise with the created ticketattachments
     */
    create(ticketAttachments: ITicketAttachments): Promise<ApiResponse<ITicketAttachments>>;
    /**
     * Get a ticketattachments by ID
     * @param id - The ticketattachments ID
     * @returns Promise with the ticketattachments data
     */
    get(id: number): Promise<ApiResponse<ITicketAttachments>>;
    /**
     * Delete a ticketattachments
     * @param id - The ticketattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List ticketattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of ticketattachments
     */
    list(query?: ITicketAttachmentsQuery): Promise<ApiResponse<ITicketAttachments[]>>;
}
//# sourceMappingURL=ticketattachments.d.ts.map