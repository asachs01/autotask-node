import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IChangeRequestLinks {
    id?: number;
    [key: string]: any;
}
export interface IChangeRequestLinksQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ChangeRequestLinks entity class for Autotask API
 *
 * Links between change requests
 * Supported Operations: GET, POST, DELETE
 * Category: associations
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ChangeRequestLinksEntity.htm}
 */
export declare class ChangeRequestLinks extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new changerequestlinks
     * @param changeRequestLinks - The changerequestlinks data to create
     * @returns Promise with the created changerequestlinks
     */
    create(changeRequestLinks: IChangeRequestLinks): Promise<ApiResponse<IChangeRequestLinks>>;
    /**
     * Get a changerequestlinks by ID
     * @param id - The changerequestlinks ID
     * @returns Promise with the changerequestlinks data
     */
    get(id: number): Promise<ApiResponse<IChangeRequestLinks>>;
    /**
     * Delete a changerequestlinks
     * @param id - The changerequestlinks ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List changerequestlinks with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of changerequestlinks
     */
    list(query?: IChangeRequestLinksQuery): Promise<ApiResponse<IChangeRequestLinks[]>>;
}
//# sourceMappingURL=changerequestlinks.d.ts.map