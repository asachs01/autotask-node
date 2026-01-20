import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IChangeOrderCharges {
    id?: number;
    [key: string]: any;
}
export interface IChangeOrderChargesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ChangeOrderCharges entity class for Autotask API
 *
 * Charges for change orders
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: financial
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ChangeOrderChargesEntity.htm}
 */
export declare class ChangeOrderCharges extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new changeordercharges
     * @param changeOrderCharges - The changeordercharges data to create
     * @returns Promise with the created changeordercharges
     */
    create(changeOrderCharges: IChangeOrderCharges): Promise<ApiResponse<IChangeOrderCharges>>;
    /**
     * Get a changeordercharges by ID
     * @param id - The changeordercharges ID
     * @returns Promise with the changeordercharges data
     */
    get(id: number): Promise<ApiResponse<IChangeOrderCharges>>;
    /**
     * Update a changeordercharges
     * @param id - The changeordercharges ID
     * @param changeOrderCharges - The updated changeordercharges data
     * @returns Promise with the updated changeordercharges
     */
    update(id: number, changeOrderCharges: Partial<IChangeOrderCharges>): Promise<ApiResponse<IChangeOrderCharges>>;
    /**
     * Partially update a changeordercharges
     * @param id - The changeordercharges ID
     * @param changeOrderCharges - The partial changeordercharges data to update
     * @returns Promise with the updated changeordercharges
     */
    patch(id: number, changeOrderCharges: Partial<IChangeOrderCharges>): Promise<ApiResponse<IChangeOrderCharges>>;
    /**
     * Delete a changeordercharges
     * @param id - The changeordercharges ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List changeordercharges with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of changeordercharges
     */
    list(query?: IChangeOrderChargesQuery): Promise<ApiResponse<IChangeOrderCharges[]>>;
}
//# sourceMappingURL=changeordercharges.d.ts.map