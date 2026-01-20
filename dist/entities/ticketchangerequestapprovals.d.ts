import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITicketChangeRequestApprovals {
    id?: number;
    [key: string]: any;
}
export interface ITicketChangeRequestApprovalsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TicketChangeRequestApprovals entity class for Autotask API
 *
 * Approvals for ticket change requests
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: ticketing
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketChangeRequestApprovalsEntity.htm}
 */
export declare class TicketChangeRequestApprovals extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new ticketchangerequestapprovals
     * @param ticketChangeRequestApprovals - The ticketchangerequestapprovals data to create
     * @returns Promise with the created ticketchangerequestapprovals
     */
    create(ticketChangeRequestApprovals: ITicketChangeRequestApprovals): Promise<ApiResponse<ITicketChangeRequestApprovals>>;
    /**
     * Get a ticketchangerequestapprovals by ID
     * @param id - The ticketchangerequestapprovals ID
     * @returns Promise with the ticketchangerequestapprovals data
     */
    get(id: number): Promise<ApiResponse<ITicketChangeRequestApprovals>>;
    /**
     * Update a ticketchangerequestapprovals
     * @param id - The ticketchangerequestapprovals ID
     * @param ticketChangeRequestApprovals - The updated ticketchangerequestapprovals data
     * @returns Promise with the updated ticketchangerequestapprovals
     */
    update(id: number, ticketChangeRequestApprovals: Partial<ITicketChangeRequestApprovals>): Promise<ApiResponse<ITicketChangeRequestApprovals>>;
    /**
     * Partially update a ticketchangerequestapprovals
     * @param id - The ticketchangerequestapprovals ID
     * @param ticketChangeRequestApprovals - The partial ticketchangerequestapprovals data to update
     * @returns Promise with the updated ticketchangerequestapprovals
     */
    patch(id: number, ticketChangeRequestApprovals: Partial<ITicketChangeRequestApprovals>): Promise<ApiResponse<ITicketChangeRequestApprovals>>;
    /**
     * List ticketchangerequestapprovals with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of ticketchangerequestapprovals
     */
    list(query?: ITicketChangeRequestApprovalsQuery): Promise<ApiResponse<ITicketChangeRequestApprovals[]>>;
}
//# sourceMappingURL=ticketchangerequestapprovals.d.ts.map