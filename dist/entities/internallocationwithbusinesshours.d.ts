import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IInternalLocationWithBusinessHours {
    id?: number;
    [key: string]: any;
}
export interface IInternalLocationWithBusinessHoursQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * InternalLocationWithBusinessHours entity class for Autotask API
 *
 * Internal locations with business hours information
 * Supported Operations: GET
 * Category: organizational
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InternalLocationWithBusinessHoursEntity.htm}
 */
export declare class InternalLocationWithBusinessHours extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a internallocationwithbusinesshours by ID
     * @param id - The internallocationwithbusinesshours ID
     * @returns Promise with the internallocationwithbusinesshours data
     */
    get(id: number): Promise<ApiResponse<IInternalLocationWithBusinessHours>>;
    /**
     * List internallocationwithbusinesshours with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of internallocationwithbusinesshours
     */
    list(query?: IInternalLocationWithBusinessHoursQuery): Promise<ApiResponse<IInternalLocationWithBusinessHours[]>>;
}
//# sourceMappingURL=internallocationwithbusinesshours.d.ts.map