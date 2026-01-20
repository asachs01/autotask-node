import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface ITicketChecklistLibraries {
    id?: number;
    [key: string]: any;
}
export interface ITicketChecklistLibrariesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * TicketChecklistLibraries entity class for Autotask API
 *
 * Checklist libraries for tickets
 * Supported Operations: GET
 * Category: ticketing
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/TicketChecklistLibrariesEntity.htm}
 */
export declare class TicketChecklistLibraries extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a ticketchecklistlibraries by ID
     * @param id - The ticketchecklistlibraries ID
     * @returns Promise with the ticketchecklistlibraries data
     */
    get(id: number): Promise<ApiResponse<ITicketChecklistLibraries>>;
    /**
     * List ticketchecklistlibraries with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of ticketchecklistlibraries
     */
    list(query?: ITicketChecklistLibrariesQuery): Promise<ApiResponse<ITicketChecklistLibraries[]>>;
}
//# sourceMappingURL=ticketchecklistlibraries.d.ts.map