import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITicketRmaCredits {
    id?: number;
    [key: string]: any;
}
export interface ITicketRmaCreditsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TicketRmaCredits entity class for Autotask API
 *
 * RMA credits associated with tickets
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: ticketing
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketRmaCreditsEntity.htm}
 */
export declare class TicketRmaCredits extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new ticketrmacredits
     * @param ticketRmaCredits - The ticketrmacredits data to create
     * @returns Promise with the created ticketrmacredits
     */
    create(ticketRmaCredits: ITicketRmaCredits): Promise<ApiResponse<ITicketRmaCredits>>;
    /**
     * Get a ticketrmacredits by ID
     * @param id - The ticketrmacredits ID
     * @returns Promise with the ticketrmacredits data
     */
    get(id: number): Promise<ApiResponse<ITicketRmaCredits>>;
    /**
     * Update a ticketrmacredits
     * @param id - The ticketrmacredits ID
     * @param ticketRmaCredits - The updated ticketrmacredits data
     * @returns Promise with the updated ticketrmacredits
     */
    update(id: number, ticketRmaCredits: Partial<ITicketRmaCredits>): Promise<ApiResponse<ITicketRmaCredits>>;
    /**
     * Partially update a ticketrmacredits
     * @param id - The ticketrmacredits ID
     * @param ticketRmaCredits - The partial ticketrmacredits data to update
     * @returns Promise with the updated ticketrmacredits
     */
    patch(id: number, ticketRmaCredits: Partial<ITicketRmaCredits>): Promise<ApiResponse<ITicketRmaCredits>>;
    /**
     * Delete a ticketrmacredits
     * @param id - The ticketrmacredits ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List ticketrmacredits with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of ticketrmacredits
     */
    list(query?: ITicketRmaCreditsQuery): Promise<ApiResponse<ITicketRmaCredits[]>>;
}
//# sourceMappingURL=ticketrmacredits.d.ts.map