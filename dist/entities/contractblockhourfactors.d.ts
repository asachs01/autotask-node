import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContractBlockHourFactors {
    id?: number;
    [key: string]: any;
}
export interface IContractBlockHourFactorsQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContractBlockHourFactors entity class for Autotask API
 *
 * Hour factors for contract blocks
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractBlockHourFactorsEntity.htm}
 */
export declare class ContractBlockHourFactors extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contractblockhourfactors
     * @param contractBlockHourFactors - The contractblockhourfactors data to create
     * @returns Promise with the created contractblockhourfactors
     */
    create(contractBlockHourFactors: IContractBlockHourFactors): Promise<ApiResponse<IContractBlockHourFactors>>;
    /**
     * Get a contractblockhourfactors by ID
     * @param id - The contractblockhourfactors ID
     * @returns Promise with the contractblockhourfactors data
     */
    get(id: number): Promise<ApiResponse<IContractBlockHourFactors>>;
    /**
     * Update a contractblockhourfactors
     * @param id - The contractblockhourfactors ID
     * @param contractBlockHourFactors - The updated contractblockhourfactors data
     * @returns Promise with the updated contractblockhourfactors
     */
    update(id: number, contractBlockHourFactors: Partial<IContractBlockHourFactors>): Promise<ApiResponse<IContractBlockHourFactors>>;
    /**
     * Partially update a contractblockhourfactors
     * @param id - The contractblockhourfactors ID
     * @param contractBlockHourFactors - The partial contractblockhourfactors data to update
     * @returns Promise with the updated contractblockhourfactors
     */
    patch(id: number, contractBlockHourFactors: Partial<IContractBlockHourFactors>): Promise<ApiResponse<IContractBlockHourFactors>>;
    /**
     * Delete a contractblockhourfactors
     * @param id - The contractblockhourfactors ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List contractblockhourfactors with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractblockhourfactors
     */
    list(query?: IContractBlockHourFactorsQuery): Promise<ApiResponse<IContractBlockHourFactors[]>>;
}
//# sourceMappingURL=contractblockhourfactors.d.ts.map