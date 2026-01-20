import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContractServiceUnits {
    id?: number;
    [key: string]: any;
}
export interface IContractServiceUnitsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContractServiceUnits entity class for Autotask API
 *
 * Units for contract services
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractServiceUnitsEntity.htm}
 */
export declare class ContractServiceUnits extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contractserviceunits
     * @param contractServiceUnits - The contractserviceunits data to create
     * @returns Promise with the created contractserviceunits
     */
    create(contractServiceUnits: IContractServiceUnits): Promise<ApiResponse<IContractServiceUnits>>;
    /**
     * Get a contractserviceunits by ID
     * @param id - The contractserviceunits ID
     * @returns Promise with the contractserviceunits data
     */
    get(id: number): Promise<ApiResponse<IContractServiceUnits>>;
    /**
     * Update a contractserviceunits
     * @param id - The contractserviceunits ID
     * @param contractServiceUnits - The updated contractserviceunits data
     * @returns Promise with the updated contractserviceunits
     */
    update(id: number, contractServiceUnits: Partial<IContractServiceUnits>): Promise<ApiResponse<IContractServiceUnits>>;
    /**
     * Partially update a contractserviceunits
     * @param id - The contractserviceunits ID
     * @param contractServiceUnits - The partial contractserviceunits data to update
     * @returns Promise with the updated contractserviceunits
     */
    patch(id: number, contractServiceUnits: Partial<IContractServiceUnits>): Promise<ApiResponse<IContractServiceUnits>>;
    /**
     * Delete a contractserviceunits
     * @param id - The contractserviceunits ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List contractserviceunits with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractserviceunits
     */
    list(query?: IContractServiceUnitsQuery): Promise<ApiResponse<IContractServiceUnits[]>>;
}
//# sourceMappingURL=contractserviceunits.d.ts.map