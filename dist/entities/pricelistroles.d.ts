import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IPriceListRoles {
    id?: number;
    [key: string]: any;
}
export interface IPriceListRolesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * PriceListRoles entity class for Autotask API
 *
 * Roles in price lists
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: pricing
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/PriceListRolesEntity.htm}
 */
export declare class PriceListRoles extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new pricelistroles
     * @param priceListRoles - The pricelistroles data to create
     * @returns Promise with the created pricelistroles
     */
    create(priceListRoles: IPriceListRoles): Promise<ApiResponse<IPriceListRoles>>;
    /**
     * Get a pricelistroles by ID
     * @param id - The pricelistroles ID
     * @returns Promise with the pricelistroles data
     */
    get(id: number): Promise<ApiResponse<IPriceListRoles>>;
    /**
     * Update a pricelistroles
     * @param id - The pricelistroles ID
     * @param priceListRoles - The updated pricelistroles data
     * @returns Promise with the updated pricelistroles
     */
    update(id: number, priceListRoles: Partial<IPriceListRoles>): Promise<ApiResponse<IPriceListRoles>>;
    /**
     * Partially update a pricelistroles
     * @param id - The pricelistroles ID
     * @param priceListRoles - The partial pricelistroles data to update
     * @returns Promise with the updated pricelistroles
     */
    patch(id: number, priceListRoles: Partial<IPriceListRoles>): Promise<ApiResponse<IPriceListRoles>>;
    /**
     * Delete a pricelistroles
     * @param id - The pricelistroles ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List pricelistroles with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of pricelistroles
     */
    list(query?: IPriceListRolesQuery): Promise<ApiResponse<IPriceListRoles[]>>;
}
//# sourceMappingURL=pricelistroles.d.ts.map