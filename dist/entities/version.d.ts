import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IVersion {
    id?: number;
    [key: string]: any;
}
export interface IVersionQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Version entity class for Autotask API
 *
 * API version information
 * Supported Operations: GET
 * Category: lookup
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/VersionEntity.htm}
 */
export declare class Version extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a version by ID
     * @param id - The version ID
     * @returns Promise with the version data
     */
    get(id: number): Promise<ApiResponse<IVersion>>;
    /**
     * List version with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of version
     */
    list(query?: IVersionQuery): Promise<ApiResponse<IVersion[]>>;
}
//# sourceMappingURL=version.d.ts.map