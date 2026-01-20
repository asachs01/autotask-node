import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IActionTypes {
    id?: number;
    [key: string]: any;
}
export interface IActionTypesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ActionTypes entity class for Autotask API
 *
 * Lookup entity for action types
 * Supported Operations: GET
 * Category: lookup
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ActionTypesEntity.htm}
 */
export declare class ActionTypes extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a actiontypes by ID
     * @param id - The actiontypes ID
     * @returns Promise with the actiontypes data
     */
    get(id: number): Promise<ApiResponse<IActionTypes>>;
    /**
     * List actiontypes with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of actiontypes
     */
    list(query?: IActionTypesQuery): Promise<ApiResponse<IActionTypes[]>>;
}
//# sourceMappingURL=actiontypes.d.ts.map