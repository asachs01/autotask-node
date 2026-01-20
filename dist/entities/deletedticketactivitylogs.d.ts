import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IDeletedTicketActivityLogs {
    id?: number;
    [key: string]: any;
}
export interface IDeletedTicketActivityLogsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * DeletedTicketActivityLogs entity class for Autotask API
 *
 * Audit logs for deleted ticket activities
 * Supported Operations: GET
 * Category: logs
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DeletedTicketActivityLogsEntity.htm}
 */
export declare class DeletedTicketActivityLogs extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a deletedticketactivitylogs by ID
     * @param id - The deletedticketactivitylogs ID
     * @returns Promise with the deletedticketactivitylogs data
     */
    get(id: number): Promise<ApiResponse<IDeletedTicketActivityLogs>>;
    /**
     * List deletedticketactivitylogs with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of deletedticketactivitylogs
     */
    list(query?: IDeletedTicketActivityLogsQuery): Promise<ApiResponse<IDeletedTicketActivityLogs[]>>;
}
//# sourceMappingURL=deletedticketactivitylogs.d.ts.map