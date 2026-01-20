import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITicketHistory {
    id?: number;
    [key: string]: any;
}
export interface ITicketHistoryQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TicketHistory entity class for Autotask API
 *
 * Historical changes to tickets
 * Supported Operations: GET
 * Category: ticketing
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketHistoryEntity.htm}
 */
export declare class TicketHistory extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a tickethistory by ID
     * @param id - The tickethistory ID
     * @returns Promise with the tickethistory data
     */
    get(id: number): Promise<ApiResponse<ITicketHistory>>;
    /**
     * List tickethistory with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of tickethistory
     */
    list(query?: ITicketHistoryQuery): Promise<ApiResponse<ITicketHistory[]>>;
}
//# sourceMappingURL=tickethistory.d.ts.map