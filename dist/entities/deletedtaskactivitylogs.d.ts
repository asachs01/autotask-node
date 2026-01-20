import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IDeletedTaskActivityLogs {
    id?: number;
    [key: string]: any;
}
export interface IDeletedTaskActivityLogsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * DeletedTaskActivityLogs entity class for Autotask API
 *
 * Audit logs for deleted task activities
 * Supported Operations: GET
 * Category: logs
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DeletedTaskActivityLogsEntity.htm}
 */
export declare class DeletedTaskActivityLogs extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a deletedtaskactivitylogs by ID
     * @param id - The deletedtaskactivitylogs ID
     * @returns Promise with the deletedtaskactivitylogs data
     */
    get(id: number): Promise<ApiResponse<IDeletedTaskActivityLogs>>;
    /**
     * List deletedtaskactivitylogs with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of deletedtaskactivitylogs
     */
    list(query?: IDeletedTaskActivityLogsQuery): Promise<ApiResponse<IDeletedTaskActivityLogs[]>>;
}
//# sourceMappingURL=deletedtaskactivitylogs.d.ts.map