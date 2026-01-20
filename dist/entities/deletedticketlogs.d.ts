import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IDeletedTicketLogs {
    id?: number;
    [key: string]: any;
}
export interface IDeletedTicketLogsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * DeletedTicketLogs entity class for Autotask API
 *
 * Audit logs for deleted tickets
 * Supported Operations: GET
 * Category: logs
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DeletedTicketLogsEntity.htm}
 */
export declare class DeletedTicketLogs extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a deletedticketlogs by ID
     * @param id - The deletedticketlogs ID
     * @returns Promise with the deletedticketlogs data
     */
    get(id: number): Promise<ApiResponse<IDeletedTicketLogs>>;
    /**
     * List deletedticketlogs with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of deletedticketlogs
     */
    list(query?: IDeletedTicketLogsQuery): Promise<ApiResponse<IDeletedTicketLogs[]>>;
}
//# sourceMappingURL=deletedticketlogs.d.ts.map