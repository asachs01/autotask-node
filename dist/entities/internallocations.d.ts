import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IInternalLocations {
    id?: number;
    [key: string]: any;
}
export interface IInternalLocationsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * InternalLocations entity class for Autotask API
 *
 * Internal office locations
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: organizational
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/InternalLocationsEntity.htm}
 */
export declare class InternalLocations extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new internallocations
     * @param internalLocations - The internallocations data to create
     * @returns Promise with the created internallocations
     */
    create(internalLocations: IInternalLocations): Promise<ApiResponse<IInternalLocations>>;
    /**
     * Get a internallocations by ID
     * @param id - The internallocations ID
     * @returns Promise with the internallocations data
     */
    get(id: number): Promise<ApiResponse<IInternalLocations>>;
    /**
     * Update a internallocations
     * @param id - The internallocations ID
     * @param internalLocations - The updated internallocations data
     * @returns Promise with the updated internallocations
     */
    update(id: number, internalLocations: Partial<IInternalLocations>): Promise<ApiResponse<IInternalLocations>>;
    /**
     * Partially update a internallocations
     * @param id - The internallocations ID
     * @param internalLocations - The partial internallocations data to update
     * @returns Promise with the updated internallocations
     */
    patch(id: number, internalLocations: Partial<IInternalLocations>): Promise<ApiResponse<IInternalLocations>>;
    /**
     * Delete a internallocations
     * @param id - The internallocations ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List internallocations with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of internallocations
     */
    list(query?: IInternalLocationsQuery): Promise<ApiResponse<IInternalLocations[]>>;
}
//# sourceMappingURL=internallocations.d.ts.map