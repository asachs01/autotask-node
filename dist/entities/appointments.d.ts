import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IAppointments {
    id?: number;
    [key: string]: any;
}
export interface IAppointmentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Appointments entity class for Autotask API
 *
 * Calendar appointments and scheduling
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: time
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/AppointmentsEntity.htm}
 */
export declare class Appointments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new appointments
     * @param appointments - The appointments data to create
     * @returns Promise with the created appointments
     */
    create(appointments: IAppointments): Promise<ApiResponse<IAppointments>>;
    /**
     * Get a appointments by ID
     * @param id - The appointments ID
     * @returns Promise with the appointments data
     */
    get(id: number): Promise<ApiResponse<IAppointments>>;
    /**
     * Update a appointments
     * @param id - The appointments ID
     * @param appointments - The updated appointments data
     * @returns Promise with the updated appointments
     */
    update(id: number, appointments: Partial<IAppointments>): Promise<ApiResponse<IAppointments>>;
    /**
     * Partially update a appointments
     * @param id - The appointments ID
     * @param appointments - The partial appointments data to update
     * @returns Promise with the updated appointments
     */
    patch(id: number, appointments: Partial<IAppointments>): Promise<ApiResponse<IAppointments>>;
    /**
     * Delete a appointments
     * @param id - The appointments ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List appointments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of appointments
     */
    list(query?: IAppointmentsQuery): Promise<ApiResponse<IAppointments[]>>;
}
//# sourceMappingURL=appointments.d.ts.map