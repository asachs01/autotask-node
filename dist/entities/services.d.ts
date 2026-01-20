import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IServices {
    id?: number;
    [key: string]: any;
}
export interface IServicesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Services entity class for Autotask API
 *
 * Individual services offered
 * Supported Operations: GET, POST, PATCH, PUT
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ServicesEntity.htm}
 */
export declare class Services extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new services
     * @param services - The services data to create
     * @returns Promise with the created services
     */
    create(services: IServices): Promise<ApiResponse<IServices>>;
    /**
     * Get a services by ID
     * @param id - The services ID
     * @returns Promise with the services data
     */
    get(id: number): Promise<ApiResponse<IServices>>;
    /**
     * Update a services
     * @param id - The services ID
     * @param services - The updated services data
     * @returns Promise with the updated services
     */
    update(id: number, services: Partial<IServices>): Promise<ApiResponse<IServices>>;
    /**
     * Partially update a services
     * @param id - The services ID
     * @param services - The partial services data to update
     * @returns Promise with the updated services
     */
    patch(id: number, services: Partial<IServices>): Promise<ApiResponse<IServices>>;
    /**
     * List services with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of services
     */
    list(query?: IServicesQuery): Promise<ApiResponse<IServices[]>>;
}
//# sourceMappingURL=services.d.ts.map