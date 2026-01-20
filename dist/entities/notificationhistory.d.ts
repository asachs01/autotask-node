import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface INotificationHistory {
    id?: number;
    [key: string]: any;
}
export interface INotificationHistoryQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * NotificationHistory entity class for Autotask API
 *
 * History of system notifications
 * Supported Operations: GET
 * Category: notifications
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/NotificationHistoryEntity.htm}
 */
export declare class NotificationHistory extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a notificationhistory by ID
     * @param id - The notificationhistory ID
     * @returns Promise with the notificationhistory data
     */
    get(id: number): Promise<ApiResponse<INotificationHistory>>;
    /**
     * List notificationhistory with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of notificationhistory
     */
    list(query?: INotificationHistoryQuery): Promise<ApiResponse<INotificationHistory[]>>;
}
//# sourceMappingURL=notificationhistory.d.ts.map