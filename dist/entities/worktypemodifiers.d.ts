import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IWorkTypeModifiers {
    id?: number;
    [key: string]: any;
}
export interface IWorkTypeModifiersQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * WorkTypeModifiers entity class for Autotask API
 *
 * Modifiers for different types of work
 * Supported Operations: GET
 * Category: lookup
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/WorkTypeModifiersEntity.htm}
 */
export declare class WorkTypeModifiers extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a worktypemodifiers by ID
     * @param id - The worktypemodifiers ID
     * @returns Promise with the worktypemodifiers data
     */
    get(id: number): Promise<ApiResponse<IWorkTypeModifiers>>;
    /**
     * List worktypemodifiers with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of worktypemodifiers
     */
    list(query?: IWorkTypeModifiersQuery): Promise<ApiResponse<IWorkTypeModifiers[]>>;
}
//# sourceMappingURL=worktypemodifiers.d.ts.map