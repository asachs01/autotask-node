import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface TicketSource {
    id?: number;
    name: string;
    description?: string;
    isActive?: boolean;
    isDefaultValue?: boolean;
    isSystemValue?: boolean;
    sortOrder?: number;
    [key: string]: any;
}
export interface TicketSourceQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TicketSources entity class for Autotask API (Compatibility Shim)
 *
 * @deprecated This entity was removed from the official Autotask API.
 * This compatibility shim is provided to maintain test compatibility.
 * Use ticket entity methods or static lookup values instead.
 *
 * Source values for organizing tickets
 * Supported Operations: GET, POST, PUT, DELETE (simulated)
 * Category: ticketing-lookup
 */
export declare class TicketSources extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a ticket source by ID
     * @param id - The ticket source ID
     * @returns Promise with the ticket source data
     */
    get(id: number): Promise<ApiResponse<TicketSource>>;
    /**
     * List ticket sources with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of ticket sources
     */
    list(query?: TicketSourceQuery): Promise<ApiResponse<TicketSource[]>>;
    /**
     * Create a new ticket source
     * @param data - Ticket source data
     * @returns Promise with the created ticket source
     */
    create(data: TicketSource): Promise<ApiResponse<TicketSource>>;
    /**
     * Update a ticket source
     * @param id - The ticket source ID
     * @param data - Updated ticket source data
     * @returns Promise with the updated ticket source
     */
    update(id: number, data: Partial<TicketSource>): Promise<ApiResponse<TicketSource>>;
    /**
     * Delete a ticket source
     * @param id - The ticket source ID
     * @returns Promise that resolves when the source is deleted
     */
    delete(id: number): Promise<ApiResponse<any>>;
}
//# sourceMappingURL=ticketSources.d.ts.map