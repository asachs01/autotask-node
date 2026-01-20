/**
 * Enhanced Tickets Entity with Advanced Query Builder Support
 * Demonstrates the new query capabilities for Autotask API
 */
import { AxiosInstance } from 'axios';
import winston from 'winston';
import { ITickets as Ticket } from './tickets';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { QueryableEntity } from '../utils/queryableEntity';
import { QueryResult } from '../types/queryBuilder';
export { ITickets as Ticket } from './tickets';
export interface TicketQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Enhanced Tickets entity with advanced query capabilities
 */
export declare class TicketsEnhanced extends QueryableEntity<Ticket> {
    private requestHandler?;
    protected readonly endpoint = "/Tickets";
    protected readonly entityName = "Tickets";
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler | undefined);
    static getMetadata(): MethodMetadata[];
    create(ticket: Ticket): Promise<ApiResponse<Ticket>>;
    get(id: number): Promise<ApiResponse<Ticket>>;
    update(id: number, ticket: Partial<Ticket>): Promise<ApiResponse<Ticket>>;
    delete(id: number): Promise<void>;
    list(query?: TicketQuery): Promise<ApiResponse<Ticket[]>>;
    /**
     * Find tickets by status
     */
    findByStatus(status: number): Promise<QueryResult<Ticket>>;
    /**
     * Find tickets by account
     */
    findByAccount(accountId: number): Promise<QueryResult<Ticket>>;
    /**
     * Find open tickets assigned to a resource
     */
    findOpenTicketsForResource(resourceId: number): Promise<QueryResult<Ticket>>;
    /**
     * Find overdue tickets
     */
    findOverdueTickets(): Promise<QueryResult<Ticket>>;
    /**
     * Find tickets created in date range
     */
    findTicketsInDateRange(startDate: string, endDate: string): Promise<QueryResult<Ticket>>;
    /**
     * Find high priority tickets
     */
    findHighPriorityTickets(): Promise<QueryResult<Ticket>>;
    /**
     * Find tickets with complex conditions
     */
    findComplexTickets(): Promise<QueryResult<Ticket>>;
    /**
     * Search tickets by title or description
     */
    searchTickets(searchTerm: string): Promise<QueryResult<Ticket>>;
    /**
     * Find tickets with specific custom field values
     */
    findTicketsWithCustomField(fieldName: string, value: any): Promise<QueryResult<Ticket>>;
    /**
     * Get ticket statistics
     */
    getTicketStats(): Promise<{
        total: number;
        open: number;
        closed: number;
        overdue: number;
    }>;
    /**
     * Find tickets with includes (related data)
     */
    findTicketsWithAccount(accountId?: number): Promise<QueryResult<Ticket>>;
    /**
     * Advanced pagination example
     */
    getTicketsPaginated(page?: number, pageSize?: number): Promise<QueryResult<Ticket>>;
}
//# sourceMappingURL=ticketsEnhanced.d.ts.map