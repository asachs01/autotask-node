import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface TicketStatus {
    id?: number;
    name: string;
    description?: string;
    isActive?: boolean;
    isDefaultValue?: boolean;
    isSystemValue?: boolean;
    sortOrder?: number;
    [key: string]: any;
}
export interface TicketStatusQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TicketStatuses entity class for Autotask API (Compatibility Shim)
 *
 * @deprecated This entity was removed from the official Autotask API.
 * This compatibility shim is provided to maintain test compatibility.
 * Use ticket entity methods or static lookup values instead.
 *
 * Status values for organizing tickets
 * Supported Operations: GET, POST, PUT, DELETE (simulated)
 * Category: ticketing-lookup
 */
export declare class TicketStatuses extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a ticket status by ID
     * @param id - The ticket status ID
     * @returns Promise with the ticket status data
     */
    get(id: number): Promise<ApiResponse<TicketStatus>>;
    /**
     * List ticket statuses with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of ticket statuses
     */
    list(query?: TicketStatusQuery): Promise<ApiResponse<TicketStatus[]>>;
    /**
     * Create a new ticket status
     * @param data - Ticket status data
     * @returns Promise with the created ticket status
     */
    create(data: TicketStatus): Promise<ApiResponse<TicketStatus>>;
    /**
     * Update a ticket status
     * @param id - The ticket status ID
     * @param data - Updated ticket status data
     * @returns Promise with the updated ticket status
     */
    update(id: number, data: Partial<TicketStatus>): Promise<ApiResponse<TicketStatus>>;
    /**
     * Delete a ticket status
     * @param id - The ticket status ID
     * @returns Promise that resolves when the status is deleted
     */
    delete(id: number): Promise<ApiResponse<any>>;
}
//# sourceMappingURL=ticketStatuses.d.ts.map