import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface TicketPriority {
    id?: number;
    name: string;
    description?: string;
    priorityLevel: number;
    isActive?: boolean;
    isDefaultValue?: boolean;
    isSystemValue?: boolean;
    sortOrder?: number;
    [key: string]: any;
}
export interface TicketPriorityQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TicketPriorities entity class for Autotask API (Compatibility Shim)
 *
 * @deprecated This entity was removed from the official Autotask API.
 * This compatibility shim is provided to maintain test compatibility.
 * Use ticket entity methods or static lookup values instead.
 *
 * Priority values for organizing tickets
 * Supported Operations: GET, POST, PUT, DELETE (simulated)
 * Category: ticketing-lookup
 */
export declare class TicketPriorities extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a ticket priority by ID
     * @param id - The ticket priority ID
     * @returns Promise with the ticket priority data
     */
    get(id: number): Promise<ApiResponse<TicketPriority>>;
    /**
     * List ticket priorities with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of ticket priorities
     */
    list(query?: TicketPriorityQuery): Promise<ApiResponse<TicketPriority[]>>;
    /**
     * Create a new ticket priority
     * @param data - Ticket priority data
     * @returns Promise with the created ticket priority
     */
    create(data: TicketPriority): Promise<ApiResponse<TicketPriority>>;
    /**
     * Update a ticket priority
     * @param id - The ticket priority ID
     * @param data - Updated ticket priority data
     * @returns Promise with the updated ticket priority
     */
    update(id: number, data: Partial<TicketPriority>): Promise<ApiResponse<TicketPriority>>;
    /**
     * Delete a ticket priority
     * @param id - The ticket priority ID
     * @returns Promise that resolves when the priority is deleted
     */
    delete(id: number): Promise<ApiResponse<any>>;
}
//# sourceMappingURL=ticketPriorities.d.ts.map