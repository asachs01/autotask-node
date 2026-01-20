import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContractRetainers {
    id?: number;
    [key: string]: any;
}
export interface IContractRetainersQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContractRetainers entity class for Autotask API
 *
 * Retainers for contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractRetainersEntity.htm}
 */
export declare class ContractRetainers extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contractretainers
     * @param contractRetainers - The contractretainers data to create
     * @returns Promise with the created contractretainers
     */
    create(contractRetainers: IContractRetainers): Promise<ApiResponse<IContractRetainers>>;
    /**
     * Get a contractretainers by ID
     * @param id - The contractretainers ID
     * @returns Promise with the contractretainers data
     */
    get(id: number): Promise<ApiResponse<IContractRetainers>>;
    /**
     * Update a contractretainers
     * @param id - The contractretainers ID
     * @param contractRetainers - The updated contractretainers data
     * @returns Promise with the updated contractretainers
     */
    update(id: number, contractRetainers: Partial<IContractRetainers>): Promise<ApiResponse<IContractRetainers>>;
    /**
     * Partially update a contractretainers
     * @param id - The contractretainers ID
     * @param contractRetainers - The partial contractretainers data to update
     * @returns Promise with the updated contractretainers
     */
    patch(id: number, contractRetainers: Partial<IContractRetainers>): Promise<ApiResponse<IContractRetainers>>;
    /**
     * Delete a contractretainers
     * @param id - The contractretainers ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List contractretainers with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractretainers
     */
    list(query?: IContractRetainersQuery): Promise<ApiResponse<IContractRetainers[]>>;
}
//# sourceMappingURL=contractretainers.d.ts.map