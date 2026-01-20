import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContractServiceBundleAdjustments {
    id?: number;
    [key: string]: any;
}
export interface IContractServiceBundleAdjustmentsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContractServiceBundleAdjustments entity class for Autotask API
 *
 * Adjustments to contract service bundles
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractServiceBundleAdjustmentsEntity.htm}
 */
export declare class ContractServiceBundleAdjustments extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contractservicebundleadjustments
     * @param contractServiceBundleAdjustments - The contractservicebundleadjustments data to create
     * @returns Promise with the created contractservicebundleadjustments
     */
    create(contractServiceBundleAdjustments: IContractServiceBundleAdjustments): Promise<ApiResponse<IContractServiceBundleAdjustments>>;
    /**
     * Get a contractservicebundleadjustments by ID
     * @param id - The contractservicebundleadjustments ID
     * @returns Promise with the contractservicebundleadjustments data
     */
    get(id: number): Promise<ApiResponse<IContractServiceBundleAdjustments>>;
    /**
     * Update a contractservicebundleadjustments
     * @param id - The contractservicebundleadjustments ID
     * @param contractServiceBundleAdjustments - The updated contractservicebundleadjustments data
     * @returns Promise with the updated contractservicebundleadjustments
     */
    update(id: number, contractServiceBundleAdjustments: Partial<IContractServiceBundleAdjustments>): Promise<ApiResponse<IContractServiceBundleAdjustments>>;
    /**
     * Partially update a contractservicebundleadjustments
     * @param id - The contractservicebundleadjustments ID
     * @param contractServiceBundleAdjustments - The partial contractservicebundleadjustments data to update
     * @returns Promise with the updated contractservicebundleadjustments
     */
    patch(id: number, contractServiceBundleAdjustments: Partial<IContractServiceBundleAdjustments>): Promise<ApiResponse<IContractServiceBundleAdjustments>>;
    /**
     * Delete a contractservicebundleadjustments
     * @param id - The contractservicebundleadjustments ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List contractservicebundleadjustments with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractservicebundleadjustments
     */
    list(query?: IContractServiceBundleAdjustmentsQuery): Promise<ApiResponse<IContractServiceBundleAdjustments[]>>;
}
//# sourceMappingURL=contractservicebundleadjustments.d.ts.map