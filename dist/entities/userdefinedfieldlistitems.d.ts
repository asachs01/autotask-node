import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IUserDefinedFieldListItems {
    id?: number;
    [key: string]: any;
}
export interface IUserDefinedFieldListItemsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * UserDefinedFieldListItems entity class for Autotask API
 *
 * List items for user-defined fields
 * Supported Operations: GET
 * Category: user_defined
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/UserDefinedFieldListItemsEntity.htm}
 */
export declare class UserDefinedFieldListItems extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a userdefinedfieldlistitems by ID
     * @param id - The userdefinedfieldlistitems ID
     * @returns Promise with the userdefinedfieldlistitems data
     */
    get(id: number): Promise<ApiResponse<IUserDefinedFieldListItems>>;
    /**
     * List userdefinedfieldlistitems with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of userdefinedfieldlistitems
     */
    list(query?: IUserDefinedFieldListItemsQuery): Promise<ApiResponse<IUserDefinedFieldListItems[]>>;
}
//# sourceMappingURL=userdefinedfieldlistitems.d.ts.map