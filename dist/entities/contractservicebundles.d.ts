import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContractServiceBundles {
    id?: number;
    [key: string]: any;
}
export interface IContractServiceBundlesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContractServiceBundles entity class for Autotask API
 *
 * Service bundles within contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractServiceBundlesEntity.htm}
 */
export declare class ContractServiceBundles extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contractservicebundles
     * @param contractServiceBundles - The contractservicebundles data to create
     * @returns Promise with the created contractservicebundles
     */
    create(contractServiceBundles: IContractServiceBundles): Promise<ApiResponse<IContractServiceBundles>>;
    /**
     * Get a contractservicebundles by ID
     * @param id - The contractservicebundles ID
     * @returns Promise with the contractservicebundles data
     */
    get(id: number): Promise<ApiResponse<IContractServiceBundles>>;
    /**
     * Update a contractservicebundles
     * @param id - The contractservicebundles ID
     * @param contractServiceBundles - The updated contractservicebundles data
     * @returns Promise with the updated contractservicebundles
     */
    update(id: number, contractServiceBundles: Partial<IContractServiceBundles>): Promise<ApiResponse<IContractServiceBundles>>;
    /**
     * Partially update a contractservicebundles
     * @param id - The contractservicebundles ID
     * @param contractServiceBundles - The partial contractservicebundles data to update
     * @returns Promise with the updated contractservicebundles
     */
    patch(id: number, contractServiceBundles: Partial<IContractServiceBundles>): Promise<ApiResponse<IContractServiceBundles>>;
    /**
     * Delete a contractservicebundles
     * @param id - The contractservicebundles ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List contractservicebundles with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractservicebundles
     */
    list(query?: IContractServiceBundlesQuery): Promise<ApiResponse<IContractServiceBundles[]>>;
}
//# sourceMappingURL=contractservicebundles.d.ts.map