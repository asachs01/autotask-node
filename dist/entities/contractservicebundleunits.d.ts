import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContractServiceBundleUnits {
    id?: number;
    [key: string]: any;
}
export interface IContractServiceBundleUnitsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContractServiceBundleUnits entity class for Autotask API
 *
 * Units for contract service bundles
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractServiceBundleUnitsEntity.htm}
 */
export declare class ContractServiceBundleUnits extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contractservicebundleunits
     * @param contractServiceBundleUnits - The contractservicebundleunits data to create
     * @returns Promise with the created contractservicebundleunits
     */
    create(contractServiceBundleUnits: IContractServiceBundleUnits): Promise<ApiResponse<IContractServiceBundleUnits>>;
    /**
     * Get a contractservicebundleunits by ID
     * @param id - The contractservicebundleunits ID
     * @returns Promise with the contractservicebundleunits data
     */
    get(id: number): Promise<ApiResponse<IContractServiceBundleUnits>>;
    /**
     * Update a contractservicebundleunits
     * @param id - The contractservicebundleunits ID
     * @param contractServiceBundleUnits - The updated contractservicebundleunits data
     * @returns Promise with the updated contractservicebundleunits
     */
    update(id: number, contractServiceBundleUnits: Partial<IContractServiceBundleUnits>): Promise<ApiResponse<IContractServiceBundleUnits>>;
    /**
     * Partially update a contractservicebundleunits
     * @param id - The contractservicebundleunits ID
     * @param contractServiceBundleUnits - The partial contractservicebundleunits data to update
     * @returns Promise with the updated contractservicebundleunits
     */
    patch(id: number, contractServiceBundleUnits: Partial<IContractServiceBundleUnits>): Promise<ApiResponse<IContractServiceBundleUnits>>;
    /**
     * Delete a contractservicebundleunits
     * @param id - The contractservicebundleunits ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List contractservicebundleunits with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractservicebundleunits
     */
    list(query?: IContractServiceBundleUnitsQuery): Promise<ApiResponse<IContractServiceBundleUnits[]>>;
}
//# sourceMappingURL=contractservicebundleunits.d.ts.map