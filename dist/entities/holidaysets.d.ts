import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IHolidaySets {
    id?: number;
    [key: string]: any;
}
export interface IHolidaySetsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * HolidaySets entity class for Autotask API
 *
 * Sets of holidays for different regions
 * Supported Operations: GET
 * Category: time
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/HolidaySetsEntity.htm}
 */
export declare class HolidaySets extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Get a holidaysets by ID
     * @param id - The holidaysets ID
     * @returns Promise with the holidaysets data
     */
    get(id: number): Promise<ApiResponse<IHolidaySets>>;
    /**
     * List holidaysets with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of holidaysets
     */
    list(query?: IHolidaySetsQuery): Promise<ApiResponse<IHolidaySets[]>>;
}
//# sourceMappingURL=holidaysets.d.ts.map