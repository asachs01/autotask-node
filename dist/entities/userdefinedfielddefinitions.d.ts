import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IUserDefinedFieldDefinitions {
    id?: number;
    [key: string]: any;
}
export interface IUserDefinedFieldDefinitionsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * UserDefinedFieldDefinitions entity class for Autotask API
 *
 * Definitions for user-defined fields
 * Supported Operations: GET
 * Category: user_defined
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/UserDefinedFieldDefinitionsEntity.htm}
 */
export declare class UserDefinedFieldDefinitions extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a userdefinedfielddefinitions by ID
     * @param id - The userdefinedfielddefinitions ID
     * @returns Promise with the userdefinedfielddefinitions data
     */
    get(id: number): Promise<ApiResponse<IUserDefinedFieldDefinitions>>;
    /**
     * List userdefinedfielddefinitions with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of userdefinedfielddefinitions
     */
    list(query?: IUserDefinedFieldDefinitionsQuery): Promise<ApiResponse<IUserDefinedFieldDefinitions[]>>;
}
//# sourceMappingURL=userdefinedfielddefinitions.d.ts.map