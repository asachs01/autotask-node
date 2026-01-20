import { AxiosInstance } from 'axios';
import winston from 'winston';
import { MethodMetadata, ApiResponse, RequestHandler } from '../types';
import { BaseEntity } from './base';
export interface IContractBlocks {
    id?: number;
    [key: string]: any;
}
export interface IContractBlocksQuery {
    filter?: Record<string, any>;
    sort?: string;
    page?: number;
    pageSize?: number;
}
/**
 * ContractBlocks entity class for Autotask API
 *
 * Time blocks for contracts
 * Supported Operations: GET, POST, PATCH, PUT, DELETE
 * Category: contracts
 *
 * @see {@link https://www.autotask.net/help/DeveloperHelp/Content/APIs/REST/Entities/ContractBlocksEntity.htm}
 */
export declare class ContractBlocks extends BaseEntity {
    private readonly endpoint;
    constructor(axios: AxiosInstance, logger: winston.Logger, requestHandler?: RequestHandler);
    static getMetadata(): MethodMetadata[];
    /**
     * Create a new contractblocks
     * @param contractBlocks - The contractblocks data to create
     * @returns Promise with the created contractblocks
     */
    create(contractBlocks: IContractBlocks): Promise<ApiResponse<IContractBlocks>>;
    /**
     * Get a contractblocks by ID
     * @param id - The contractblocks ID
     * @returns Promise with the contractblocks data
     */
    get(id: number): Promise<ApiResponse<IContractBlocks>>;
    /**
     * Update a contractblocks
     * @param id - The contractblocks ID
     * @param contractBlocks - The updated contractblocks data
     * @returns Promise with the updated contractblocks
     */
    update(id: number, contractBlocks: Partial<IContractBlocks>): Promise<ApiResponse<IContractBlocks>>;
    /**
     * Partially update a contractblocks
     * @param id - The contractblocks ID
     * @param contractBlocks - The partial contractblocks data to update
     * @returns Promise with the updated contractblocks
     */
    patch(id: number, contractBlocks: Partial<IContractBlocks>): Promise<ApiResponse<IContractBlocks>>;
    /**
     * Delete a contractblocks
     * @param id - The contractblocks ID
     * @returns Promise that resolves when deletion is complete
     */
    delete(id: number): Promise<void>;
    /**
     * List contractblocks with optional filtering
     * @param query - Query parameters for filtering, sorting, and pagination
     * @returns Promise with array of contractblocks
     */
    list(query?: IContractBlocksQuery): Promise<ApiResponse<IContractBlocks[]>>;
}
//# sourceMappingURL=contractblocks.d.ts.map