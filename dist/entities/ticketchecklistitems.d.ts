import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITicketChecklistItems {
    id?: number;
    [key: string]: any;
}
export interface ITicketChecklistItemsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TicketChecklistItems entity class for Autotask API
 *
 * Checklist items for tickets
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: ticketing
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketChecklistItemsEntity.htm}
 */
export declare class TicketChecklistItems extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new ticketchecklistitems
     * @param ticketChecklistItems - The ticketchecklistitems data to create
     * @returns Promise with the created ticketchecklistitems
     */
    create(ticketChecklistItems: ITicketChecklistItems): Promise<ApiResponse<ITicketChecklistItems>>;
    /**
     * Get a ticketchecklistitems by ID
     * @param id - The ticketchecklistitems ID
     * @returns Promise with the ticketchecklistitems data
     */
    get(id: number): Promise<ApiResponse<ITicketChecklistItems>>;
    /**
     * Update a ticketchecklistitems
     * @param id - The ticketchecklistitems ID
     * @param ticketChecklistItems - The updated ticketchecklistitems data
     * @returns Promise with the updated ticketchecklistitems
     */
    update(id: number, ticketChecklistItems: Partial<ITicketChecklistItems>): Promise<ApiResponse<ITicketChecklistItems>>;
    /**
     * Partially update a ticketchecklistitems
     * @param id - The ticketchecklistitems ID
     * @param ticketChecklistItems - The partial ticketchecklistitems data to update
     * @returns Promise with the updated ticketchecklistitems
     */
    patch(id: number, ticketChecklistItems: Partial<ITicketChecklistItems>): Promise<ApiResponse<ITicketChecklistItems>>;
    /**
     * List ticketchecklistitems with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of ticketchecklistitems
     */
    list(query?: ITicketChecklistItemsQuery): Promise<ApiResponse<ITicketChecklistItems[]>>;
}
//# sourceMappingURL=ticketchecklistitems.d.ts.map