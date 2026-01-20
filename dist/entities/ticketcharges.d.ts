import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITicketCharges {
    id?: number;
    [key: string]: any;
}
export interface ITicketChargesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TicketCharges entity class for Autotask API
 *
 * Charges associated with tickets
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: ticketing
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketChargesEntity.htm}
 */
export declare class TicketCharges extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new ticketcharges
     * @param ticketCharges - The ticketcharges data to create
     * @returns Promise with the created ticketcharges
     */
    create(ticketCharges: ITicketCharges): Promise<ApiResponse<ITicketCharges>>;
    /**
     * Get a ticketcharges by ID
     * @param id - The ticketcharges ID
     * @returns Promise with the ticketcharges data
     */
    get(id: number): Promise<ApiResponse<ITicketCharges>>;
    /**
     * Update a ticketcharges
     * @param id - The ticketcharges ID
     * @param ticketCharges - The updated ticketcharges data
     * @returns Promise with the updated ticketcharges
     */
    update(id: number, ticketCharges: Partial<ITicketCharges>): Promise<ApiResponse<ITicketCharges>>;
    /**
     * Partially update a ticketcharges
     * @param id - The ticketcharges ID
     * @param ticketCharges - The partial ticketcharges data to update
     * @returns Promise with the updated ticketcharges
     */
    patch(id: number, ticketCharges: Partial<ITicketCharges>): Promise<ApiResponse<ITicketCharges>>;
    /**
     * Delete a ticketcharges
     * @param id - The ticketcharges ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List ticketcharges with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of ticketcharges
     */
    list(query?: ITicketChargesQuery): Promise<ApiResponse<ITicketCharges[]>>;
}
//# sourceMappingURL=ticketcharges.d.ts.map