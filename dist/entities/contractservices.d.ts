import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContractServices {
    id?: number;
    [key: string]: any;
}
export interface IContractServicesQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContractServices entity class for Autotask API
 *
 * Services included in contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractServicesEntity.htm}
 */
export declare class ContractServices extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contractservices
     * @param contractServices - The contractservices data to create
     * @returns Promise with the created contractservices
     */
    create(contractServices: IContractServices): Promise<ApiResponse<IContractServices>>;
    /**
     * Get a contractservices by ID
     * @param id - The contractservices ID
     * @returns Promise with the contractservices data
     */
    get(id: number): Promise<ApiResponse<IContractServices>>;
    /**
     * Update a contractservices
     * @param id - The contractservices ID
     * @param contractServices - The updated contractservices data
     * @returns Promise with the updated contractservices
     */
    update(id: number, contractServices: Partial<IContractServices>): Promise<ApiResponse<IContractServices>>;
    /**
     * Partially update a contractservices
     * @param id - The contractservices ID
     * @param contractServices - The partial contractservices data to update
     * @returns Promise with the updated contractservices
     */
    patch(id: number, contractServices: Partial<IContractServices>): Promise<ApiResponse<IContractServices>>;
    /**
     * Delete a contractservices
     * @param id - The contractservices ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List contractservices with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractservices
     */
    list(query?: IContractServicesQuery): Promise<ApiResponse<IContractServices[]>>;
}
//# sourceMappingURL=contractservices.d.ts.map