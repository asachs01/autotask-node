import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IPhases {
    id?: number;
    [key: string]: any;
}
export interface IPhasesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * Phases entity class for Autotask API
 *
 * Project and task phases
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: lookup
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PhasesEntity.htm}
 */
export declare class Phases extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new phases
     * @param phases - The phases data to create
     * @returns Promise with the created phases
     */
    create(phases: IPhases): Promise<ApiResponse<IPhases>>;
    /**
     * Get a phases by ID
     * @param id - The phases ID
     * @returns Promise with the phases data
     */
    get(id: number): Promise<ApiResponse<IPhases>>;
    /**
     * Update a phases
     * @param id - The phases ID
     * @param phases - The updated phases data
     * @returns Promise with the updated phases
     */
    update(id: number, phases: Partial<IPhases>): Promise<ApiResponse<IPhases>>;
    /**
     * Partially update a phases
     * @param id - The phases ID
     * @param phases - The partial phases data to update
     * @returns Promise with the updated phases
     */
    patch(id: number, phases: Partial<IPhases>): Promise<ApiResponse<IPhases>>;
    /**
     * Delete a phases
     * @param id - The phases ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List phases with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of phases
     */
    list(query?: IPhasesQuery): Promise<ApiResponse<IPhases[]>>;
}
//# sourceMappingURL=phases.d.ts.map