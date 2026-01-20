import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContractExclusionSets {
    id?: number;
    [key: string]: any;
}
export interface IContractExclusionSetsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContractExclusionSets entity class for Autotask API
 *
 * Sets of exclusions for contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractExclusionSetsEntity.htm}
 */
export declare class ContractExclusionSets extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contractexclusionsets
     * @param contractExclusionSets - The contractexclusionsets data to create
     * @returns Promise with the created contractexclusionsets
     */
    create(contractExclusionSets: IContractExclusionSets): Promise<ApiResponse<IContractExclusionSets>>;
    /**
     * Get a contractexclusionsets by ID
     * @param id - The contractexclusionsets ID
     * @returns Promise with the contractexclusionsets data
     */
    get(id: number): Promise<ApiResponse<IContractExclusionSets>>;
    /**
     * Update a contractexclusionsets
     * @param id - The contractexclusionsets ID
     * @param contractExclusionSets - The updated contractexclusionsets data
     * @returns Promise with the updated contractexclusionsets
     */
    update(id: number, contractExclusionSets: Partial<IContractExclusionSets>): Promise<ApiResponse<IContractExclusionSets>>;
    /**
     * Partially update a contractexclusionsets
     * @param id - The contractexclusionsets ID
     * @param contractExclusionSets - The partial contractexclusionsets data to update
     * @returns Promise with the updated contractexclusionsets
     */
    patch(id: number, contractExclusionSets: Partial<IContractExclusionSets>): Promise<ApiResponse<IContractExclusionSets>>;
    /**
     * Delete a contractexclusionsets
     * @param id - The contractexclusionsets ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List contractexclusionsets with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractexclusionsets
     */
    list(query?: IContractExclusionSetsQuery): Promise<ApiResponse<IContractExclusionSets[]>>;
}
//# sourceMappingURL=contractexclusionsets.d.ts.map