import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITicketNoteAttachments {
    id?: number;
    [key: string]: any;
}
export interface ITicketNoteAttachmentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TicketNoteAttachments entity class for Autotask API
 *
 * File attachments for ticket notes
 * Supported Operations: GET, POST, DELETE
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketNoteAttachmentsEntity.htm}
 */
export declare class TicketNoteAttachments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new ticketnoteattachments
     * @param ticketNoteAttachments - The ticketnoteattachments data to create
     * @returns Promise with the created ticketnoteattachments
     */
    create(ticketNoteAttachments: ITicketNoteAttachments): Promise<ApiResponse<ITicketNoteAttachments>>;
    /**
     * Get a ticketnoteattachments by ID
     * @param id - The ticketnoteattachments ID
     * @returns Promise with the ticketnoteattachments data
     */
    get(id: number): Promise<ApiResponse<ITicketNoteAttachments>>;
    /**
     * Delete a ticketnoteattachments
     * @param id - The ticketnoteattachments ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List ticketnoteattachments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of ticketnoteattachments
     */
    list(query?: ITicketNoteAttachmentsQuery): Promise<ApiResponse<ITicketNoteAttachments[]>>;
}
//# sourceMappingURL=ticketnoteattachments.d.ts.map