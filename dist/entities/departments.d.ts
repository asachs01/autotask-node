import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IDepartments {
    id?: number;
    [key: string]: any;
}
export interface IDepartmentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Departments entity class for Autotask API
 *
 * Organizational departments
 * Supported Operations: GET
 * Category: organizational
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/DepartmentsEntity.htm}
 */
export declare class Departments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a departments by ID
     * @param id - The departments ID
     * @returns Promise with the departments data
     */
    get(id: number): Promise<ApiResponse<IDepartments>>;
    /**
     * List departments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of departments
     */
    list(query?: IDepartmentsQuery): Promise<ApiResponse<IDepartments[]>>;
}
//# sourceMappingURL=departments.d.ts.map