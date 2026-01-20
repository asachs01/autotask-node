import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IModules {
    id?: number;
    [key: string]: any;
}
export interface IModulesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Modules entity class for Autotask API
 *
 * System modules and features
 * Supported Operations: GET
 * Category: lookup
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ModulesEntity.htm}
 */
export declare class Modules extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a modules by ID
     * @param id - The modules ID
     * @returns Promise with the modules data
     */
    get(id: number): Promise<ApiResponse<IModules>>;
    /**
     * List modules with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of modules
     */
    list(query?: IModulesQuery): Promise<ApiResponse<IModules[]>>;
}
//# sourceMappingURL=modules.d.ts.map