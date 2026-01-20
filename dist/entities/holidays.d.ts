import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IHolidays {
    id?: number;
    [key: string]: any;
}
export interface IHolidaysQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Holidays entity class for Autotask API
 *
 * Holiday calendar entries
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: time
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/HolidaysEntity.htm}
 */
export declare class Holidays extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new holidays
     * @param holidays - The holidays data to create
     * @returns Promise with the created holidays
     */
    create(holidays: IHolidays): Promise<ApiResponse<IHolidays>>;
    /**
     * Get a holidays by ID
     * @param id - The holidays ID
     * @returns Promise with the holidays data
     */
    get(id: number): Promise<ApiResponse<IHolidays>>;
    /**
     * Update a holidays
     * @param id - The holidays ID
     * @param holidays - The updated holidays data
     * @returns Promise with the updated holidays
     */
    update(id: number, holidays: Partial<IHolidays>): Promise<ApiResponse<IHolidays>>;
    /**
     * Partially update a holidays
     * @param id - The holidays ID
     * @param holidays - The partial holidays data to update
     * @returns Promise with the updated holidays
     */
    patch(id: number, holidays: Partial<IHolidays>): Promise<ApiResponse<IHolidays>>;
    /**
     * Delete a holidays
     * @param id - The holidays ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List holidays with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of holidays
     */
    list(query?: IHolidaysQuery): Promise<ApiResponse<IHolidays[]>>;
}
//# sourceMappingURL=holidays.d.ts.map