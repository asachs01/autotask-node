import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContractRoleCosts {
    id?: number;
    [key: string]: any;
}
export interface IContractRoleCostsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContractRoleCosts entity class for Autotask API
 *
 * Role costs for contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractRoleCostsEntity.htm}
 */
export declare class ContractRoleCosts extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contractrolecosts
     * @param contractRoleCosts - The contractrolecosts data to create
     * @returns Promise with the created contractrolecosts
     */
    create(contractRoleCosts: IContractRoleCosts): Promise<ApiResponse<IContractRoleCosts>>;
    /**
     * Get a contractrolecosts by ID
     * @param id - The contractrolecosts ID
     * @returns Promise with the contractrolecosts data
     */
    get(id: number): Promise<ApiResponse<IContractRoleCosts>>;
    /**
     * Update a contractrolecosts
     * @param id - The contractrolecosts ID
     * @param contractRoleCosts - The updated contractrolecosts data
     * @returns Promise with the updated contractrolecosts
     */
    update(id: number, contractRoleCosts: Partial<IContractRoleCosts>): Promise<ApiResponse<IContractRoleCosts>>;
    /**
     * Partially update a contractrolecosts
     * @param id - The contractrolecosts ID
     * @param contractRoleCosts - The partial contractrolecosts data to update
     * @returns Promise with the updated contractrolecosts
     */
    patch(id: number, contractRoleCosts: Partial<IContractRoleCosts>): Promise<ApiResponse<IContractRoleCosts>>;
    /**
     * Delete a contractrolecosts
     * @param id - The contractrolecosts ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List contractrolecosts with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractrolecosts
     */
    list(query?: IContractRoleCostsQuery): Promise<ApiResponse<IContractRoleCosts[]>>;
}
//# sourceMappingURL=contractrolecosts.d.ts.map