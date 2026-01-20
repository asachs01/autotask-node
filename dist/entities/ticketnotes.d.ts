import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITicketNotes {
    id?: number;
    [key: string]: any;
}
export interface ITicketNotesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TicketNotes entity class for Autotask API
 *
 * Notes for tickets
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: notes
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketNotesEntity.htm}
 */
export declare class TicketNotes extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new ticketnotes
     * @param ticketNotes - The ticketnotes data to create
     * @returns Promise with the created ticketnotes
     */
    create(ticketNotes: ITicketNotes): Promise<ApiResponse<ITicketNotes>>;
    /**
     * Get a ticketnotes by ID
     * @param id - The ticketnotes ID
     * @returns Promise with the ticketnotes data
     */
    get(id: number): Promise<ApiResponse<ITicketNotes>>;
    /**
     * Update a ticketnotes
     * @param id - The ticketnotes ID
     * @param ticketNotes - The updated ticketnotes data
     * @returns Promise with the updated ticketnotes
     */
    update(id: number, ticketNotes: Partial<ITicketNotes>): Promise<ApiResponse<ITicketNotes>>;
    /**
     * Partially update a ticketnotes
     * @param id - The ticketnotes ID
     * @param ticketNotes - The partial ticketnotes data to update
     * @returns Promise with the updated ticketnotes
     */
    patch(id: number, ticketNotes: Partial<ITicketNotes>): Promise<ApiResponse<ITicketNotes>>;
    /**
     * List ticketnotes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of ticketnotes
     */
    list(query?: ITicketNotesQuery): Promise<ApiResponse<ITicketNotes[]>>;
}
//# sourceMappingURL=ticketnotes.d.ts.map